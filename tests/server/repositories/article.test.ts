import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabaseAdmin } from '@/lib/supabase/admin'

function createMockQuery() {
  let currentData: any = { data: null, error: null, count: 0 }
  const api: any = {
    then: (onfulfilled: any) => Promise.resolve(currentData).then(onfulfilled),
    catch: (onrejected: any) => Promise.resolve(currentData).catch(onrejected),
    finally: (onfinally: any) => Promise.resolve(currentData).finally(onfinally),
    mockResolvedValue: (data: any) => { currentData = data },
  }
  const methods = ['select', 'eq', 'neq', 'is', 'in', 'range', 'order', 'limit',
    'single', 'or', 'gte', 'lte', 'textSearch', 'insert', 'update',
    'maybeSingle', 'delete', 'upsert', 'lt']
  methods.forEach(m => {
    api[m] = vi.fn(() => api)
  })
  return api
}

describe('articleRepository', () => {
  let mockQuery: ReturnType<typeof createMockQuery>

  beforeEach(() => {
    mockQuery = createMockQuery()
    vi.mocked(supabaseAdmin).from = vi.fn().mockReturnValue(mockQuery)
  })

  it('listAdminArticles returns paginated articles', async () => {
    const items = [{ id: 1, title: 'Test', categories: {}, profiles: {} }]
    mockQuery.mockResolvedValue({ data: items, error: null, count: 1 })

    const { listAdminArticles } = await import('@/server/repositories/article.repository')
    const result = await listAdminArticles({ page: 1, limit: 10 })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe(1)
    expect(result.meta.page).toBe(1)
  })

  it('listAdminArticles with search query', async () => {
    mockQuery.mockResolvedValue({ data: [], error: null, count: 0 })

    const { listAdminArticles } = await import('@/server/repositories/article.repository')
    await listAdminArticles({ search: 'test' })

    expect(mockQuery.or).toHaveBeenCalled()
  })

  it('listPublicArticles only returns published, non-deleted', async () => {
    const items = [{ id: 2, title: 'Public', categories: {}, profiles: {} }]
    mockQuery.mockResolvedValue({ data: items, error: null, count: 1 })

    const { listPublicArticles } = await import('@/server/repositories/article.repository')
    const result = await listPublicArticles()

    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe(2)
  })

  it('getAdminArticleById fetches single article', async () => {
    const article = { id: 1, title: 'Single', categories: {}, profiles: {} }
    mockQuery.mockResolvedValue({ data: article, error: null })

    const { getAdminArticleById } = await import('@/server/repositories/article.repository')
    const result = await getAdminArticleById(1)

    expect(result.id).toBe(1)
  })

  it('getAdminArticleById throws 404 when not found', async () => {
    mockQuery.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

    const { getAdminArticleById } = await import('@/server/repositories/article.repository')
    await expect(getAdminArticleById(999)).rejects.toThrow('Không tìm thấy bài viết')
  })

  it('createArticle inserts and returns data', async () => {
    const article = { id: 1, title: 'New', categories: {}, profiles: {} }
    mockQuery.mockResolvedValue({ data: article, error: null })

    const { createArticle } = await import('@/server/repositories/article.repository')
    const result = await createArticle({ title: 'New' })

    expect(result.id).toBe(1)
    expect(mockQuery.insert).toHaveBeenCalledWith({ title: 'New' })
  })

  it('updateArticle updates and returns', async () => {
    const article = { id: 1, title: 'Updated', categories: {}, profiles: {} }
    mockQuery.mockResolvedValue({ data: article, error: null })

    const { updateArticle } = await import('@/server/repositories/article.repository')
    const result = await updateArticle(1, { title: 'Updated' })

    expect(result.title).toBe('Updated')
    expect(mockQuery.update).toHaveBeenCalled()
  })

  it('softDeleteArticle sets deleted_at and returns article', async () => {
    const article = { id: 1, slug: 'deleted-slug', categories: { slug: 'thoi-su' }, profiles: {} }
    mockQuery.mockResolvedValue({ data: article, error: null })

    const { softDeleteArticle } = await import('@/server/repositories/article.repository')
    const result = await softDeleteArticle(1)

    expect(result.id).toBe(1)
    expect(result.slug).toBe('deleted-slug')
    expect(mockQuery.update).toHaveBeenCalled()
    expect(mockQuery.select).toHaveBeenCalled()
  })

  it('restoreArticle sets deleted_at to null', async () => {
    const article = { id: 1, title: 'Restored', categories: {}, profiles: {} }
    mockQuery.mockResolvedValue({ data: article, error: null })

    const { restoreArticle } = await import('@/server/repositories/article.repository')
    const result = await restoreArticle(1)

    expect(result.id).toBe(1)
  })

  it('searchArticles uses textSearch for queries >= 2 chars', async () => {
    mockQuery.mockResolvedValue({ data: [], error: null, count: 0 })

    const { searchArticles } = await import('@/server/repositories/article.repository')
    await searchArticles('test query', 1, 10)

    expect(mockQuery.textSearch).toHaveBeenCalled()
  })

  it('listTrendingArticles uses RPC and returns sorted', async () => {
    const topStats = [
      { article_id: 1, total_views: 100 },
      { article_id: 2, total_views: 50 },
    ]
    const articles = [
      { id: 1, title: 'Popular', categories: {}, profiles: {} },
      { id: 2, title: 'Less Popular', categories: {}, profiles: {} },
    ]

    const mockQuery1 = createMockQuery()
    mockQuery1.mockResolvedValue({ data: topStats, error: null })
    const mockQuery2 = createMockQuery()
    mockQuery2.mockResolvedValue({ data: articles, error: null })

    vi.mocked(supabaseAdmin).rpc = vi.fn().mockReturnValue(mockQuery1)
    vi.mocked(supabaseAdmin).from = vi.fn().mockReturnValue(mockQuery2)

    const { listTrendingArticles } = await import('@/server/repositories/article.repository')
    const result = await listTrendingArticles(5, 7)

    expect(result).toHaveLength(2)
    expect(result[0].trending_views).toBe(100)
    expect(supabaseAdmin.rpc).toHaveBeenCalledWith('get_trending_articles', { p_limit: 5, p_days: 7 })
  })

  it('incrementArticleViews increments existing views', async () => {
    const currentArticle = { id: 1, views: 10 }
    // First call: select views
    const mockQuery1 = createMockQuery()
    mockQuery1.mockResolvedValue({ data: currentArticle, error: null })
    // Second call: update
    const mockQuery2 = createMockQuery()
    mockQuery2.mockResolvedValue({ error: null })

    vi.mocked(supabaseAdmin).from
      .mockReturnValueOnce(mockQuery1)
      .mockReturnValueOnce(mockQuery2)

    const { incrementArticleViews } = await import('@/server/repositories/article.repository')
    await incrementArticleViews(1, 5)

    expect(mockQuery1.single).toHaveBeenCalled()
    expect(mockQuery2.update).toHaveBeenCalled()
  })
})
