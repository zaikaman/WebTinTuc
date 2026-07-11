import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError, fail, ok, parseBody } from '@/server/http'
import { adminLoginSchema } from '@/server/validations/admin-account.schema'
import {
  checkAuthRateLimit,
  getRateLimitCount,
  getRateLimitKey,
  getRateLimitTtl,
  normalizeEmailKey,
  resetRateLimit,
} from '@/server/rate-limit'

/**
 * Admin login with app-level throttling + lockout.
 *
 * Limits (feel free to tune):
 * - 20 attempts per IP per 15 minutes (flood / spray protection)
 * - 5 failed attempts per email+IP per 15 minutes → lockout for remaining window
 *
 * Supabase Auth also has its own dashboard rate limits — enable/tighten those
 * under Authentication → Rate Limits (defense in depth; clients can still call
 * Supabase Auth directly with the anon key).
 */
const LOGIN_IP_MAX = 20
const LOGIN_IP_WINDOW_SECS = 15 * 60
const LOGIN_FAIL_MAX = 5
const LOGIN_FAIL_WINDOW_SECS = 15 * 60

function formatRetryMessage(resetAfterSecs?: number): string {
  if (!resetAfterSecs || resetAfterSecs <= 0) {
    return 'Quá nhiều lần thử. Vui lòng thử lại sau.'
  }
  const mins = Math.max(1, Math.ceil(resetAfterSecs / 60))
  return `Quá nhiều lần thử. Vui lòng thử lại sau khoảng ${mins} phút.`
}

function failureKey(ipKey: string, email: string): string {
  return `${ipKey}:email:${normalizeEmailKey(email)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, adminLoginSchema)
    const email = body.email.trim()
    const password = body.password

    const ipKey = getRateLimitKey(request.headers, 'admin-login')
    const failKey = failureKey(ipKey, email)

    // 1) Overall IP throttle (every attempt counts)
    const ipLimit = await checkAuthRateLimit(ipKey, LOGIN_IP_MAX, LOGIN_IP_WINDOW_SECS)
    if (!ipLimit.allowed) {
      throw new ApiError(429, 'TOO_MANY_REQUESTS', formatRetryMessage(ipLimit.resetAfterSecs), {
        resetAfterSecs: ipLimit.resetAfterSecs,
      })
    }

    // 2) Lockout after N failures for this email+IP
    const priorFailures = await getRateLimitCount(failKey)
    if (priorFailures >= LOGIN_FAIL_MAX) {
      const ttl = await getRateLimitTtl(failKey)
      throw new ApiError(429, 'TOO_MANY_REQUESTS', formatRetryMessage(ttl || LOGIN_FAIL_WINDOW_SECS), {
        resetAfterSecs: ttl || LOGIN_FAIL_WINDOW_SECS,
        locked: true,
      })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user || !data.session) {
      const failLimit = await checkAuthRateLimit(failKey, LOGIN_FAIL_MAX, LOGIN_FAIL_WINDOW_SECS)
      if (!failLimit.allowed) {
        throw new ApiError(
          429,
          'TOO_MANY_REQUESTS',
          formatRetryMessage(failLimit.resetAfterSecs || LOGIN_FAIL_WINDOW_SECS),
          {
            resetAfterSecs: failLimit.resetAfterSecs || LOGIN_FAIL_WINDOW_SECS,
            locked: true,
          }
        )
      }
      const remaining = failLimit.remaining
      const hint =
        remaining <= 2 && remaining > 0
          ? ` Còn ${remaining} lần thử trước khi tạm khóa.`
          : ''
      throw new ApiError(401, 'UNAUTHORIZED', `Email hoặc mật khẩu không chính xác!${hint}`)
    }

    // 3) Admin role gate
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, display_name, username')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      try {
        await supabase.auth.signOut()
      } catch {
        // ignore
      }
      // Valid credentials but not admin — do not burn lockout budget
      throw new ApiError(403, 'FORBIDDEN', 'Tài khoản này không có quyền quản trị!')
    }

    // 4) Clear failure lockout on success
    await resetRateLimit(failKey)

    const displayName =
      profile.display_name?.trim() ||
      profile.username?.trim() ||
      data.user.email?.split('@')[0] ||
      'Admin'
    const username = profile.username?.trim() || data.user.email || 'admin'
    const initials =
      displayName
        .split(/\s+/)
        .map((p: string) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AD'

    return ok({
      profile: {
        id: data.user.id,
        email: data.user.email || email,
        displayName,
        username,
        role: profile.role as string,
        initials,
      },
      // Client setSession for reliable browser session sync with @supabase/ssr cookies
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    })
  } catch (error) {
    return fail(error)
  }
}
