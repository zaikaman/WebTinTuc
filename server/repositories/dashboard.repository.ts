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

function pad2(n: string | number) {
  return String(n).padStart(2, '0')
}

function utcTodayStr() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Build inclusive [startDate, endDate] for custom day/month/year filters.
 * - day+month(+year): that single calendar day
 * - month(+year): full calendar month
 * - year only: full calendar year
 * Previous period is the immediately preceding equal-length range (day/month/year).
 */
function getPeriodDates(filters?: {
  timeFilter?: 'today' | 'week' | 'month' | 'year' | undefined
  day?: string | undefined
  month?: string | undefined
  year?: string | undefined
}) {
  const now = new Date()
  const todayStr = utcTodayStr()
  let startDateStr = ''
  let endDateStr = todayStr
  let prevStartDateStr = ''
  let prevEndDateStr = ''

  const isCustom = !!(filters?.day || filters?.month || filters?.year)

  if (isCustom) {
    const year = filters?.year || String(now.getUTCFullYear())
    const month = filters?.month || ''
    const day = filters?.day || ''
    const y = Number(year)

    if (day && month) {
      // Single day
      const dateStr = `${year}-${pad2(month)}-${pad2(day)}`
      startDateStr = dateStr
      endDateStr = dateStr
      // Previous day (UTC-safe via Date.UTC)
      const m = Number(month)
      const d = Number(day)
      const prev = new Date(Date.UTC(y, m - 1, d - 1))
      prevStartDateStr = prev.toISOString().slice(0, 10)
      prevEndDateStr = prevStartDateStr
    } else if (month) {
      // Full calendar month
      const m = Number(month)
      startDateStr = `${year}-${pad2(month)}-01`
      const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
      endDateStr = `${year}-${pad2(month)}-${pad2(lastDay)}`

      const prevMonth = m - 1 === 0 ? 12 : m - 1
      const prevYear = m - 1 === 0 ? y - 1 : y
      const prevLastDay = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate()
      prevStartDateStr = `${prevYear}-${pad2(prevMonth)}-01`
      prevEndDateStr = `${prevYear}-${pad2(prevMonth)}-${pad2(prevLastDay)}`
    } else if (year) {
      // Full calendar year
      startDateStr = `${year}-01-01`
      endDateStr = `${year}-12-31`
      prevStartDateStr = `${y - 1}-01-01`
      prevEndDateStr = `${y - 1}-12-31`
    } else if (day) {
      // Day without month is invalid — treat as "today" of current month with that day if possible
      const m = now.getUTCMonth() + 1
      const dateStr = `${year}-${pad2(m)}-${pad2(day)}`
      startDateStr = dateStr
      endDateStr = dateStr
      const prev = new Date(Date.UTC(y, m - 1, Number(day) - 1))
      prevStartDateStr = prev.toISOString().slice(0, 10)
      prevEndDateStr = prevStartDateStr
    }
  }

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    prevStartDate: prevStartDateStr,
    prevEndDate: prevEndDateStr,
    isCustom,
  }
}

/** Sum a numeric column over a date range from a daily stats table. */
async function sumStatsInRange(
  table: 'article_stats_daily' | 'ad_stats_daily',
  column: 'views' | 'clicks',
  startDate: string,
  endDate: string
): Promise<number> {
  // Prefer PostgREST aggregate (avoids 1000-row default limit truncating the sum)
  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(`${column}.sum()`)
      .gte('date', startDate)
      .lte('date', endDate)
      .maybeSingle()

    if (!error && data) {
      const row = data as Record<string, unknown>
      const raw = row[`sum`] ?? row[column] ?? Object.values(row)[0]
      const n = Number(raw ?? 0)
      if (!Number.isNaN(n)) return n
    }
  } catch {
    // fall through to client-side sum
  }

  // Fallback: page through rows if aggregate is unavailable
  let sum = 0
  let from = 0
  const pageSize = 1000
  for (;;) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(column)
      .gte('date', startDate)
      .lte('date', endDate)
      .range(from, from + pageSize - 1)

    if (error || !data || data.length === 0) break
    for (const row of data as any[]) sum += Number(row[column] ?? 0)
    if (data.length < pageSize) break
    from += pageSize
  }
  return sum
}

/**
 * Real aggregation for custom ranges (used when RPC is missing or fails).
 * Maps period totals into todayViews / yesterdayViews so the client can display them.
 */
async function computeCustomStatsRange(
  startDate: string,
  endDate: string,
  prevStartDate: string,
  prevEndDate: string
) {
  const [countArt, countCat, countAd, periodViews, prevViews, periodClicks, prevClicks, periodArticles, prevPeriodArticles] =
    await Promise.all([
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabaseAdmin.from('ads').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      sumStatsInRange('article_stats_daily', 'views', startDate, endDate),
      sumStatsInRange('article_stats_daily', 'views', prevStartDate, prevEndDate),
      sumStatsInRange('ad_stats_daily', 'clicks', startDate, endDate),
      sumStatsInRange('ad_stats_daily', 'clicks', prevStartDate, prevEndDate),
      supabaseAdmin
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .gte('created_at', `${startDate}T00:00:00.000Z`)
        .lte('created_at', `${endDate}T23:59:59.999Z`),
      supabaseAdmin
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .gte('created_at', `${prevStartDate}T00:00:00.000Z`)
        .lte('created_at', `${prevEndDate}T23:59:59.999Z`),
    ])

  return {
    totalArticles: countArt.count ?? 0,
    totalCategories: countCat.count ?? 0,
    totalAds: countAd.count ?? 0,
    // Client custom path reads todayViews / yesterdayViews as current / previous period
    todayViews: periodViews,
    yesterdayViews: prevViews,
    todayClicks: periodClicks,
    yesterdayClicks: prevClicks,
    weekViews: periodViews,
    prevWeekViews: prevViews,
    weekClicks: periodClicks,
    prevWeekClicks: prevClicks,
    monthViews: periodViews,
    prevMonthViews: prevViews,
    monthClicks: periodClicks,
    prevMonthClicks: prevClicks,
    yearViews: periodViews,
    prevYearViews: prevViews,
    yearClicks: periodClicks,
    prevYearClicks: prevClicks,
    totalViews: periodViews,
    totalClicks: periodClicks,
    periodArticles: periodArticles.count ?? 0,
    prevPeriodArticles: prevPeriodArticles.count ?? 0,
  }
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
 * Tries RPC first; on miss/error runs real SQL aggregation (never return silent zeros).
 */
const getCustomStatsRangeCached = unstable_cache(
  async (startDate: string, endDate: string, prevStartDate: string, prevEndDate: string) => {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_dashboard_stats_range', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_prev_start_date: prevStartDate,
        p_prev_end_date: prevEndDate,
      })
      if (!error && data) return data as Record<string, any>
    } catch {
      // fall through to real aggregation
    }

    return computeCustomStatsRange(startDate, endDate, prevStartDate, prevEndDate)
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

  // Always return RAW all-timeframe fields so the client can switch
  // today/week/month/year without another network round-trip.
  const totalViews = stats.totalViews ?? stats.yearViews ?? 0
  const totalClicks = stats.totalClicks ?? stats.yearClicks ?? 0
  const todayViews = stats.todayViews ?? 0
  const yesterdayViews = stats.yesterdayViews ?? 0
  const weekViews = stats.weekViews ?? 0
  const prevWeekViews = stats.prevWeekViews ?? 0
  const monthViews = stats.monthViews ?? 0
  const prevMonthViews = stats.prevMonthViews ?? 0
  const yearViews = stats.yearViews ?? totalViews
  const prevYearViews = stats.prevYearViews ?? 0
  const todayClicks = stats.todayClicks ?? 0
  const yesterdayClicks = stats.yesterdayClicks ?? 0
  const weekClicks = stats.weekClicks ?? 0
  const prevWeekClicks = stats.prevWeekClicks ?? 0
  const monthClicks = stats.monthClicks ?? 0
  const prevMonthClicks = stats.prevMonthClicks ?? 0
  const yearClicks = stats.yearClicks ?? totalClicks
  const prevYearClicks = stats.prevYearClicks ?? 0
  const periodArticles = stats.periodArticles ?? 0
  const prevPeriodArticles = stats.prevPeriodArticles ?? 0

  // Top lists: standard filters use last 7 days; custom uses the custom range
  const topStart = isCustom ? (startDate || endDate) : (() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d.toISOString().slice(0, 10)
  })()

  const [topArticles, topCat, topAds, recentActivities] = await Promise.all([
    getTopArticlesCached(topStart, endDate, 5),
    isCustom ? getTopCategoriesForPeriodCached(startDate, endDate, 5) : getTopCategoriesCached(5),
    getTopAdsCached(topStart, endDate, 5),
    getRecentActivitiesCached(),
  ])

  const topCategories = topCat.length > 0 ? topCat : await getTopCategoriesCached(5)

  return {
    totalArticles: stats.totalArticles ?? 0,
    totalCategories: stats.totalCategories ?? 0,
    totalAds: stats.totalAds ?? 0,
    totalViews,
    yearViews,
    todayViews,
    yesterdayViews,
    weekViews,
    prevWeekViews,
    monthViews,
    prevMonthViews,
    prevYearViews,
    totalClicks,
    yearClicks,
    todayClicks,
    yesterdayClicks,
    weekClicks,
    prevWeekClicks,
    monthClicks,
    prevMonthClicks,
    prevYearClicks,
    periodArticles,
    prevPeriodArticles,
    topArticles,
    topCategories,
    topAds,
    recentActivities,
  }
}
