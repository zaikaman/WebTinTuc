import { supabaseAdmin } from '@/lib/supabase/admin'
import { unstable_cache } from 'next/cache'

type ActivityRecord = {
  type: 'article' | 'ad' | 'category'
  title: string
  status?: string
  createdAt: string
}

// Cache TTLs (in seconds)
const STATS_CACHE_TTL = 300    // 5 minutes for dashboard stats
const TOP_CACHE_TTL = 300      // 5 minutes for top lists
const ACTIVITY_CACHE_TTL = 120 // 2 minutes for recent activities

/**
 * Period date computation (unchanged from original)
 */
function getPeriodDates(filters?: {
  timeFilter?: 'today' | 'week' | 'month' | 'year' | undefined
  day?: string | undefined
  month?: string | undefined
  year?: string | undefined
}) {
  const now = new Date()
  let startDateStr = ''
  let endDateStr = now.toISOString().slice(0, 10)
  
  let prevStartDateStr = ''
  let prevEndDateStr = ''

  const hasCustomFilter = !!(filters?.day || filters?.month || filters?.year)

  if (hasCustomFilter) {
    const year = filters?.year || String(now.getFullYear())
    const month = filters?.month || ''
    const day = filters?.day || ''

    if (day && month) {
      const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      startDateStr = dateStr
      endDateStr = dateStr

      const targetDate = new Date(dateStr)
      const prevDate = new Date(targetDate)
      prevDate.setDate(targetDate.getDate() - 1)
      prevStartDateStr = prevDate.toISOString().slice(0, 10)
      prevEndDateStr = prevStartDateStr
    } else if (month) {
      startDateStr = `${year}-${month.padStart(2, '0')}-01`
      const lastDay = new Date(Number(year), Number(month), 0).getDate()
      endDateStr = `${year}-${month.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

      const prevMonth = Number(month) - 1
      const prevYear = prevMonth === 0 ? Number(year) - 1 : Number(year)
      const prevMonthNorm = prevMonth === 0 ? 12 : prevMonth
      startDateStr = `${year}-${month.padStart(2, '0')}-01`
      prevStartDateStr = `${prevYear}-${String(prevMonthNorm).padStart(2, '0')}-01`
      const prevLastDay = new Date(prevYear, prevMonthNorm, 0).getDate()
      prevEndDateStr = `${prevYear}-${String(prevMonthNorm).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`
    } else {
      startDateStr = `${year}-01-01`
      endDateStr = `${year}-12-31`

      prevStartDateStr = `${Number(year) - 1}-01-01`
      prevEndDateStr = `${Number(year) - 1}-12-31`
    }
  } else {
    const timeFilter = filters?.timeFilter || 'month'
    if (timeFilter === 'today') {
      const today = now.toISOString().slice(0, 10)
      startDateStr = today
      endDateStr = today

      const yesterdayDate = new Date(now)
      yesterdayDate.setDate(now.getDate() - 1)
      prevStartDateStr = yesterdayDate.toISOString().slice(0, 10)
      prevEndDateStr = prevStartDateStr
    } else if (timeFilter === 'week') {
      const weekDate = new Date(now)
      weekDate.setDate(now.getDate() - 6)
      startDateStr = weekDate.toISOString().slice(0, 10)
      endDateStr = now.toISOString().slice(0, 10)

      const prevWeekDate = new Date(weekDate)
      prevWeekDate.setDate(weekDate.getDate() - 7)
      prevStartDateStr = prevWeekDate.toISOString().slice(0, 10)
      
      const prevWeekEnd = new Date(weekDate)
      prevWeekEnd.setDate(weekDate.getDate() - 1)
      prevEndDateStr = prevWeekEnd.toISOString().slice(0, 10)
    } else if (timeFilter === 'month') {
      const monthDate = new Date(now)
      monthDate.setDate(now.getDate() - 29)
      startDateStr = monthDate.toISOString().slice(0, 10)
      endDateStr = now.toISOString().slice(0, 10)

      const prevMonthDate = new Date(monthDate)
      prevMonthDate.setDate(monthDate.getDate() - 30)
      prevStartDateStr = prevMonthDate.toISOString().slice(0, 10)

      const prevMonthEnd = new Date(monthDate)
      prevMonthEnd.setDate(monthDate.getDate() - 1)
      prevEndDateStr = prevMonthEnd.toISOString().slice(0, 10)
    } else {
      const yearStart = `${now.getFullYear()}-01-01`
      startDateStr = yearStart
      endDateStr = now.toISOString().slice(0, 10)

      prevStartDateStr = `${now.getFullYear() - 1}-01-01`
      prevEndDateStr = `${now.getFullYear() - 1}-12-31`
    }
  }

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    prevStartDate: prevStartDateStr,
    prevEndDate: prevEndDateStr,
    hasCustomFilter
  }
}

// ============================================================
// CACHED QUERIES
// ============================================================

/**
 * Fetch base metrics from the pre-computed view_dashboard_metrics.
 * This single view replaces 7+ individual count/stat queries.
 */
const getBaseMetricsCached = unstable_cache(
  async () => {
    const { data, error } = await supabaseAdmin
      .from('view_dashboard_metrics')
      .select('*')
      .single()

    if (error) {
      // Fallback: compute metrics manually if view doesn't exist
      console.warn('view_dashboard_metrics not available, falling back to manual queries')
      return null
    }
    return data as {
      total_articles: number
      total_categories: number
      total_ads: number
      total_views: number
      total_clicks: number
      today_views: number
      yesterday_views: number
      today_clicks: number
      yesterday_clicks: number
      week_views: number
      prev_week_views: number
      week_clicks: number
      prev_week_clicks: number
      month_views: number
      prev_month_views: number
      month_clicks: number
      prev_month_clicks: number
    } | null
  },
  ['dashboard-base-metrics'],
  { revalidate: STATS_CACHE_TTL, tags: ['dashboard'] }
)

/**
 * Get period-specific article and ad stats from daily tables.
 * Only queries the date range needed (narrower than full table scan).
 */
const getPeriodStatsCached = unstable_cache(
  async (startDate: string, endDate: string, prevStartDate: string, prevEndDate: string) => {
    const [articleStatsResult, adStatsResult] = await Promise.all([
      supabaseAdmin.from('article_stats_daily').select('date, views').gte('date', prevStartDate).lte('date', endDate),
      supabaseAdmin.from('ad_stats_daily').select('date, clicks').gte('date', prevStartDate).lte('date', endDate)
    ])

    const articleStats = articleStatsResult.data ?? []
    const adStats = adStatsResult.data ?? []

    // Aggregate article views
    let todayViews = 0, yesterdayViews = 0, weekViews = 0, prevWeekViews = 0
    let monthViews = 0, prevMonthViews = 0, totalViews = 0, prevYearViews = 0

    for (const row of articleStats) {
      const date = row.date
      const views = Number(row.views ?? 0)
      if (date === endDate) todayViews += views
      if (date === prevEndDate) yesterdayViews += views
      if (date >= startDate && date <= endDate) {
        weekViews += views; monthViews += views; totalViews += views
      } else if (date >= prevStartDate && date <= prevEndDate) {
        prevWeekViews += views; prevMonthViews += views; prevYearViews += views
      }
    }

    // Aggregate ad clicks
    let todayClicks = 0, yesterdayClicks = 0, weekClicks = 0, prevWeekClicks = 0
    let monthClicks = 0, prevMonthClicks = 0, totalClicks = 0, prevYearClicks = 0

    for (const row of adStats) {
      const date = row.date
      const clicks = Number(row.clicks ?? 0)
      if (date === endDate) todayClicks += clicks
      if (date === prevEndDate) yesterdayClicks += clicks
      if (date >= startDate && date <= endDate) {
        weekClicks += clicks; monthClicks += clicks; totalClicks += clicks
      } else if (date >= prevStartDate && date <= prevEndDate) {
        prevWeekClicks += clicks; prevMonthClicks += clicks; prevYearClicks += clicks
      }
    }

    return { todayViews, yesterdayViews, weekViews, prevWeekViews, monthViews, prevMonthViews, totalViews, prevYearViews,
             todayClicks, yesterdayClicks, weekClicks, prevWeekClicks, monthClicks, prevMonthClicks, totalClicks, prevYearClicks }
  },
  ['dashboard-period-stats'],
  { revalidate: STATS_CACHE_TTL, tags: ['dashboard'] }
)

/**
 * Count rows in a table (cached).
 */
const getCountCached = unstable_cache(
  async (table: 'articles' | 'categories' | 'ads') => {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
    if (error) throw error
    return count ?? 0
  },
  ['dashboard-counts'],
  { revalidate: STATS_CACHE_TTL, tags: ['dashboard'] }
)

/**
 * Count articles in a period (cached).
 */
const getPeriodArticleCountCached = unstable_cache(
  async (startDate: string, endDate: string) => {
    const { count, error } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gte('created_at', startDate + 'T00:00:00Z')
      .lte('created_at', endDate + 'T23:59:59Z')
    if (error) throw error
    return count ?? 0
  },
  ['dashboard-period-counts'],
  { revalidate: STATS_CACHE_TTL, tags: ['dashboard'] }
)

/**
 * Top articles for a period (cached).
 */
const getTopArticlesCached = unstable_cache(
  async (startDate: string, endDate: string, limit = 5) => {
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('article_stats_daily')
      .select('article_id, views')
      .gte('date', startDate)
      .lte('date', endDate)

    if (statsError) throw statsError
    if (!stats || stats.length === 0) return []

    const viewsMap = new Map<number, number>()
    for (const row of stats) {
      const artId = Number(row.article_id)
      const views = Number(row.views ?? 0)
      viewsMap.set(artId, (viewsMap.get(artId) ?? 0) + views)
    }

    const sortedStats = Array.from(viewsMap.entries())
      .map(([article_id, total_views]) => ({ article_id, total_views }))
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, limit)

    if (sortedStats.length === 0) return []
    const ids = sortedStats.map((row) => row.article_id)

    const { data: articles, error: articleError } = await supabaseAdmin
      .from('articles')
      .select('id, title, category_id, categories(name)')
      .in('id', ids)
      .eq('status', 'published')
      .is('deleted_at', null)

    if (articleError) throw articleError

    const articleMap = new Map<number, any>()
    for (const art of articles ?? []) {
      articleMap.set(Number(art.id), art)
    }

    return sortedStats
      .map((row) => {
        const art = articleMap.get(row.article_id)
        return art ? {
          id: art.id,
          title: art.title,
          category: art.categories?.name || 'Tin tức',
          views: row.total_views
        } : null
      })
      .filter(Boolean)
  },
  ['dashboard-top-articles'],
  { revalidate: TOP_CACHE_TTL, tags: ['dashboard', 'articles'] }
)

/**
 * Top categories (cached) — uses the pre-computed view_top_categories.
 */
const getTopCategoriesCached = unstable_cache(
  async (limit = 5) => {
    const { data, error } = await supabaseAdmin
      .from('view_top_categories')
      .select('id, name, slug, article_count')
      .limit(limit)

    if (error) {
      // Fallback: compute manually
      console.warn('view_top_categories not available, falling back to manual query')
      const fallbackData = await supabaseAdmin
        .from('categories')
        .select('id, name, slug, updated_at, articles(count)')
        .is('deleted_at', null)
        .eq('articles.status', 'published')
        .is('articles.deleted_at', null)

      if (fallbackData.error) throw fallbackData.error
      if (!fallbackData.data) return []

      return fallbackData.data
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

    return (data ?? []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      article_count: cat.article_count ?? 0
    }))
  },
  ['dashboard-top-categories'],
  { revalidate: TOP_CACHE_TTL, tags: ['dashboard', 'categories'] }
)

/**
 * Top categories for a custom period (cached).
 */
const getTopCategoriesForPeriodCached = unstable_cache(
  async (startDate: string, endDate: string, limit = 5) => {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('category_id, categories(name)')
      .is('deleted_at', null)
      .eq('status', 'published')
      .gte('created_at', startDate + 'T00:00:00Z')
      .lte('created_at', endDate + 'T23:59:59Z')

    if (error) throw error
    if (!data) return []

    const countsMap = new Map<string, { id: number; name: string; count: number }>()
    for (const art of data) {
      const catId = Number(art.category_id || 0)
      const categories: any = art.categories
      const catName = (Array.isArray(categories) ? categories[0]?.name : categories?.name) || 'Chưa phân loại'
      const current = countsMap.get(catName) || { id: catId, name: catName, count: 0 }
      current.count += 1
      countsMap.set(catName, current)
    }

    return Array.from(countsMap.values())
      .map(c => ({
        id: c.id,
        name: c.name,
        slug: '',
        article_count: c.count
      }))
      .sort((a, b) => b.article_count - a.article_count)
      .slice(0, limit)
  },
  ['dashboard-top-categories-period'],
  { revalidate: TOP_CACHE_TTL, tags: ['dashboard', 'categories'] }
)

/**
 * Top ads for a period (cached) — uses get_top_ads RPC.
 */
const getTopAdsCached = unstable_cache(
  async (startDate: string, endDate: string, limit = 5) => {
    // Try RPC first (server-side aggregation)
    try {
      const { data: rpcData, error: rpcError } = await supabaseAdmin
        .rpc('get_top_ads', { p_limit: limit, p_days: 30 })

      if (!rpcError && rpcData && rpcData.length > 0) {
        const ids = rpcData.map((row: any) => row.ad_id)
        const { data: ads, error: adsError } = await supabaseAdmin
          .from('ads')
          .select('*')
          .in('id', ids)

        if (!adsError && ads) {
          const adMap = new Map<number, any>()
          for (const ad of ads) adMap.set(ad.id, ad)

          return rpcData
            .map((row: any) => {
              const ad = adMap.get(row.ad_id)
              return ad ? { ...ad, impressions_7d: Number(row.total_impressions) } : null
            })
            .filter(Boolean)
        }
      }
    } catch {
      // Fall through to manual aggregation
    }

    // Fallback: manual aggregation
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('ad_stats_daily')
      .select('ad_id, impressions')
      .gte('date', startDate)
      .lte('date', endDate)

    if (statsError) throw statsError
    if (!stats || stats.length === 0) return []

    const impressionsMap = new Map<number, number>()
    for (const row of stats) {
      const adId = Number(row.ad_id)
      const impressions = Number(row.impressions ?? 0)
      impressionsMap.set(adId, (impressionsMap.get(adId) ?? 0) + impressions)
    }

    const sortedStats = Array.from(impressionsMap.entries())
      .map(([ad_id, total_impressions]) => ({ ad_id, total_impressions }))
      .sort((a, b) => b.total_impressions - a.total_impressions)
      .slice(0, limit)

    if (sortedStats.length === 0) return []
    const ids = sortedStats.map((row) => row.ad_id)

    const { data: ads, error: adsError } = await supabaseAdmin
      .from('ads')
      .select('*')
      .in('id', ids)

    if (adsError) throw adsError

    const adMap = new Map<number, any>()
    for (const ad of ads ?? []) adMap.set(ad.id, ad)

    return sortedStats
      .map((row) => {
        const ad = adMap.get(row.ad_id)
        return ad ? { ...ad, impressions_7d: row.total_impressions } : null
      })
      .filter(Boolean)
  },
  ['dashboard-top-ads'],
  { revalidate: TOP_CACHE_TTL, tags: ['dashboard', 'ads'] }
)

/**
 * Recent activities (cached).
 */
const getRecentActivitiesCached = unstable_cache(
  async () => {
    const [latArt, latAd, latCat] = await Promise.all([
      supabaseAdmin.from('articles').select('id, title, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('ads').select('id, name, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('categories').select('id, name, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    ])

    const activities: ActivityRecord[] = []
    if (latArt.data) {
      latArt.data.forEach((a: any) => {
        activities.push({ type: 'article', title: a.title, status: a.status === 'published' ? 'Đã đăng' : 'Nháp', createdAt: a.created_at })
      })
    }
    if (latAd.data) {
      latAd.data.forEach((a: any) => {
        activities.push({ type: 'ad', title: a.name, status: a.status === 'active' ? 'Hoạt động' : 'Tắt', createdAt: a.created_at })
      })
    }
    if (latCat.data) {
      latCat.data.forEach((c: any) => {
        activities.push({ type: 'category', title: c.name, createdAt: c.created_at })
      })
    }

    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  },
  ['dashboard-recent-activities'],
  { revalidate: ACTIVITY_CACHE_TTL, tags: ['dashboard', 'articles', 'categories', 'ads'] }
)

// ============================================================
// MAIN EXPORTED FUNCTION
// ============================================================

export async function getDashboardStats(filters?: {
  timeFilter?: 'today' | 'week' | 'month' | 'year' | undefined
  day?: string | undefined
  month?: string | undefined
  year?: string | undefined
}) {
  const { startDate, endDate, prevStartDate, prevEndDate, hasCustomFilter } = getPeriodDates(filters)

  // 1. Try to get base metrics from the pre-computed view (single query replaces 7+ queries)
  const baseMetrics = await getBaseMetricsCached()

  let totalArticles: number
  let totalCategories: number
  let totalAds: number
  let totalViews: number
  let totalClicks: number
  let todayViews: number
  let yesterdayViews: number
  let todayClicks: number
  let yesterdayClicks: number
  let weekViews: number
  let prevWeekViews: number
  let weekClicks: number
  let prevWeekClicks: number
  let monthViews: number
  let prevMonthViews: number
  let monthClicks: number
  let prevMonthClicks: number
  let prevYearViews = 0
  let prevYearClicks = 0
  let periodArticles: number
  let prevPeriodArticles: number

  if (baseMetrics) {
    // Use the pre-computed view data
    totalArticles = baseMetrics.total_articles
    totalCategories = baseMetrics.total_categories
    totalAds = baseMetrics.total_ads
    totalViews = baseMetrics.total_views
    totalClicks = baseMetrics.total_clicks
    todayViews = baseMetrics.today_views
    yesterdayViews = baseMetrics.yesterday_views
    todayClicks = baseMetrics.today_clicks
    yesterdayClicks = baseMetrics.yesterday_clicks
    weekViews = baseMetrics.week_views
    prevWeekViews = baseMetrics.prev_week_views
    weekClicks = baseMetrics.week_clicks
    prevWeekClicks = baseMetrics.prev_week_clicks
    monthViews = baseMetrics.month_views
    prevMonthViews = baseMetrics.prev_month_views
    monthClicks = baseMetrics.month_clicks
    prevMonthClicks = baseMetrics.prev_month_clicks

    // For period article counts, still query separately
    const [periodCount, prevPeriodCount] = await Promise.all([
      getPeriodArticleCountCached(startDate, endDate),
      getPeriodArticleCountCached(prevStartDate, prevEndDate),
    ])
    periodArticles = periodCount
    prevPeriodArticles = prevPeriodCount
  } else {
    // Fallback: compute manually from daily tables
    const [
      countArt, countCat, countAd,
      periodCount, prevPeriodCount,
      periodStats
    ] = await Promise.all([
      getCountCached('articles'),
      getCountCached('categories'),
      getCountCached('ads'),
      getPeriodArticleCountCached(startDate, endDate),
      getPeriodArticleCountCached(prevStartDate, prevEndDate),
      getPeriodStatsCached(startDate, endDate, prevStartDate, prevEndDate),
    ])

    totalArticles = countArt
    totalCategories = countCat
    totalAds = countAd
    periodArticles = periodCount
    prevPeriodArticles = prevPeriodCount

    todayViews = periodStats.todayViews
    yesterdayViews = periodStats.yesterdayViews
    weekViews = periodStats.weekViews
    prevWeekViews = periodStats.prevWeekViews
    monthViews = periodStats.monthViews
    prevMonthViews = periodStats.prevMonthViews
    totalViews = periodStats.totalViews
    prevYearViews = periodStats.prevYearViews

    todayClicks = periodStats.todayClicks
    yesterdayClicks = periodStats.yesterdayClicks
    weekClicks = periodStats.weekClicks
    prevWeekClicks = periodStats.prevWeekClicks
    monthClicks = periodStats.monthClicks
    prevMonthClicks = periodStats.prevMonthClicks
    totalClicks = periodStats.totalClicks
    prevYearClicks = periodStats.prevYearClicks
  }

  // 2. Top articles, categories, ads (all cached)
  const [topArt, topCat, topAd] = await Promise.all([
    getTopArticlesCached(startDate, endDate, 5),
    hasCustomFilter
      ? getTopCategoriesForPeriodCached(startDate, endDate, 5)
      : getTopCategoriesCached(5),
    getTopAdsCached(startDate, endDate, 5),
  ])

  let topArticles = topArt
  let topCategories = topCat.length > 0 ? topCat : await getTopCategoriesCached(5)
  let topAds = topAd

  // 3. Recent activities (cached)
  const recentActivities = await getRecentActivitiesCached()

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

    prevYearViews,
    prevYearClicks,
    periodArticles,
    prevPeriodArticles,

    topArticles,
    topCategories,
    topAds,
    recentActivities
  }
}
