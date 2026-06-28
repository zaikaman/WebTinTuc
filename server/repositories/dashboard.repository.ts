import { supabaseAdmin } from '@/lib/supabase/admin'
import { listTrendingArticles } from './article.repository'

async function countRows(table: 'articles' | 'categories' | 'ads', filters: (query: any) => any = (query) => query) {
  const { count, error } = await filters(supabaseAdmin.from(table).select('*', { count: 'exact', head: true }))
  if (error) throw error
  return count ?? 0
}

async function sumArticleViews(fromDate?: string) {
  let query = supabaseAdmin.from('article_stats_daily').select('views')
  if (fromDate) query = query.gte('date', fromDate)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).reduce((sum, row) => sum + Number(row.views ?? 0), 0)
}

async function getTopCategories(limit = 5) {
  // Count published, non-deleted articles per category
  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, slug, updated_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!categories || categories.length === 0) return []

  // For each category, count published articles
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabaseAdmin
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('status', 'published')
        .is('deleted_at', null)

      return { ...cat, article_count: count ?? 0 }
    })
  )

  return withCounts
    .sort((a, b) => b.article_count - a.article_count)
    .slice(0, limit)
}

async function getTopAds(limit = 5, days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: stats, error } = await supabaseAdmin
    .from('ad_stats_daily')
    .select('ad_id, impressions')
    .gte('date', since.toISOString().slice(0, 10))

  if (error) throw error
  if (!stats || stats.length === 0) return []

  // Aggregate impressions per ad
  const totals = new Map<number, number>()
  for (const row of stats) {
    totals.set(row.ad_id, (totals.get(row.ad_id) ?? 0) + Number(row.impressions ?? 0))
  }

  const topIds = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (topIds.length === 0) return []

  const { data: ads, error: adsError } = await supabaseAdmin
    .from('ads')
    .select('*')
    .in('id', topIds)

  if (adsError) throw adsError

  return topIds
    .map((id) => {
      const ad = ads?.find((a) => a.id === id)
      return ad ? { ...ad, impressions_7d: totals.get(id) ?? 0 } : null
    })
    .filter(Boolean)
}

export async function getDashboardStats() {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const week = new Date(now)
  week.setDate(now.getDate() - 7)
  const month = new Date(now)
  month.setDate(now.getDate() - 30)

  const [totalArticles, totalCategories, totalAds, totalViews, todayViews, weekViews, monthViews, topArticles, topCategories, topAds] =
    await Promise.all([
      countRows('articles', (query) => query.is('deleted_at', null)),
      countRows('categories', (query) => query.is('deleted_at', null)),
      countRows('ads', (query) => query.is('deleted_at', null)),
      sumArticleViews(),
      sumArticleViews(today),
      sumArticleViews(week.toISOString().slice(0, 10)),
      sumArticleViews(month.toISOString().slice(0, 10)),
      listTrendingArticles(10, 7),
      getTopCategories(5),
      getTopAds(5, 7)
    ])

  return {
    totalArticles,
    totalCategories,
    totalAds,
    totalViews,
    todayViews,
    weekViews,
    monthViews,
    topArticles,
    topCategories,
    topAds
  }
}

