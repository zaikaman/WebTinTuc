import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'
import { pageMeta, toRange } from '@/server/validations/common.schema'

const ARTICLE_SELECT = `
  *,
  categories(*),
  profiles(*)
`

const ARTICLE_LIST_SELECT = `
  id,
  title,
  slug,
  summary,
  thumbnail_key,
  category_id,
  author_id,
  views,
  status,
  featured,
  seo_title,
  seo_description,
  created_at,
  updated_at,
  published_at,
  deleted_at,
  categories(*),
  profiles(*)
`

type ArticleListOptions = {
  page?: number
  limit?: number
  search?: string
  category?: string
  categoryId?: number
  status?: 'draft' | 'published'
  featured?: boolean
  publishedFrom?: string
  publishedTo?: string
  sortBy?: 'title' | 'published_at' | 'views' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  includeDeleted?: boolean
}

function normalizeStatus(options: ArticleListOptions) {
  return options.status
}

export async function listAdminArticles(options: ArticleListOptions = {}) {
  const page = options.page ?? 1
  const limit = options.limit ?? 20
  const sortBy = options.sortBy ?? 'created_at'
  const sortOrder = options.sortOrder ?? 'desc'
  const { from, to } = toRange(page, limit)

  let query = supabaseAdmin
    .from('articles')
    .select(ARTICLE_LIST_SELECT, { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: sortOrder === 'asc', nullsFirst: false })

  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%,slug.ilike.%${options.search}%`)
  }
  if (options.categoryId) query = query.eq('category_id', options.categoryId)
  if (normalizeStatus(options)) query = query.eq('status', normalizeStatus(options))
  if (options.featured !== undefined) query = query.eq('featured', options.featured)
  if (options.publishedFrom) query = query.gte('published_at', options.publishedFrom)
  if (options.publishedTo) query = query.lte('published_at', options.publishedTo)
  if (!options.includeDeleted) query = query.is('deleted_at', null)

  const { data, error, count } = await query
  if (error) throw error

  return { items: data ?? [], meta: pageMeta(count, page, limit) }
}

export async function listPublicArticles(options: ArticleListOptions = {}) {
  const page = options.page
  const limit = options.limit ?? 20
  const { from, to } = toRange(page ?? 1, limit)
  const categorySelect = options.category ? 'categories!inner(*)' : 'categories(*)'
  const countOption = page !== undefined ? ('exact' as const) : undefined

  let query = supabaseAdmin
    .from('articles')
    .select(`id, title, slug, summary, thumbnail_key, category_id, author_id, views, status, featured, created_at, updated_at, published_at, ${categorySelect}, profiles(username, display_name)`, countOption ? { count: countOption } : undefined)
    .eq('status', 'published')
    .is('deleted_at', null)
    .range(from, to)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (options.category) query = query.eq('categories.slug', options.category)
  if (options.categoryId) query = query.eq('category_id', options.categoryId)
  if (options.featured !== undefined) query = query.eq('featured', options.featured)

  const { data, error, count } = await query
  if (error) throw error

  return { items: data ?? [], meta: pageMeta(count, page ?? 1, limit) }
}

export async function getAdminArticleById(id: number) {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('id', id)
    .single()

  if (error) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy bài viết')
  return data
}

export async function getPublicArticleBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single()

  if (error) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy bài viết')
  return data
}

export async function createArticle(articleData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert(articleData)
    .select(ARTICLE_SELECT)
    .single()

  if (error) throw error
  return data
}

export async function updateArticle(id: number, articleData: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .update({ ...articleData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ARTICLE_SELECT)
    .single()

  if (error) throw error
  return data
}

export async function softDeleteArticle(id: number) {
  const { error } = await supabaseAdmin
    .from('articles')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
  return { id }
}

export async function restoreArticle(id: number) {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ARTICLE_SELECT)
    .single()

  if (error) throw error
  return data
}

export async function listRelatedArticles(article: { id: number; category_id: number | null }, limit = 6) {
  if (!article.category_id) return []

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .eq('category_id', article.category_id)
    .neq('id', article.id)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function listFeaturedArticles(limit = 6) {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .eq('featured', true)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function searchArticles(queryText: string, page = 1, limit = 10) {
  const { from, to } = toRange(page, limit)

  // Normalize helper: strip accents and lowercase for accent-insensitive matching
  const normalize = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();

  const normalizedQuery = normalize(queryText);

  // Use PostgreSQL Full-Text Search via search_vector GIN index for queries >= 2 chars
  // The search_vector uses 'simple' config which is already accent-insensitive
  if (normalizedQuery.length >= 2) {
    const { data, error, count } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_LIST_SELECT, { count: 'exact' })
      .textSearch('search_vector', normalizedQuery, { type: 'plain', config: 'simple' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .range(from, to)
      .order('published_at', { ascending: false, nullsFirst: false });

    if (error) throw error
    return { items: data ?? [], meta: pageMeta(count, page, limit) }
  }

  // Fallback for single-char or empty queries — use normalized query for accent-insensitive matching
  const { data, error, count } = await supabaseAdmin
    .from('articles')
    .select(ARTICLE_LIST_SELECT, { count: 'exact' })
    .or(`title.ilike.%${normalizedQuery}%,summary.ilike.%${normalizedQuery}%`)
    .eq('status', 'published')
    .is('deleted_at', null)
    .range(from, to)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return { items: data ?? [], meta: pageMeta(count, page, limit) }
}


export async function listTrendingArticles(limit = 10, days = 7) {
  let topStats: { article_id: number; total_views: number }[] = []

  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_trending_articles', {
        p_limit: limit,
        p_days: days
      })
    if (error) throw error
    topStats = data ?? []
  } catch (rpcError) {
    console.warn('get_trending_articles RPC failed, falling back to client-side aggregation:', rpcError)
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().slice(0, 10)

    const { data: stats, error: statsError } = await supabaseAdmin
      .from('article_stats_daily')
      .select('article_id, views')
      .gte('date', startDateStr)

    if (statsError) throw statsError

    const viewsMap = new Map<number, number>()
    for (const row of stats ?? []) {
      const artId = Number(row.article_id)
      const views = Number(row.views ?? 0)
      viewsMap.set(artId, (viewsMap.get(artId) ?? 0) + views)
    }

    topStats = Array.from(viewsMap.entries())
      .map(([article_id, total_views]) => ({ article_id, total_views }))
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, limit)
  }

  if (!topStats || topStats.length === 0) return []

  const ids = topStats.map((row: { article_id: number }) => row.article_id)

  const { data: articles, error: articleError } = await supabaseAdmin
    .from('articles')
    .select(ARTICLE_LIST_SELECT)
    .in('id', ids)
    .eq('status', 'published')
    .is('deleted_at', null)

  if (articleError) throw articleError

  // Build a map for O(1) lookups instead of Array.find()
  const articleMap = new Map<number, typeof articles[0]>()
  for (const article of articles ?? []) {
    articleMap.set(article.id, article)
  }

  return topStats
    .map((row: { article_id: number; total_views: number }) => {
      const article = articleMap.get(row.article_id)
      return article ? { ...article, trending_views: row.total_views } : null
    })
    .filter(<T>(a: T): a is NonNullable<T> => a !== null)
}

export async function incrementArticleViews(id: number, count: number) {
  const { data: current, error: currentError } = await supabaseAdmin
    .from('articles')
    .select('views')
    .eq('id', id)
    .single()

  if (currentError) throw currentError

  const { error } = await supabaseAdmin
    .from('articles')
    .update({ views: Number(current.views ?? 0) + count, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

