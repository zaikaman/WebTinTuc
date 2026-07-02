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

export async function flushArticleViewsToPostgres(articleId: number, date: string, views: number) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('article_stats_daily')
    .select('views')
    .eq('article_id', articleId)
    .eq('date', date)
    .maybeSingle()

  if (existingError) throw existingError

  const { error } = await supabaseAdmin.from('article_stats_daily').upsert(
    {
      article_id: articleId,
      date,
      views: Number(existing?.views ?? 0) + views,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'article_id,date' }
  )

  if (error) throw error
  await incrementArticleViews(articleId, views)
}

export async function flushAdStatsToPostgres(adId: number, date: string, impressions: number, clicks: number) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('ad_stats_daily')
    .select('impressions, clicks')
    .eq('ad_id', adId)
    .eq('date', date)
    .maybeSingle()

  if (existingError) throw existingError

  const { error } = await supabaseAdmin.from('ad_stats_daily').upsert(
    {
      ad_id: adId,
      date,
      impressions: Number(existing?.impressions ?? 0) + impressions,
      clicks: Number(existing?.clicks ?? 0) + clicks,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'ad_id,date' }
  )

  if (error) throw error
}

