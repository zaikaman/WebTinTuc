import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath, revalidateTag } from 'next/cache'

vi.mock('@/server/services/article.service', () => ({
  createNewArticle: vi.fn(),
  updateExistingArticle: vi.fn(),
  deleteExistingArticle: vi.fn(),
  restoreExistingArticle: vi.fn(),
  getAdminArticleById: vi.fn(),
}))

const mockParse = vi.fn((input) => input)
vi.mock('@/server/validations/article.schema', () => ({
  createArticleSchema: { parse: (val: any) => mockParse(val) },
  updateArticleSchema: { parse: (val: any) => mockParse(val) },
}))

describe('articleActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createArticleAction calls service and revalidates public caches', async () => {
    const { createNewArticle } = await import('@/server/services/article.service')
    vi.mocked(createNewArticle).mockResolvedValue({
      id: 1,
      title: 'New Article',
      slug: 'new-article',
      categories: { slug: 'thoi-su' },
    })

    const { createArticleAction } = await import('@/server/actions/article.action')
    const result = await createArticleAction({ title: 'New Article', content: {} }, 'test-admin-secret')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(1)
    }
    expect(revalidateTag).toHaveBeenCalledWith('articles')
    expect(revalidateTag).toHaveBeenCalledWith('admin-articles')
    expect(revalidateTag).toHaveBeenCalledWith('dashboard')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/posts')
    expect(revalidatePath).toHaveBeenCalledWith('/posts/new-article')
    expect(revalidatePath).toHaveBeenCalledWith('/thoi-su')
  })

  it('createArticleAction returns error on failure', async () => {
    const { createNewArticle } = await import('@/server/services/article.service')
    vi.mocked(createNewArticle).mockRejectedValue(new Error('Creation failed'))

    const { createArticleAction } = await import('@/server/actions/article.action')
    const result = await createArticleAction({ title: 'New Article', content: {} }, 'test-admin-secret')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect((result as any).code).toBe('INTERNAL_ERROR')
    }
  })

  it('updateArticleAction calls service and revalidates public caches', async () => {
    const { updateExistingArticle, getAdminArticleById } = await import('@/server/services/article.service')
    vi.mocked(getAdminArticleById).mockResolvedValue({ id: 1, slug: 'old-slug', title: 'Old' } as any)
    vi.mocked(updateExistingArticle).mockResolvedValue({
      id: 1,
      title: 'Updated',
      slug: 'updated-slug',
      categories: { slug: 'the-thao' },
    })

    const { updateArticleAction } = await import('@/server/actions/article.action')
    const result = await updateArticleAction(1, { title: 'Updated' }, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidateTag).toHaveBeenCalledWith('articles')
    expect(revalidatePath).toHaveBeenCalledWith('/posts/updated-slug')
    expect(revalidatePath).toHaveBeenCalledWith('/posts/old-slug')
    expect(revalidatePath).toHaveBeenCalledWith('/the-thao')
  })

  it('deleteArticleAction calls service and revalidates public caches', async () => {
    const { deleteExistingArticle } = await import('@/server/services/article.service')
    vi.mocked(deleteExistingArticle).mockResolvedValue({
      id: 1,
      slug: 'deleted-article',
      categories: { slug: 'kinh-te' },
    })

    const { deleteArticleAction } = await import('@/server/actions/article.action')
    const result = await deleteArticleAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidateTag).toHaveBeenCalledWith('articles')
    expect(revalidatePath).toHaveBeenCalledWith('/posts/deleted-article')
    expect(revalidatePath).toHaveBeenCalledWith('/kinh-te')
  })

  it('restoreArticleAction calls service and revalidates public caches', async () => {
    const { restoreExistingArticle } = await import('@/server/services/article.service')
    vi.mocked(restoreExistingArticle).mockResolvedValue({
      id: 1,
      title: 'Restored',
      slug: 'restored-article',
      categories: { slug: 'cong-nghe' },
    })

    const { restoreArticleAction } = await import('@/server/actions/article.action')
    const result = await restoreArticleAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidateTag).toHaveBeenCalledWith('articles')
    expect(revalidatePath).toHaveBeenCalledWith('/posts/restored-article')
    expect(revalidatePath).toHaveBeenCalledWith('/cong-nghe')
  })
})
