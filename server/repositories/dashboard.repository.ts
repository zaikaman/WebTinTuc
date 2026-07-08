import { supabaseAdmin } from '@/lib/supabase/admin'
import { listTrendingArticles } from './article.repository'

type ActivityRecord = {
  type: 'article' | 'ad' | 'category'
  title: string
  status?: string
  createdAt: string
}

async function countRows(table: 'articles' | 'categories' | 'ads', filters: (query: any) => any = (query) => query) {
  const { count, error } = await filters(supabaseAdmin.from(table).select('*', { count: 'exact', head: true }))
  if (error) throw error
  return count ?? 0
}

async function getTopCategories(limit = 5) {
  // Check if view exists by trying to select from it
  try {
    const { data, error } = await supabaseAdmin
      .from('view_top_categories')
      .select('*')
      .limit(limit)
    if (!error && data && data.length > 0) {
      return data
    }
  } catch (e) {
    // view doesn't exist, fallback
  }

  // Fallback: single optimized query using PostgREST relation count (no N+1 queries!)
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, slug, updated_at, articles(count)')
    .is('deleted_at', null)
    .eq('articles.status', 'published')
    .is('articles.deleted_at', null)

  if (error) throw error
  if (!data) return []

  return data
    .map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      updated_at: cat.updated_at,
      article_count: cat.articles?.[0]?.count ?? 0
    }))
    .sort((a: any, b: any) => b.article_count - a.article_count)
    .slice(0, limit)
}

async function getTopAds(limit = 5, days = 7) {
  // Check if view exists (dashboard only queries 7 days)
  if (days === 7) {
    try {
      const { data, error } = await supabaseAdmin
        .from('view_top_ads_7d')
        .select('*')
        .limit(limit)
      if (!error && data && data.length > 0) {
        return data
      }
    } catch (e) {
      // view doesn't exist, fallback
    }
  }

  // Fallback: server-side aggregation via RPC
  const { data: topStats, error } = await supabaseAdmin
    .rpc('get_top_ads', {
      p_limit: limit,
      p_days: days
    })

  if (error) throw error
  if (!topStats || topStats.length === 0) return []

  const ids = topStats.map((row: { ad_id: number }) => row.ad_id)

  const { data: ads, error: adsError } = await supabaseAdmin
    .from('ads')
    .select('*')
    .in('id', ids)

  if (adsError) throw adsError

  // Build a map for O(1) lookups instead of Array.find()
  const adMap = new Map<number, NonNullable<typeof ads>[number]>()
  for (const ad of ads ?? []) {
    adMap.set(ad.id, ad)
  }

  return topStats
    .map((row: { ad_id: number; total_impressions: number }) => {
      const ad = adMap.get(row.ad_id)
      return ad ? { ...ad, impressions_7d: row.total_impressions } : null
    })
    .filter(Boolean)
}

export async function getDashboardStats() {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  
  const yesterdayDate = new Date(now)
  yesterdayDate.setDate(now.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().slice(0, 10)

  const weekDate = new Date(now)
  weekDate.setDate(now.getDate() - 7)
  const weekStart = weekDate.toISOString().slice(0, 10)

  const prevWeekDate = new Date(now)
  prevWeekDate.setDate(now.getDate() - 14)
  const prevWeekStart = prevWeekDate.toISOString().slice(0, 10)

  const monthDate = new Date(now)
  monthDate.setDate(now.getDate() - 30)
  const monthStart = monthDate.toISOString().slice(0, 10)

  const prevMonthDate = new Date(now)
  prevMonthDate.setDate(now.getDate() - 60)
  const prevMonthStart = prevMonthDate.toISOString().slice(0, 10)

  // Try to use the unified view_dashboard_metrics for extreme efficiency (1 query instead of 20+)
  let metrics: any = null
  try {
    const { data, error } = await supabaseAdmin
      .from('view_dashboard_metrics')
      .select('*')
      .maybeSingle()
    
    if (!error && data) {
      metrics = data
    }
  } catch (e) {
    // view doesn't exist, fallback
  }

  // Define values to be populated
  let totalArticles = 0
  let totalCategories = 0
  let totalAds = 0
  let totalViews = 0
  let totalClicks = 0
  let todayViews = 0
  let yesterdayViews = 0
  let todayClicks = 0
  let yesterdayClicks = 0
  let weekViews = 0
  let prevWeekViews = 0
  let weekClicks = 0
  let prevWeekClicks = 0
  let monthViews = 0
  let prevMonthViews = 0
  let monthClicks = 0
  let prevMonthClicks = 0

  let latestArticles: any = { data: null }
  let latestAds: any = { data: null }
  let latestCategories: any = { data: null }
  let topArticles: any[] = []
  let topCategories: any[] = []
  let topAds: any[] = []

  if (metrics) {
    // Populate stats from view
    totalArticles = metrics.total_articles
    totalCategories = metrics.total_categories
    totalAds = metrics.total_ads
    totalViews = Number(metrics.total_views)
    totalClicks = Number(metrics.total_clicks)
    todayViews = Number(metrics.today_views)
    yesterdayViews = Number(metrics.yesterday_views)
    todayClicks = Number(metrics.today_clicks)
    yesterdayClicks = Number(metrics.yesterday_clicks)
    weekViews = Number(metrics.week_views)
    prevWeekViews = Number(metrics.prev_week_views)
    weekClicks = Number(metrics.week_clicks)
    prevWeekClicks = Number(metrics.prev_week_clicks)
    monthViews = Number(metrics.month_views)
    prevMonthViews = Number(metrics.prev_month_views)
    monthClicks = Number(metrics.month_clicks)
    prevMonthClicks = Number(metrics.prev_month_clicks)

    // Parallel fetch remaining lists/activities (6 queries total)
    const [
      topArt,
      topCat,
      topAd,
      latArt,
      latAd,
      latCat
    ] = await Promise.all([
      listTrendingArticles(5, 7),
      getTopCategories(5),
      getTopAds(5, 7),
      supabaseAdmin.from('articles').select('id, title, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('ads').select('id, name, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('categories').select('id, name, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(5)
    ])
    topArticles = topArt
    topCategories = topCat
    topAds = topAd
    latestArticles = latArt
    latestAds = latAd
    latestCategories = latCat
  } else {
    // FALLBACK IMPLEMENTATION (Optimized: 13 queries total instead of 20+ queries)
    // 1. Fetch metadata counts in parallel with recent activities and lists
    const [
      countArt,
      countCat,
      countAd,
      topArt,
      topCat,
      topAd,
      latArt,
      latAd,
      latCat,
      // Fetch all article stats from last 60 days in exactly 1 query to avoid N queries
      articleStatsData,
      // Fetch all ad stats from last 60 days in exactly 1 query to avoid N queries
      adStatsData,
      // Fetch all-time totals
      allTimeArticleStats,
      allTimeAdStats
    ] = await Promise.all([
      countRows('articles', (query) => query.is('deleted_at', null)),
      countRows('categories', (query) => query.is('deleted_at', null)),
      countRows('ads', (query) => query.is('deleted_at', null)),
      listTrendingArticles(5, 7),
      getTopCategories(5),
      getTopAds(5, 7),
      supabaseAdmin.from('articles').select('id, title, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('ads').select('id, name, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('categories').select('id, name, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('article_stats_daily').select('date, views').gte('date', prevMonthStart),
      supabaseAdmin.from('ad_stats_daily').select('date, clicks').gte('date', prevMonthStart),
      supabaseAdmin.from('article_stats_daily').select('views'),
      supabaseAdmin.from('ad_stats_daily').select('clicks')
    ])

    totalArticles = countArt
    totalCategories = countCat
    totalAds = countAd
    topArticles = topArt
    topCategories = topCat
    topAds = topAd
    latestArticles = latArt
    latestAds = latAd
    latestCategories = latCat

    // Compute all-time sums
    totalViews = (allTimeArticleStats.data ?? []).reduce((sum, row) => sum + Number(row.views ?? 0), 0)
    totalClicks = (allTimeAdStats.data ?? []).reduce((sum, row) => sum + Number(row.clicks ?? 0), 0)

    // Compute daily stats ranges in JS from the 60-day query data (saves 12+ SQL queries!)
    const articleStats = articleStatsData.data ?? []
    for (const row of articleStats) {
      const date = row.date
      const views = Number(row.views ?? 0)

      if (date === today) todayViews += views
      if (date >= yesterday && date < today) yesterdayViews += views
      if (date >= weekStart) weekViews += views
      if (date >= prevWeekStart && date < weekStart) prevWeekViews += views
      if (date >= monthStart) monthViews += views
      if (date >= prevMonthStart && date < monthStart) prevMonthViews += views
    }

    const adStats = adStatsData.data ?? []
    for (const row of adStats) {
      const date = row.date
      const clicks = Number(row.clicks ?? 0)

      if (date === today) todayClicks += clicks
      if (date >= yesterday && date < today) yesterdayClicks += clicks
      if (date >= weekStart) weekClicks += clicks
      if (date >= prevWeekStart && date < weekStart) prevWeekClicks += clicks
      if (date >= monthStart) monthClicks += clicks
      if (date >= prevMonthStart && date < monthStart) prevMonthClicks += clicks
    }
  }

  const activities: ActivityRecord[] = []
  if (latestArticles.data) {
    latestArticles.data.forEach((a: any) => {
      activities.push({
        type: 'article',
        title: a.title,
        status: a.status === 'published' ? 'Đã đăng' : 'Nháp',
        createdAt: a.created_at
      })
    })
  }
  if (latestAds.data) {
    latestAds.data.forEach((a: any) => {
      activities.push({
        type: 'ad',
        title: a.name,
        status: a.status === 'active' ? 'Hoạt động' : 'Tắt',
        createdAt: a.created_at
      })
    })
  }
  if (latestCategories.data) {
    latestCategories.data.forEach((c: any) => {
      activities.push({
        type: 'category',
        title: c.name,
        createdAt: c.created_at
      })
    })
  }

  const recentActivities = activities
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return {
    totalArticles,
    totalCategories,
    totalAds,
    totalViews,
    totalClicks,

    todayViews,
    yesterdayViews,
    todayClicks,
    yesterdayClicks,

    weekViews,
    prevWeekViews,
    weekClicks,
    prevWeekClicks,

    monthViews,
    prevMonthViews,
    monthClicks,
    prevMonthClicks,

    topArticles,
    topCategories,
    topAds,
    recentActivities
  }
}


