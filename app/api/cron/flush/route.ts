import { NextRequest } from 'next/server'
import { ok, fail, ApiError } from '@/server/http'
import { flushArticleViewsToPostgres, flushAdStatsToPostgres } from '@/server/services/analytics.service'

type RedisResult = { result: string | string[] | null }

async function redisCommand(command: (string | number)[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  const res = await fetch(`${url}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })

  if (!res.ok) return null
  const json = (await res.json()) as RedisResult
  return json.result
}

async function redisScan(pattern: string): Promise<string[]> {
  const keys: string[] = []
  let cursor = 0

  // SCAN cursor MATCH pattern COUNT 100
  // Upstash REST: GET /scan/{cursor}/match/{pattern}/count/100
  do {
    const result = await redisCommand(['SCAN', cursor, 'MATCH', pattern, 'COUNT', 100])
    if (!result || !Array.isArray(result) || result.length < 2) break

    cursor = Number(result[0])
    const batch = result[1]
    if (Array.isArray(batch)) {
      keys.push(...(batch as string[]))
    }
  } while (cursor !== 0)

  return keys
}

async function redisGet(key: string): Promise<number> {
  const val = await redisCommand(['GET', key])
  return val ? Number(val) : 0
}

async function redisDel(key: string) {
  await redisCommand(['DEL', key])
}

// Pattern: views:article:{id}:{YYYY-MM-DD}
function parseArticleViewKey(key: string) {
  const parts = key.split(':')
  if (parts.length !== 4) return null
  const articleId = Number(parts[2])
  const date = parts[3]
  if (!articleId || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return null
  return { articleId, date }
}

// Pattern: impressions:ad:{id}:{YYYY-MM-DD}
function parseAdImpressionKey(key: string) {
  const parts = key.split(':')
  if (parts.length !== 4) return null
  const adId = Number(parts[2])
  const date = parts[3]
  if (!adId || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return null
  return { adId, date }
}

// Pattern: clicks:ad:{id}:{YYYY-MM-DD}
function parseAdClickKey(key: string) {
  const parts = key.split(':')
  if (parts.length !== 4) return null
  const adId = Number(parts[2])
  const date = parts[3]
  if (!adId || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return null
  return { adId, date }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const secret = process.env.CRON_SECRET
    const authHeader = request.headers.get('authorization')

    if (secret) {
      if (authHeader !== `Bearer ${secret}`) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Invalid cron secret')
      }
    }

    let flushedArticles = 0
    let flushedAds = 0
    const errors: string[] = []

    // --- Flush article views ---
    const articleViewKeys = await redisScan('views:article:*:????-??-??')

    for (const key of articleViewKeys) {
      const parsed = parseArticleViewKey(key)
      if (!parsed) continue

      try {
        const count = await redisGet(key)
        if (count > 0) {
          await flushArticleViewsToPostgres(parsed.articleId, parsed.date, count)
          await redisDel(key)
          flushedArticles++
        }
      } catch (err) {
        errors.push(`article key ${key}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Also flush total view counters (views:article:{id}:total) — these are handled
    // inside flushArticleViewsToPostgres already via incrementArticleViews, so no separate flush needed.

    // --- Flush ad impressions ---
    const adImpressionKeys = await redisScan('impressions:ad:*:????-??-??')
    // Group by (adId, date) since we may have both impression + click keys
    const adStats = new Map<string, { adId: number; date: string; impressions: number; clicks: number }>()

    for (const key of adImpressionKeys) {
      const parsed = parseAdImpressionKey(key)
      if (!parsed) continue

      try {
        const count = await redisGet(key)
        const mapKey = `${parsed.adId}:${parsed.date}`
        const existing = adStats.get(mapKey) ?? { adId: parsed.adId, date: parsed.date, impressions: 0, clicks: 0 }
        existing.impressions += count
        adStats.set(mapKey, existing)
        await redisDel(key)
      } catch (err) {
        errors.push(`impression key ${key}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // --- Flush ad clicks ---
    const adClickKeys = await redisScan('clicks:ad:*:????-??-??')

    for (const key of adClickKeys) {
      const parsed = parseAdClickKey(key)
      if (!parsed) continue

      try {
        const count = await redisGet(key)
        const mapKey = `${parsed.adId}:${parsed.date}`
        const existing = adStats.get(mapKey) ?? { adId: parsed.adId, date: parsed.date, impressions: 0, clicks: 0 }
        existing.clicks += count
        adStats.set(mapKey, existing)
        await redisDel(key)
      } catch (err) {
        errors.push(`click key ${key}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Write ad stats to Postgres
    for (const { adId, date, impressions, clicks } of adStats.values()) {
      try {
        await flushAdStatsToPostgres(adId, date, impressions, clicks)
        flushedAds++
      } catch (err) {
        errors.push(`ad flush ${adId}/${date}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // --- Flush page views (total site traffic) ---
    // Key pattern: page:views:{YYYY-MM-DD}
    let flushedPageDays = 0
    const pageViewKeys = await redisScan('page:views:????-??-??')

    for (const key of pageViewKeys) {
      const parts = key.split(':')
      const date = parts[2]
      if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) continue

      try {
        const pageViews = await redisGet(key)
        if (pageViews > 0) {
          const { supabaseAdmin } = await import('@/lib/supabase/admin')
          await supabaseAdmin
            .from('page_stats_daily')
            .upsert(
              { date, page_views: pageViews, updated_at: new Date().toISOString() },
              { onConflict: 'date', ignoreDuplicates: false }
            )
          await redisDel(key)
          flushedPageDays++
        }
      } catch (err) {
        errors.push(`page_stats flush ${date}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    return ok({
      flushedArticles,
      flushedAds,
      flushedPageDays,
      errors,
      flushedAt: new Date().toISOString()
    })
  } catch (error) {
    return fail(error)
  }
}
