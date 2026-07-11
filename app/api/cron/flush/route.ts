import { NextRequest } from 'next/server'
import { ok, fail, ApiError } from '@/server/http'
import {
  flushArticleViewsToPostgres,
  flushAdStatsToPostgres,
  flushPageViewsToPostgres
} from '@/server/services/analytics.service'

type RedisResult = { result: string | string[] | number | null }

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

/**
 * Atomically read and clear a counter. Callers must restore via INCRBY on Postgres failure
 * so concurrent flushes cannot double-count and failed writes do not drop data.
 */
async function redisGetDel(key: string): Promise<number> {
  const val = await redisCommand(['GETDEL', key])
  return val != null && val !== '' ? Number(val) : 0
}

async function redisIncrBy(key: string, amount: number) {
  if (amount <= 0) return
  await redisCommand(['INCRBY', key, amount])
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
    // GETDEL then Postgres; restore Redis on failure (never delete-before-write).
    const articleViewKeys = await redisScan('views:article:*:????-??-??')

    for (const key of articleViewKeys) {
      const parsed = parseArticleViewKey(key)
      if (!parsed) continue

      let count = 0
      try {
        count = await redisGetDel(key)
        if (count > 0) {
          await flushArticleViewsToPostgres(parsed.articleId, parsed.date, count)
          flushedArticles++
        }
      } catch (err) {
        if (count > 0) {
          try {
            await redisIncrBy(key, count)
          } catch {
            errors.push(`article key ${key}: failed to restore Redis after Postgres error`)
          }
        }
        errors.push(`article key ${key}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Lifetime article.views is updated inside flushArticleViewsToPostgres via incrementArticleViews.

    // --- Flush ad impressions + clicks ---
    // Collect with GETDEL, write once per (adId, date), restore all taken counters on failure.
    type AdFlushBucket = {
      adId: number
      date: string
      impressions: number
      clicks: number
      restores: { key: string; amount: number }[]
    }
    const adStats = new Map<string, AdFlushBucket>()

    const adImpressionKeys = await redisScan('impressions:ad:*:????-??-??')

    for (const key of adImpressionKeys) {
      const parsed = parseAdImpressionKey(key)
      if (!parsed) continue

      try {
        const count = await redisGetDel(key)
        if (count <= 0) continue

        const mapKey = `${parsed.adId}:${parsed.date}`
        const existing =
          adStats.get(mapKey) ?? {
            adId: parsed.adId,
            date: parsed.date,
            impressions: 0,
            clicks: 0,
            restores: []
          }
        existing.impressions += count
        existing.restores.push({ key, amount: count })
        adStats.set(mapKey, existing)
      } catch (err) {
        errors.push(`impression key ${key}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const adClickKeys = await redisScan('clicks:ad:*:????-??-??')

    for (const key of adClickKeys) {
      const parsed = parseAdClickKey(key)
      if (!parsed) continue

      try {
        const count = await redisGetDel(key)
        if (count <= 0) continue

        const mapKey = `${parsed.adId}:${parsed.date}`
        const existing =
          adStats.get(mapKey) ?? {
            adId: parsed.adId,
            date: parsed.date,
            impressions: 0,
            clicks: 0,
            restores: []
          }
        existing.clicks += count
        existing.restores.push({ key, amount: count })
        adStats.set(mapKey, existing)
      } catch (err) {
        errors.push(`click key ${key}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    for (const bucket of adStats.values()) {
      const { adId, date, impressions, clicks, restores } = bucket
      try {
        await flushAdStatsToPostgres(adId, date, impressions, clicks)
        flushedAds++
      } catch (err) {
        for (const { key, amount } of restores) {
          try {
            await redisIncrBy(key, amount)
          } catch {
            errors.push(`ad ${adId}/${date}: failed to restore Redis key ${key}`)
          }
        }
        errors.push(`ad flush ${adId}/${date}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // --- Flush page views (total site traffic) ---
    // Key pattern: page:views:{YYYY-MM-DD} — written by recordPageView()
    let flushedPageDays = 0
    const pageViewKeys = await redisScan('page:views:????-??-??')

    for (const key of pageViewKeys) {
      const parts = key.split(':')
      const date = parts[2]
      if (!date?.match(/^\d{4}-\d{2}-\d{2}$/)) continue

      let pageViews = 0
      try {
        pageViews = await redisGetDel(key)
        if (pageViews > 0) {
          await flushPageViewsToPostgres(date, pageViews)
          flushedPageDays++
        }
      } catch (err) {
        if (pageViews > 0) {
          try {
            await redisIncrBy(key, pageViews)
          } catch {
            errors.push(`page_stats flush ${date}: failed to restore Redis after Postgres error`)
          }
        }
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
