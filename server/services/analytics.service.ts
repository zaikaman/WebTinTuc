import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'
import { incrementArticleViews } from '@/server/repositories/article.repository'

type RedisCommand = (string | number)[]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

async function redis(command: RedisCommand) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  const response = await fetch(`${url}/${command.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new ApiError(500, 'INTERNAL_ERROR', 'Không thể ghi analytics vào Upstash Redis')
  }

  return response.json()
}

export async function recordArticleView(articleId: number) {
  const date = todayKey()
  const wroteRedis = await redis(['INCR', `views:article:${articleId}:${date}`])

  if (!wroteRedis) {
    await flushArticleViewsToPostgres(articleId, date, 1)
  }

  return { articleId, date, buffered: Boolean(wroteRedis) }
}

export async function recordAdImpression(adId: number) {
  const date = todayKey()
  const wroteRedis = await redis(['INCR', `impressions:ad:${adId}:${date}`])
  if (!wroteRedis) await flushAdStatsToPostgres(adId, date, 1, 0)
  return { adId, date, buffered: Boolean(wroteRedis) }
}

export async function recordAdClick(adId: number) {
  const date = todayKey()
  const wroteRedis = await redis(['INCR', `clicks:ad:${adId}:${date}`])
  if (!wroteRedis) await flushAdStatsToPostgres(adId, date, 0, 1)
  return { adId, date, buffered: Boolean(wroteRedis) }
}

/** Site-wide page view (buffered in Redis as page:views:YYYY-MM-DD). */
export async function recordPageView() {
  const date = todayKey()
  const wroteRedis = await redis(['INCR', `page:views:${date}`])
  if (!wroteRedis) await flushPageViewsToPostgres(date, 1)
  return { date, buffered: Boolean(wroteRedis) }
}

/**
 * Atomically increment article_stats_daily.views and articles.views.
 * Safe under concurrent flushes (SQL ON CONFLICT DO UPDATE).
 */
export async function flushArticleViewsToPostgres(articleId: number, date: string, views: number) {
  if (views <= 0) return

  const { error } = await supabaseAdmin.rpc('increment_article_stats_daily', {
    p_article_id: articleId,
    p_date: date,
    p_views: views
  })

  if (error) throw error
  await incrementArticleViews(articleId, views)
}

/**
 * Atomically increment ad_stats_daily impressions/clicks.
 * Safe under concurrent flushes (SQL ON CONFLICT DO UPDATE).
 */
export async function flushAdStatsToPostgres(
  adId: number,
  date: string,
  impressions: number,
  clicks: number
) {
  if (impressions <= 0 && clicks <= 0) return

  const { error } = await supabaseAdmin.rpc('increment_ad_stats_daily', {
    p_ad_id: adId,
    p_date: date,
    p_impressions: Math.max(0, impressions),
    p_clicks: Math.max(0, clicks)
  })

  if (error) throw error
}

/**
 * Atomically add to page_stats_daily.page_views (never overwrite absolute totals).
 */
export async function flushPageViewsToPostgres(date: string, pageViews: number) {
  if (pageViews <= 0) return

  const { error } = await supabaseAdmin.rpc('increment_page_stats_daily', {
    p_date: date,
    p_page_views: pageViews
  })

  if (error) throw error
}
