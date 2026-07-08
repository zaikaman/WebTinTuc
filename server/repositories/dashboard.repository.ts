import { supabaseAdmin } from '@/lib/supabase/admin'
import { unstable_cache } from 'next/cache'

type ActivityRecord = {
  type: 'article' | 'ad' | 'category'
  title: string
  status?: string
  createdAt: string
}

// Cache TTLs (in seconds)
const STD_CACHE_TTL = 300     // 5 min for standard timeframes
const CUSTOM_CACHE_TTL = 300  // 5 min for custom date ranges
const ACTIVITY_TTL = 120      // 2 min for recent activities
const TOP_CACHE_TTL = 300     // 5 min for top lists

// ============================================================
// PERIOD DATE COMPUTATION
// ============================================================

function getPeriodDates(filters?: {
  timeFilter?: 'today' | 'week' | 'month' | 'year' | undefined
  day?: string | undefined
  month?: string | undefined
  year?: string | undefined
}) {
  const now = new Date()
  const endDateStr = now.toISOString().slice(0, 10)
  let startDateStr = ''
  let prevStartDateStr = ''
  let prevEndDateStr = ''

  const isCustom = !!(filters?.day || filters?.month || filters?.year)

  if (isCustom) {
    const year = filters?.year || String(now.getFullYear())
    const month = filters?.month || ''
    const day = filters?.day || ''

    if (day && month) {
      const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      startDateStr = dateStr
      const targetDate = new Date(dateStr)
      const prevDate = new Date(targetDate)
      prevDate.setDate(targetDate.getDate() - 1)
      prevStartDateStr = prevDate.toISOString().slice(0, 10)
      prevEndDateStr = prevStartDateStr
    } else if (month) {
      startDateStr = `${year}-${month.padStart(2, '0')}-01`
      const lastDay = new Date(Number(year), Number(month), 0).getDate()
      const prevMonth = Number(month) - 1
      const prevYear = prevMonth === 0 ? Number(year) - 1 : Number(year)
      const prevMonthNorm = prevMonth === 0 ? 12 : prevMonth
      prevStartDateStr = `${prevYear}-${String(prevMonthNorm).padStart(2, '0')}-01`
      const prevLastDay = new Date(prevYear, prevMonthNorm, 0).getDate()
      prevEndDateStr = `${prevYear}-${String(prevMonthNorm).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`
    } else {
      startDateStr = `${year}-01-01`
      prevStartDateStr = `${Number(year) - 1}-01-01`
      prevEndDateStr = `${Number(year) - 1}-12-31`
    }
  }

  return { startDate: startDateStr, endDate: endDateStr, prevStartDate: prevStartDateStr, prevEndDate: prevEndDateStr, isCustom }
}

// ============================================================
// RPC-BASED CACHED FUNCTIONS
// ============================================================

/**
 * KEY OPTIMIZATION: Pre-computes ALL standard timeframes (today, week, month, year)
 * in a SINGLE database RPC call. The cache key does NOT include timeFilter,
 * so switching between standard filters hits the same cache entry → INSTANT.
 *
 * Only re-computed when cache expires (5 min).
 */
const getAllTimeframesCached = unstable_cache(
  async () => {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_dashboard_all_timeframes')
      if (!error && data) return data as Record<string, any>
    } catch {
      // Fall through
    }

    // FALLBACK: compute all standard timeframes manually
    return computeAllTimeframesFallback()
  },
  ['dashboard-all-timeframes'],
  { revalidate: STD_CACHE_TTL, tags: ['dashboard'] }
)

/**
 * Fallback: compute all standard timeframes manually when RPC doesn't exist.
 */
async function computeAllTimeframesFallback() {
  const today = new Date().toISOString().slice(0, 10)
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().slice(0, 10)

  // Counts
  const [countArt, countCat, countAd] = await Promise.all([
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabaseAdmin.from('ads').select('*', { count: 'exact', head: true }).is('deleted_at', null),
  ])

  const totalArticles = countArt.count ?? 0
  const totalCategories = countCat.count ?? 0
  const totalAds = countAd.count ?? 0

  // Period article counts
  const monthStart = new Date()
  monthStart.setDate(monthStart.getDate() - 29)
  const prevMonthStart = new Date()
  prevMonthStart.setDate(prevMonthStart.getDate() - 59)
  const prevMonthEnd = new Date()
  prevMonthEnd.setDate(prevMonthEnd.getDate() - 30)

  const [monthCount, prevMonthCount, artData, adData] = await Promise.all([
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', monthStart.toISOString()),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', prevMonthStart.toISOString()).lt('created_at', prevMonthEnd.toISOString()),
    supabaseAdmin.from('article_stats_daily').select('date, views').gte('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)), // last 365 days
    supabaseAdmin.from('ad_stats_daily').select('date, clicks').gte('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
  ])

  // Aggregate article views
  const weeklyStart = new Date(); weeklyStart.setDate(weeklyStart.getDate() - 6)
  const prevWeeklyStart = new Date(); prevWeeklyStart.setDate(prevWeeklyStart.getDate() - 13)
  const prevWeeklyEnd = new Date(); prevWeeklyEnd.setDate(prevWeeklyEnd.getDate() - 7)
  const monthlyStart = new Date(); monthlyStart.setDate(monthlyStart.getDate() - 29)
  const prevMonthlyStart = new Date(); prevMonthlyStart.setDate(prevMonthlyStart.getDate() - 59)
  const prevMonthlyEnd = new Date(); prevMonthlyEnd.setDate(prevMonthlyEnd.getDate() - 30)
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const prevYearStart = new Date(new Date().getFullYear() - 1, 0, 1)
  const prevYearEnd = new Date(new Date().getFullYear() - 1, 11, 31)

  let todayViews = 0, yesterdayViews = 0, weekViews = 0, prevWeekViews = 0
  let monthViews = 0, prevMonthViews = 0, yearViews = 0, prevYearViews = 0

  for (const row of artData.data ?? []) {
    const d = row.date; const v = Number(row.views ?? 0)
    if (d === today) todayViews += v
    if (d === yesterday) yesterdayViews += v
    if (d >= weeklyStart.toISOString().slice(0, 10) && d <= today) weekViews += v
    if (d >= prevWeeklyStart.toISOString().slice(0, 10) && d <= prevWeeklyEnd.toISOString().slice(0, 10)) prevWeekViews += v
    if (d >= monthlyStart.toISOString().slice(0, 10) && d <= today) monthViews += v
    if (d >= prevMonthlyStart.toISOString().slice(0, 10) && d <= prevMonthlyEnd.toISOString().slice(0, 10)) prevMonthViews += v
    if (d >= yearStart.toISOString().slice(0, 10)) yearViews += v
    if (d >= prevYearStart.toISOString().slice(0, 10) && d <= prevYearEnd.toISOString().slice(0, 10)) prevYearViews += v
  }

  let todayClicks = 0, yesterdayClicks = 0, weekClicks = 0, prevWeekClicks = 0
  let monthClicks = 0, prevMonthClicks = 0, yearClicks = 0, prevYearClicks = 0

  for (const row of adData.data ?? []) {
    const d = row.date; const c = Number(row.clicks ?? 0)
    if (d === today) todayClicks += c
    if (d === yesterday) yesterdayClicks += c
    if (d >= weeklyStart.toISOString().slice(0, 10) && d <= today) weekClicks += c
    if (d >= prevWeeklyStart.toISOString().slice(0, 10) && d <= prevWeeklyEnd.toISOString().slice(0, 10)) prevWeekClicks += c
    if (d >= monthlyStart.toISOString().slice(0, 10) && d <= today) monthClicks += c
    if (d >= prevMonthlyStart.toISOString().slice(0, 10) && d <= prevMonthlyEnd.toISOString().slice(0, 10)) prevMonthClicks += c
    if (d >= yearStart.toISOString().slice(0, 10)) yearClicks += c
    if (d >= prevYearStart.toISOString().slice(0, 10) && d <= prevYearEnd.toISOString().slice(0, 10)) prevYearClicks += c
  }

  return {
    totalArticles, totalCategories, totalAds,
    todayViews, yesterdayViews, todayClicks, yesterdayClicks,
    weekViews, prevWeekViews, weekClicks, prevWeekClicks,
    monthViews, prevMonthViews, monthClicks, prevMonthClicks,
    yearViews, prevYearViews, yearClicks, prevYearClicks,
    totalViews: yearViews + prevYearViews,
    totalClicks: yearClicks + prevYearClicks,
    periodArticles: monthCount.count ?? 0,
    prevPeriodArticles: prevMonthCount.count ?? 0,
  }
}

/**
 * Get stats for a CUSTOM date range (used when user specifies exact day/month/year).
 * Separate RPC + separate cache key based on date params.
 */
const getCustomStatsRangeCached = unstable_cache(
  async (startDate: string, endDate: string, prevStartDate: string, prevEndDate: string) => {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_dashboard_stats_range', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_prev_start_date: prevStartDate,
        p_prev_end_date: prevEndDate
      })
      if (!error && data) return data as Record<string, any>
    } catch { /* fall through */ }

    // Minimal fallback for custom ranges — just counts, views/clicks as 0
    const [artCount, catCount, adCount] = await Promise.all([
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabaseAdmin.from('ads').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    ])
    return {
      totalArticles: artCount.count ?? 0, totalCategories: catCount.count ?? 0, totalAds: adCount.count ?? 0,
      todayViews: 0, yesterdayViews: 0, todayClicks: 0, yesterdayClicks: 0,
      weekViews: 0, prevWeekViews: 0, weekClicks: 0, prevWeekClicks: 0,
      monthViews: 0, prevMonthViews: 0, monthClicks: 0, prevMonthClicks: 0,
      totalViews: 0, totalClicks: 0, prevYearViews: 0, prevYearClicks: 0,
      periodArticles: 0, prevPeriodArticles: 0,
    }
  },
  ['dashboard-custom-range'],
  { revalidate: CUSTOM_CACHE_TTL, tags: ['dashboard'] }
)

/**
 * Top N articles via single RPC call (server-side aggregation).
 */
const getTopArticlesCached = unstable_cache(
  async (startDate: string, endDate: string, limit = 5) => {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_dashboard_top_articles_range', {
        p_start_date: startDate, p_end_date: endDate, p_limit: limit
      })
      if (!error && data) return (data as any[]) ?? []
    } catch { /* fall through */ }

    // Fallback
    const { data: stats } = await supabaseAdmin.from('article_stats_daily')
      .select('article_id, views').gte('date', startDate).lte('date', endDate)
    if (!stats || stats.length === 0) return []

    const viewsMap = new Map<number, number>()
    for (const row of stats) {
      const artId = Number(row.article_id); const v = Number(row.views ?? 0)
      viewsMap.set(artId, (viewsMap.get(artId) ?? 0) + v)
    }

    const sortedIds = Array.from(viewsMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id)
    if (sortedIds.length === 0) return []

    const { data: articles } = await supabaseAdmin.from('articles')
      .select('id, title, category_id, categories(name)').in('id', sortedIds)
      .eq('status', 'published').is('deleted_at', null)

    const articleMap = new Map((articles ?? []).map((a: any) => [Number(a.id), a]))
    return sortedIds.map(id => {
      const art = articleMap.get(id)
      return art ? { id: art.id, title: art.title, category: art.categories?.name || 'Tin tức', views: viewsMap.get(id) ?? 0 } : null
    }).filter(Boolean)
  },
  ['dashboard-top-articles'],
  { revalidate: TOP_CACHE_TTL, tags: ['dashboard', 'articles'] }
)

/**
 * Top N categories (uses view_top_categories).
 */
const getTopCategoriesCached = unstable_cache(
  async (limit = 5) => {
    try {
      const { data, error } = await supabaseAdmin.from('view_top_categories')
        .select('id, name, slug, article_count').limit(limit)
      if (!error && data) return data.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, article_count: c.article_count ?? 0 }))
    } catch { /* fall through */ }

    const { data } = await supabaseAdmin.from('categories')
      .select('id, name, slug, articles(count)').is('deleted_at', null)
      .eq('articles.status', 'published').is('articles.deleted_at', null)

    return (data ?? [])
      .map((cat: any) => ({ id: cat.id, name: cat.name, slug: cat.slug, article_count: cat.articles?.[0]?.count ?? 0 }))
      .sort((a: any, b: any) => b.article_count - a.article_count).slice(0, limit)
  },
  ['dashboard-top-categories'],
  { revalidate: TOP_CACHE_TTL, tags: ['dashboard', 'categories'] }
)

/**
 * Top N categories for a custom period.
 */
const getTopCategoriesForPeriodCached = unstable_cache(
  async (startDate: string, endDate: string, limit = 5) => {
    const { data } = await supabaseAdmin.from('articles')
      .select('category_id, categories(name)').is('deleted_at', null)
      .eq('status', 'published')
      .gte('created_at', startDate + 'T00:00:00Z').lte('created_at', endDate + 'T23:59:59Z')
    if (!data) return []

    const countsMap = new Map<string, { id: number; name: string; count: number }>()
    for (const art of data) {
      const catId = Number(art.category_id || 0)
      const cat = Array.isArray(art.categories) ? art.categories[0] : art.categories
      const catName = cat?.name || 'Chưa phân loại'
      const current = countsMap.get(catName) || { id: catId, name: catName, count: 0 }
      current.count += 1
      countsMap.set(catName, current)
    }
    return Array.from(countsMap.values())
      .map(c => ({ id: c.id, name: c.name, slug: '', article_count: c.count }))
      .sort((a, b) => b.article_count - a.article_count).slice(0, limit)
  },
  ['dashboard-top-categories-period'],
  { revalidate: TOP_CACHE_TTL, tags: ['dashboard', 'categories'] }
)

/**
 * Top N ads via single RPC call.
 */
const getTopAdsCached = unstable_cache(
  async (startDate: string, endDate: string, limit = 5) => {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_dashboard_top_ads_range', {
        p_start_date: startDate, p_end_date: endDate, p_limit: limit
      })
      if (!error && data) return (data as any[]) ?? []
    } catch { /* fall through */ }

    // Fallback through existing RPC
    try {
      const { data: rpcData } = await supabaseAdmin.rpc('get_top_ads', { p_limit: limit, p_days: 30 })
      if (rpcData && rpcData.length > 0) {
        const ids = rpcData.map((row: any) => row.ad_id)
        const { data: ads } = await supabaseAdmin.from('ads').select('*').in('id', ids)
        if (ads) {
          const adMap = new Map(ads.map((a: any) => [a.id, a]))
          return rpcData.map((row: any) => {
            const ad = adMap.get(row.ad_id)
            return ad ? { ...ad, impressions_7d: Number(row.total_impressions) } : null
          }).filter(Boolean)
        }
      }
    } catch { /* fall through */ }

    return []
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
    latArt.data?.forEach((a: any) => activities.push({ type: 'article', title: a.title, status: a.status === 'published' ? 'Đã đăng' : 'Nháp', createdAt: a.created_at }))
    latAd.data?.forEach((a: any) => activities.push({ type: 'ad', title: a.name, status: a.status === 'active' ? 'Hoạt động' : 'Tắt', createdAt: a.created_at }))
    latCat.data?.forEach((c: any) => activities.push({ type: 'category', title: c.name, createdAt: c.created_at }))

    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  },
  ['dashboard-recent-activities'],
  { revalidate: ACTIVITY_TTL, tags: ['dashboard', 'articles', 'categories', 'ads'] }
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
  const { startDate, endDate, prevStartDate, prevEndDate, isCustom } = getPeriodDates(filters)

  let stats: Record<string, any>

  if (isCustom) {
    // Custom date range → use dedicated RPC with date-based cache key
    stats = await getCustomStatsRangeCached(startDate, endDate, prevStartDate, prevEndDate)
  } else {
    // Standard timeframe → use ALL-TIMEFRAMES RPC (shared cache regardless of filter!)
    stats = await getAllTimeframesCached()
  }

  // Compute the correct views/clicks based on the requested time filter
  const timeFilter = filters?.timeFilter || 'month'

  let totalViews: number, todayViews: number, yesterdayViews: number
  let weekViews: number, prevWeekViews: number
  let monthViews: number, prevMonthViews: number
  let prevYearViews: number
  let totalClicks: number, todayClicks: number, yesterdayClicks: number
  let weekClicks: number, prevWeekClicks: number
  let monthClicks: number, prevMonthClicks: number
  let prevYearClicks: number
  let periodArticles: number, prevPeriodArticles: number

  if (isCustom) {
    // For custom ranges, use the same pattern as before
    totalViews = stats.totalViews ?? 0
    todayViews = stats.todayViews ?? 0
    yesterdayViews = stats.yesterdayViews ?? 0
    weekViews = stats.weekViews ?? 0
    prevWeekViews = stats.prevWeekViews ?? 0
    monthViews = stats.monthViews ?? 0
    prevMonthViews = stats.prevMonthViews ?? 0
    prevYearViews = stats.prevYearViews ?? 0
    totalClicks = stats.totalClicks ?? 0
    todayClicks = stats.todayClicks ?? 0
    yesterdayClicks = stats.yesterdayClicks ?? 0
    weekClicks = stats.weekClicks ?? 0
    prevWeekClicks = stats.prevWeekClicks ?? 0
    monthClicks = stats.monthClicks ?? 0
    prevMonthClicks = stats.prevMonthClicks ?? 0
    prevYearClicks = stats.prevYearClicks ?? 0
    periodArticles = stats.periodArticles ?? 0
    prevPeriodArticles = stats.prevPeriodArticles ?? 0
  } else {
    // For standard timeframes, select the relevant fields from pre-computed data
    totalViews = stats.totalViews ?? 0
    totalClicks = stats.totalClicks ?? 0
    periodArticles = stats.periodArticles ?? 0
    prevPeriodArticles = stats.prevPeriodArticles ?? 0

    switch (timeFilter) {
      case 'today':
        todayViews = stats.todayViews ?? 0
        yesterdayViews = stats.yesterdayViews ?? 0
        weekViews = stats.weekViews ?? 0
        prevWeekViews = stats.prevWeekViews ?? 0
        monthViews = stats.monthViews ?? 0
        prevMonthViews = stats.prevMonthViews ?? 0
        prevYearViews = stats.prevYearViews ?? 0
        todayClicks = stats.todayClicks ?? 0
        yesterdayClicks = stats.yesterdayClicks ?? 0
        weekClicks = stats.weekClicks ?? 0
        prevWeekClicks = stats.prevWeekClicks ?? 0
        monthClicks = stats.monthClicks ?? 0
        prevMonthClicks = stats.prevMonthClicks ?? 0
        prevYearClicks = stats.prevYearClicks ?? 0
        break
      case 'week':
        todayViews = stats.weekViews ?? 0
        yesterdayViews = stats.prevWeekViews ?? 0
        weekViews = stats.weekViews ?? 0
        prevWeekViews = stats.prevWeekViews ?? 0
        monthViews = stats.monthViews ?? 0
        prevMonthViews = stats.prevMonthViews ?? 0
        prevYearViews = stats.prevYearViews ?? 0
        todayClicks = stats.weekClicks ?? 0
        yesterdayClicks = stats.prevWeekClicks ?? 0
        weekClicks = stats.weekClicks ?? 0
        prevWeekClicks = stats.prevWeekClicks ?? 0
        monthClicks = stats.monthClicks ?? 0
        prevMonthClicks = stats.prevMonthClicks ?? 0
        prevYearClicks = stats.prevYearClicks ?? 0
        break
      case 'month':
        todayViews = stats.monthViews ?? 0
        yesterdayViews = stats.prevMonthViews ?? 0
        weekViews = stats.weekViews ?? 0
        prevWeekViews = stats.prevWeekViews ?? 0
        monthViews = stats.monthViews ?? 0
        prevMonthViews = stats.prevMonthViews ?? 0
        prevYearViews = stats.prevYearViews ?? 0
        todayClicks = stats.monthClicks ?? 0
        yesterdayClicks = stats.prevMonthClicks ?? 0
        weekClicks = stats.weekClicks ?? 0
        prevWeekClicks = stats.prevWeekClicks ?? 0
        monthClicks = stats.monthClicks ?? 0
        prevMonthClicks = stats.prevMonthClicks ?? 0
        prevYearClicks = stats.prevYearClicks ?? 0
        break
      case 'year':
      default:
        todayViews = stats.yearViews ?? 0
        yesterdayViews = stats.prevYearViews ?? 0
        weekViews = stats.monthViews ?? 0
        prevWeekViews = stats.prevMonthViews ?? 0
        monthViews = stats.yearViews ?? 0
        prevMonthViews = stats.prevYearViews ?? 0
        prevYearViews = stats.prevYearViews ?? 0
        todayClicks = stats.yearClicks ?? 0
        yesterdayClicks = stats.prevYearClicks ?? 0
        weekClicks = stats.monthClicks ?? 0
        prevWeekClicks = stats.prevMonthClicks ?? 0
        monthClicks = stats.yearClicks ?? 0
        prevMonthClicks = stats.prevYearClicks ?? 0
        prevYearClicks = stats.prevYearClicks ?? 0
        break
    }
  }

  // Top articles, categories, ads (parallel)
  const [topArticles, topCat, topAds, recentActivities] = await Promise.all([
    getTopArticlesCached(startDate || endDate, endDate, 5),
    isCustom ? getTopCategoriesForPeriodCached(startDate, endDate, 5) : getTopCategoriesCached(5),
    getTopAdsCached(startDate || endDate, endDate, 5),
    getRecentActivitiesCached(),
  ])

  const topCategories = topCat.length > 0 ? topCat : await getTopCategoriesCached(5)

  return {
    totalArticles: stats.totalArticles ?? 0,
    totalCategories: stats.totalCategories ?? 0,
    totalAds: stats.totalAds ?? 0,
    totalViews, todayViews, yesterdayViews, weekViews, prevWeekViews, monthViews, prevMonthViews, prevYearViews,
    totalClicks, todayClicks, yesterdayClicks, weekClicks, prevWeekClicks, monthClicks, prevMonthClicks, prevYearClicks,
    periodArticles, prevPeriodArticles,
    topArticles, topCategories, topAds, recentActivities,
  }
}
