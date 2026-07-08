import { supabaseAdmin } from '@/lib/supabase/admin'

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
  // Single optimized query using PostgREST relation count (no N+1 queries!)
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


async function getTopArticlesForPeriod(startDate: string, endDate: string, limit = 5) {
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
}

async function getTopCategoriesForPeriod(startDate: string, endDate: string, limit = 5) {
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
}

async function getTopAdsForPeriod(startDate: string, endDate: string, limit = 5) {
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
  for (const ad of ads ?? []) {
    adMap.set(ad.id, ad)
  }

  return sortedStats
    .map((row) => {
      const ad = adMap.get(row.ad_id)
      return ad ? { ...ad, impressions_7d: row.total_impressions } : null
    })
    .filter(Boolean)
}

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

export async function getDashboardStats(filters?: {
  timeFilter?: 'today' | 'week' | 'month' | 'year' | undefined
  day?: string | undefined
  month?: string | undefined
  year?: string | undefined
}) {
  const { startDate, endDate, prevStartDate, prevEndDate, hasCustomFilter } = getPeriodDates(filters)

  let totalArticles = 0
  let totalCategories = 0
  let totalAds = 0
  
  let periodArticles = 0
  let prevPeriodArticles = 0

  const [
    countArt,
    countCat,
    countAd,
    countArtPeriod,
    countArtPrevPeriod,
  ] = await Promise.all([
    countRows('articles', (query) => query.is('deleted_at', null)),
    countRows('categories', (query) => query.is('deleted_at', null)),
    countRows('ads', (query) => query.is('deleted_at', null)),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', startDate + 'T00:00:00Z').lte('created_at', endDate + 'T23:59:59Z'),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', prevStartDate + 'T00:00:00Z').lte('created_at', prevEndDate + 'T23:59:59Z'),
  ])

  totalArticles = countArt
  totalCategories = countCat
  totalAds = countAd
  periodArticles = countArtPeriod.count ?? 0
  prevPeriodArticles = countArtPrevPeriod.count ?? 0

  const [
    articleStatsData,
    adStatsData,
  ] = await Promise.all([
    supabaseAdmin.from('article_stats_daily').select('date, views').gte('date', prevStartDate).lte('date', endDate),
    supabaseAdmin.from('ad_stats_daily').select('date, clicks').gte('date', prevStartDate).lte('date', endDate)
  ])

  let todayViews = 0
  let yesterdayViews = 0
  let weekViews = 0
  let prevWeekViews = 0
  let monthViews = 0
  let prevMonthViews = 0
  let totalViews = 0
  let prevYearViews = 0

  const articleStats = articleStatsData.data ?? []
  for (const row of articleStats) {
    const date = row.date
    const views = Number(row.views ?? 0)

    if (date === endDate) todayViews += views
    if (date === prevEndDate) yesterdayViews += views

    if (date >= startDate && date <= endDate) {
      weekViews += views
      monthViews += views
      totalViews += views
    } else if (date >= prevStartDate && date <= prevEndDate) {
      prevWeekViews += views
      prevMonthViews += views
      prevYearViews += views
    }
  }

  let todayClicks = 0
  let yesterdayClicks = 0
  let weekClicks = 0
  let prevWeekClicks = 0
  let monthClicks = 0
  let prevMonthClicks = 0
  let totalClicks = 0
  let prevYearClicks = 0

  const adStats = adStatsData.data ?? []
  for (const row of adStats) {
    const date = row.date
    const clicks = Number(row.clicks ?? 0)

    if (date === endDate) todayClicks += clicks
    if (date === prevEndDate) yesterdayClicks += clicks

    if (date >= startDate && date <= endDate) {
      weekClicks += clicks
      monthClicks += clicks
      totalClicks += clicks
    } else if (date >= prevStartDate && date <= prevEndDate) {
      prevWeekClicks += clicks
      prevMonthClicks += clicks
      prevYearClicks += clicks
    }
  }

  let topArticles: any[] = []
  let topCategories: any[] = []
  let topAds: any[] = []

  const [topArt, topCat, topAd] = await Promise.all([
    getTopArticlesForPeriod(startDate, endDate, 5),
    hasCustomFilter ? getTopCategoriesForPeriod(startDate, endDate, 5) : getTopCategories(5),
    getTopAdsForPeriod(startDate, endDate, 5),
  ])

  topArticles = topArt
  topCategories = topCat.length > 0 ? topCat : await getTopCategories(5)
  topAds = topAd

  const [latArt, latAd, latCat] = await Promise.all([
    supabaseAdmin.from('articles').select('id, title, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('ads').select('id, name, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('categories').select('id, name, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
  ])

  const activities: ActivityRecord[] = []
  if (latArt.data) {
    latArt.data.forEach((a: any) => {
      activities.push({
        type: 'article',
        title: a.title,
        status: a.status === 'published' ? 'Đã đăng' : 'Nháp',
        createdAt: a.created_at
      })
    })
  }
  if (latAd.data) {
    latAd.data.forEach((a: any) => {
      activities.push({
        type: 'ad',
        title: a.name,
        status: a.status === 'active' ? 'Hoạt động' : 'Tắt',
        createdAt: a.created_at
      })
    })
  }
  if (latCat.data) {
    latCat.data.forEach((c: any) => {
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


