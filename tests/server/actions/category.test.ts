import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

vi.mock('@/server/services/category.service', () => ({
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  restoreCategory: vi.fn(),
}))

vi.mock('@/server/validations/category.schema', () => ({
  createCategorySchema: { parse: vi.fn((input) => input) },
  updateCategorySchema: { parse: vi.fn((input) => input) },
}))

describe('categoryActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createCategoryAction creates and revalidates', async () => {
    const { createCategory } = await import('@/server/services/category.service')
    vi.mocked(createCategory).mockResolvedValue({ id: 1, name: 'New Cat' })

    const { createCategoryAction } = await import('@/server/actions/category.action')
    const result = await createCategoryAction({ name: 'New Cat' }, 'test-admin-secret')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(1)
    }
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('updateCategoryAction updates and revalidates', async () => {
    const { updateCategory } = await import('@/server/services/category.service')
    vi.mocked(updateCategory).mockResolvedValue({ id: 1, name: 'Updated' })

    const { updateCategoryAction } = await import('@/server/actions/category.action')
    const result = await updateCategoryAction(1, { name: 'Updated' }, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('deleteCategoryAction deletes and revalidates', async () => {
    const { deleteCategory } = await import('@/server/services/category.service')
    vi.mocked(deleteCategory).mockResolvedValue({ id: 1 })

    const { deleteCategoryAction } = await import('@/server/actions/category.action')
    const result = await deleteCategoryAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('restoreCategoryAction restores and revalidates', async () => {
    const { restoreCategory } = await import('@/server/services/category.service')
    vi.mocked(restoreCategory).mockResolvedValue({ id: 1, name: 'Restored' })

    const { restoreCategoryAction } = await import('@/server/actions/category.action')
    const result = await restoreCategoryAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })
})
