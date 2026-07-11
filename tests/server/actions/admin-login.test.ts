import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/admin/login/route'
import { __resetMemoryRateLimitStoreForTests } from '@/server/rate-limit'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}))

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function makeRequest(body: unknown, ip = '203.0.113.10') {
  return new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  }) as any
}

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    __resetMemoryRateLimitStoreForTests()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  afterEach(() => {
    __resetMemoryRateLimitStoreForTests()
  })

  it('returns 401 on bad credentials and locks after 5 failures', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Invalid login' },
        }),
        signOut: vi.fn(),
      },
    } as any)

    const email = 'admin@example.com'
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest({ email, password: 'wrong' }))
      expect(res.status).toBe(401)
    }

    const locked = await POST(makeRequest({ email, password: 'wrong' }))
    expect(locked.status).toBe(429)
    const body = await locked.json()
    expect(body.code).toBe('TOO_MANY_REQUESTS')
    expect(body.message).toMatch(/thử lại/i)
  })

  it('returns profile + session for valid admin', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'u1', email: 'admin@example.com' },
            session: { access_token: 'at', refresh_token: 'rt' },
          },
          error: null,
        }),
        signOut: vi.fn(),
      },
    } as any)

    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin', display_name: 'Boss', username: 'boss' },
            error: null,
          }),
        }),
      }),
    } as any)

    const res = await POST(
      makeRequest({ email: 'admin@example.com', password: 'secret12' })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.profile.role).toBe('admin')
    expect(body.data.profile.displayName).toBe('Boss')
    expect(body.data.session.access_token).toBe('at')
  })

  it('returns 403 for non-admin and does not lock on valid password', async () => {
    const signOut = vi.fn()
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            user: { id: 'u2', email: 'user@example.com' },
            session: { access_token: 'at', refresh_token: 'rt' },
          },
          error: null,
        }),
        signOut,
      },
    } as any)

    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'editor', display_name: 'Ed', username: 'ed' },
            error: null,
          }),
        }),
      }),
    } as any)

    for (let i = 0; i < 6; i++) {
      const res = await POST(
        makeRequest({ email: 'user@example.com', password: 'secret12' }, '198.51.100.2')
      )
      expect(res.status).toBe(403)
    }
    expect(signOut).toHaveBeenCalled()
  })

  it('validates body', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: '' }))
    expect(res.status).toBe(400)
  })
})
