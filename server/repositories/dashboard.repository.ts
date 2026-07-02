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

async function sumArticleViews(fromDate?: string, toDate?: string) {
  let query = supabaseAdmin.from('article_stats_daily').select('views')
  if (fromDate) query = query.gte('date', fromDate)
  if (toDate) query = query.lt('date', toDate)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).reduce((sum, row) => sum + Number(row.views ?? 0), 0)
}

async function sumAdClicks(fromDate?: string, toDate?: string) {
  let query = supabaseAdmin.from('ad_stats_daily').select('clicks')
  if (fromDate) query = query.gte('date', fromDate)
  if (toDate) query = query.lt('date', toDate)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).reduce((sum, row) => sum + Number(row.clicks ?? 0), 0)
}

async function getTopCategories(limit = 5) {
  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, slug, updated_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!categories || categories.length === 0) return []

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

  const [
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

    latestArticles,
    latestAds,
    latestCategories
  ] = await Promise.all([
    countRows('articles', (query) => query.is('deleted_at', null)),
    countRows('categories', (query) => query.is('deleted_at', null)),
    countRows('ads', (query) => query.is('deleted_at', null)),
    sumArticleViews(),
    sumAdClicks(),

    sumArticleViews(today),
    sumArticleViews(yesterday, today),
    sumAdClicks(today),
    sumAdClicks(yesterday, today),

    sumArticleViews(weekStart),
    sumArticleViews(prevWeekStart, weekStart),
    sumAdClicks(weekStart),
    sumAdClicks(prevWeekStart, weekStart),

    sumArticleViews(monthStart),
    sumArticleViews(prevMonthStart, monthStart),
    sumAdClicks(monthStart),
    sumAdClicks(prevMonthStart, monthStart),

    listTrendingArticles(5, 7),
    getTopCategories(5),
    getTopAds(5, 7),

    supabaseAdmin.from('articles').select('id, title, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('ads').select('id, name, created_at, status').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('categories').select('id, name, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(5)
  ])

  const activities: ActivityRecord[] = []
  if (latestArticles.data) {
    latestArticles.data.forEach((a) => {
      activities.push({
        type: 'article',
        title: a.title,
        status: a.status === 'published' ? 'Đã đăng' : 'Nháp',
        createdAt: a.created_at
      })
    })
  }
  if (latestAds.data) {
    latestAds.data.forEach((a) => {
      activities.push({
        type: 'ad',
        title: a.name,
        status: a.status === 'active' ? 'Hoạt động' : 'Tắt',
        createdAt: a.created_at
      })
    })
  }
  if (latestCategories.data) {
    latestCategories.data.forEach((c) => {
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

