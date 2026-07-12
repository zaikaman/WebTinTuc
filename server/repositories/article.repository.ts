import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiError } from '@/server/http'
import { orIlikeContains } from '@/server/lib/postgrest'
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

/** Columns needed for public article cards / list rows (no content, no profiles). */
const ARTICLE_CARD_SELECT = `
  id,
  title,
  slug,
  summary,
  thumbnail_key,
  views,
  published_at,
  created_at
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
    const queryText = options.search.trim()
    
    // Regex matches any Vietnamese character with accents
    const hasAccents = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễđìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i.test(queryText)

    if (hasAccents) {
      // Accent-sensitive search: use exact ilike matching on title to prevent mixing up "bão" and "bảo"
      query = query.ilike('title', `%${queryText}%`)
    } else {
      // Accent-insensitive search: use textSearch on search_vector GIN index for smart token matching
      const normalizedQuery = queryText
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .trim()

      if (normalizedQuery.length >= 2) {
        const tokens = normalizedQuery
          .split(/\s+/)
          .map((t) => t.replace(/['&|!():*<>]/g, ''))
          .filter((t) => t.length > 0)

        if (tokens.length > 0) {
          const tsQuery = tokens.map((t) => `${t}:A`).join(' & ')
          query = query.textSearch('search_vector', tsQuery, { config: 'simple' })
        }
      } else if (queryText.length > 0) {
        query = query.ilike('title', `%${queryText}%`)
      }
    }
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
  const categorySelect = options.category ? 'categories!inner(name, slug)' : 'categories(name, slug)'
  const countOption = page !== undefined ? ('exact' as const) : undefined

  let query = supabaseAdmin
    .from('articles')
    .select(`${ARTICLE_CARD_SELECT}, ${categorySelect}`, countOption ? { count: countOption } : undefined)
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
  const { data, error } = await supabaseAdmin
    .from('articles')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ARTICLE_SELECT)
    .single()

  if (error) throw error
  return data
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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()

  const trimmedQuery = queryText.trim()
  const normalizedQuery = normalize(trimmedQuery)

  // Title-only search. search_vector weights: title = A, summary = B (see articles_search_vector_update).
  // Restrict tsquery terms to weight A so summary-only matches (false positives in the header
  // suggestions dropdown) are excluded, while unaccent + GIN index stay in use.
  if (normalizedQuery.length >= 2) {
    const tokens = normalizedQuery
      .split(/\s+/)
      .map((t) => t.replace(/['&|!():*<>]/g, ''))
      .filter((t) => t.length > 0)

    if (tokens.length === 0) {
      return { items: [], meta: pageMeta(0, page, limit) }
    }

    // to_tsquery (default textSearch type) supports weight labels; plainto_tsquery does not.
    const tsQuery = tokens.map((t) => `${t}:A`).join(' & ')

    const { data, error, count } = await supabaseAdmin
      .from('articles')
      .select(ARTICLE_LIST_SELECT, { count: 'exact' })
      .textSearch('search_vector', tsQuery, { config: 'simple' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .range(from, to)
      .order('published_at', { ascending: false, nullsFirst: false })

    if (error) throw error
    return { items: data ?? [], meta: pageMeta(count, page, limit) }
  }

  // Fallback for single-char queries — title only (substring match)
  const { data, error, count } = await supabaseAdmin
    .from('articles')
    .select(ARTICLE_LIST_SELECT, { count: 'exact' })
    .or(orIlikeContains(['title'], trimmedQuery || normalizedQuery))
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

/** Atomically add to articles.views (SQL UPDATE … views = views + count). */
export async function incrementArticleViews(id: number, count: number) {
  if (count <= 0) return

  const { error } = await supabaseAdmin.rpc('increment_article_views', {
    p_id: id,
    p_count: count
  })

  if (error) throw error
}

