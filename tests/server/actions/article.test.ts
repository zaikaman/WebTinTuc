import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

vi.mock('@/server/services/article.service', () => ({
  createNewArticle: vi.fn(),
  updateExistingArticle: vi.fn(),
  deleteExistingArticle: vi.fn(),
  restoreExistingArticle: vi.fn(),
}))

const mockParse = vi.fn((input) => input)
vi.mock('@/server/validations/article.schema', () => ({
  createArticleSchema: { parse: (...args: any[]) => mockParse(...args) },
  updateArticleSchema: { parse: (...args: any[]) => mockParse(...args) },
}))

describe('articleActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createArticleAction calls service and revalidates', async () => {
    const { createNewArticle } = await import('@/server/services/article.service')
    vi.mocked(createNewArticle).mockResolvedValue({ id: 1, title: 'New Article' })

    const { createArticleAction } = await import('@/server/actions/article.action')
    const result = await createArticleAction({ title: 'New Article', content: {} }, 'test-admin-secret')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(1)
    }
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('createArticleAction returns error on failure', async () => {
    const { createNewArticle } = await import('@/server/services/article.service')
    vi.mocked(createNewArticle).mockRejectedValue(new Error('Creation failed'))

    const { createArticleAction } = await import('@/server/actions/article.action')
    const result = await createArticleAction({ title: 'New Article', content: {} }, 'test-admin-secret')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('INTERNAL_ERROR')
    }
  })

  it('updateArticleAction calls service and revalidates', async () => {
    const { updateExistingArticle } = await import('@/server/services/article.service')
    vi.mocked(updateExistingArticle).mockResolvedValue({ id: 1, title: 'Updated' })

    const { updateArticleAction } = await import('@/server/actions/article.action')
    const result = await updateArticleAction(1, { title: 'Updated' }, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('deleteArticleAction calls service and revalidates', async () => {
    const { deleteExistingArticle } = await import('@/server/services/article.service')
    vi.mocked(deleteExistingArticle).mockResolvedValue({ id: 1 })

    const { deleteArticleAction } = await import('@/server/actions/article.action')
    const result = await deleteArticleAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('restoreArticleAction calls service and revalidates', async () => {
    const { restoreExistingArticle } = await import('@/server/services/article.service')
    vi.mocked(restoreExistingArticle).mockResolvedValue({ id: 1, title: 'Restored' })

    const { restoreArticleAction } = await import('@/server/actions/article.action')
    const result = await restoreArticleAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })
})
