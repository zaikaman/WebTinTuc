import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as articleService from '@/server/services/article.service'
import * as articleRepository from '@/server/repositories/article.repository'
import * as redirectRepository from '@/server/repositories/redirect.repository'
import * as categoryRepository from '@/server/repositories/category.repository'

vi.mock('@/server/repositories/article.repository', () => ({
  listAdminArticles: vi.fn(),
  listPublicArticles: vi.fn(),
  getAdminArticleById: vi.fn(),
  getPublicArticleBySlug: vi.fn(),
  createArticle: vi.fn(),
  updateArticle: vi.fn(),
  softDeleteArticle: vi.fn(),
  restoreArticle: vi.fn(),
  listRelatedArticles: vi.fn(),
  listFeaturedArticles: vi.fn(),
  searchArticles: vi.fn(),
  listTrendingArticles: vi.fn(),
}))

vi.mock('@/server/repositories/redirect.repository', () => ({
  upsertRedirect: vi.fn(),
}))

vi.mock('@/server/repositories/category.repository', () => ({
  getPublicCategoryBySlug: vi.fn(),
}))

describe('articleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listAdminArticles delegates to repository', async () => {
    const mockResult = { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } }
    vi.mocked(articleRepository.listAdminArticles).mockResolvedValue(mockResult)

    const result = await articleService.listAdminArticles()
    expect(result).toEqual(mockResult)
  })

  it('listPublicArticles delegates to repository', async () => {
    vi.mocked(articleRepository.listPublicArticles).mockResolvedValue({ items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } })

    const result = await articleService.listPublicArticles({ featured: true })
    expect(result).toBeDefined()
    expect(articleRepository.listPublicArticles).toHaveBeenCalledWith({ featured: true })
  })

  it('getAdminArticleById delegates to repository', async () => {
    vi.mocked(articleRepository.getAdminArticleById).mockResolvedValue({ id: 1 } as any)

    const result = await articleService.getAdminArticleById(1)
    expect(result).toEqual({ id: 1 })
  })

  it('getArticleBySlug delegates to repository', async () => {
    vi.mocked(articleRepository.getPublicArticleBySlug).mockResolvedValue({ id: 1, slug: 'test' } as any)

    const result = await articleService.getArticleBySlug('test')
    expect(result).toEqual({ id: 1, slug: 'test' })
  })

  it('createNewArticle normalizes payload and creates', async () => {
    vi.mocked(articleRepository.createArticle).mockResolvedValue({ id: 1 } as any)

    const result = await articleService.createNewArticle({ title: 'Test Article' })
    expect(result).toEqual({ id: 1 })
  })

  it('createNewArticle uses provided slug', async () => {
    vi.mocked(articleRepository.createArticle).mockResolvedValue({ id: 1 } as any)

    await articleService.createNewArticle({ title: 'Test', slug: 'custom-slug' })
    const payload = vi.mocked(articleRepository.createArticle).mock.calls[0][0]
    expect(payload.slug).toBe('custom-slug')
  })

  it('createNewArticle handles published=true', async () => {
    vi.mocked(articleRepository.createArticle).mockResolvedValue({ id: 1 } as any)

    await articleService.createNewArticle({ title: 'Test', published: true })
    const payload = vi.mocked(articleRepository.createArticle).mock.calls[0][0]
    expect(payload.status).toBe('published')
    expect(payload.published_at).toBeDefined()
  })

  it('createNewArticle handles published=false', async () => {
    vi.mocked(articleRepository.createArticle).mockResolvedValue({ id: 1 } as any)

    await articleService.createNewArticle({ title: 'Test', published: false })
    const payload = vi.mocked(articleRepository.createArticle).mock.calls[0][0]
    expect(payload.status).toBe('draft')
  })

  it('updateExistingArticle creates redirect when slug changes', async () => {
    vi.mocked(articleRepository.getAdminArticleById).mockResolvedValue({ id: 1, slug: 'old-slug' } as any)
    vi.mocked(articleRepository.updateArticle).mockResolvedValue({ id: 1, slug: 'new-slug' } as any)
    vi.mocked(redirectRepository.upsertRedirect).mockResolvedValue({} as any)

    await articleService.updateExistingArticle(1, { slug: 'new-slug' })

    expect(redirectRepository.upsertRedirect).toHaveBeenCalledWith({
      from_path: '/posts/old-slug',
      to_path: '/posts/new-slug',
      status_code: 301,
    })
  })

  it('updateExistingArticle does not create redirect when title and slug unchanged', async () => {
    vi.mocked(articleRepository.getAdminArticleById).mockResolvedValue({ id: 1, title: 'same-title', slug: 'same-slug' } as any)
    vi.mocked(articleRepository.updateArticle).mockResolvedValue({ id: 1 } as any)

    await articleService.updateExistingArticle(1, { title: 'same-title' })

    expect(redirectRepository.upsertRedirect).not.toHaveBeenCalled()
  })

  it('updateExistingArticle does not create redirect when slug not in update data and title unchanged', async () => {
    vi.mocked(articleRepository.getAdminArticleById).mockResolvedValue({ id: 1, title: 'same-title', slug: 'same-slug' } as any)

    await articleService.updateExistingArticle(1, { title: 'same-title' })

    expect(redirectRepository.upsertRedirect).not.toHaveBeenCalled()
  })

  it('deleteExistingArticle delegates to softDelete', async () => {
    const deleted = { id: 1, slug: 'deleted-slug', categories: { slug: 'thoi-su' } }
    vi.mocked(articleRepository.softDeleteArticle).mockResolvedValue(deleted as any)

    const result = await articleService.deleteExistingArticle(1)
    expect(result).toEqual(deleted)
  })

  it('restoreExistingArticle delegates to repository', async () => {
    vi.mocked(articleRepository.restoreArticle).mockResolvedValue({ id: 1 } as any)

    const result = await articleService.restoreExistingArticle(1)
    expect(result).toEqual({ id: 1 })
  })

  it('getRelatedArticles delegates to repository', async () => {
    vi.mocked(articleRepository.getPublicArticleBySlug).mockResolvedValue({ id: 1, category_id: 5 } as any)
    vi.mocked(articleRepository.listRelatedArticles).mockResolvedValue([])

    const result = await articleService.getRelatedArticles('test-article', 6)
    expect(result).toEqual([])
    expect(articleRepository.listRelatedArticles).toHaveBeenCalledWith({ id: 1, category_id: 5 }, 6)
  })

  it('getFeaturedArticles delegates to repository', async () => {
    vi.mocked(articleRepository.listFeaturedArticles).mockResolvedValue([])

    const result = await articleService.getFeaturedArticles(5)
    expect(result).toEqual([])
    expect(articleRepository.listFeaturedArticles).toHaveBeenCalledWith(5)
  })

  it('searchArticles delegates to repository', async () => {
    vi.mocked(articleRepository.searchArticles).mockResolvedValue({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } })

    const result = await articleService.searchArticles('test', 1, 10)
    expect(result).toBeDefined()
    expect(articleRepository.searchArticles).toHaveBeenCalledWith('test', 1, 10)
  })

  it('getTrendingArticles delegates to repository', async () => {
    vi.mocked(articleRepository.listTrendingArticles).mockResolvedValue([])

    const result = await articleService.getTrendingArticles(5)
    expect(result).toEqual([])
    expect(articleRepository.listTrendingArticles).toHaveBeenCalledWith(5)
  })

  it('getArticlesOptions normalizes published filter', async () => {
    vi.mocked(articleRepository.listPublicArticles).mockResolvedValue({ items: [{ id: 1 }] as any, meta: { page: 1, limit: 20, total: 1, totalPages: 1 } })

    const result = await articleService.getArticlesOptions({ limit: '10', published: 'true' })
    expect(result).toEqual([{ id: 1 }])
    expect(articleRepository.listPublicArticles).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'published', limit: 10 })
    )
  })

  it('getArticlesByCategorySlug fetches category and articles', async () => {
    const mockCategory = { id: 1, slug: 'tin-tuc', name: 'Tin tức' }
    const mockArticles = { items: [{ id: 1 }], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }

    vi.mocked(categoryRepository.getPublicCategoryBySlug).mockResolvedValue(mockCategory)
    vi.mocked(articleRepository.listPublicArticles).mockResolvedValue(mockArticles as any)

    const result = await articleService.getArticlesByCategorySlug('tin-tuc', { page: 1, limit: 20 })

    expect(result.category).toEqual(mockCategory)
    expect(result.articles).toEqual(mockArticles)
    expect(articleRepository.listPublicArticles).toHaveBeenCalledWith({
      category: 'tin-tuc',
      page: 1,
      limit: 20,
    })
  })
})
