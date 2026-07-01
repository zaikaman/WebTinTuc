import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as categoryService from '@/server/services/category.service'
import * as categoryRepository from '@/server/repositories/category.repository'

vi.mock('@/server/repositories/category.repository', () => ({
  listAdminCategories: vi.fn(),
  listPublicCategories: vi.fn(),
  getCategoryById: vi.fn(),
  getPublicCategoryBySlug: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  softDeleteCategory: vi.fn(),
  restoreCategory: vi.fn(),
}))

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listAdminCategories delegates to repository', async () => {
    const mockResult = { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } }
    vi.mocked(categoryRepository.listAdminCategories).mockResolvedValue(mockResult)

    const result = await categoryService.listAdminCategories()
    expect(result).toEqual(mockResult)
  })

  it('listPublicCategories delegates to repository', async () => {
    vi.mocked(categoryRepository.listPublicCategories).mockResolvedValue([])

    const result = await categoryService.listPublicCategories(50)
    expect(result).toEqual([])
    expect(categoryRepository.listPublicCategories).toHaveBeenCalledWith(50)
  })

  it('getCategoryById delegates to repository', async () => {
    const mockCategory = { id: 1, name: 'Test' }
    vi.mocked(categoryRepository.getCategoryById).mockResolvedValue(mockCategory)

    const result = await categoryService.getCategoryById(1)
    expect(result).toEqual(mockCategory)
  })

  it('getCategoryBySlug delegates to repository', async () => {
    const mockCategory = { id: 1, slug: 'test', name: 'Test' }
    vi.mocked(categoryRepository.getPublicCategoryBySlug).mockResolvedValue(mockCategory)

    const result = await categoryService.getCategoryBySlug('test')
    expect(result).toEqual(mockCategory)
  })

  it('createCategory normalizes payload and delegates', async () => {
    const mockCategory = { id: 1, name: 'New Cat', slug: 'new-cat' }
    vi.mocked(categoryRepository.createCategory).mockResolvedValue(mockCategory)

    const result = await categoryService.createCategory({ name: 'New Cat' })
    expect(result).toEqual(mockCategory)
    // Should have auto-generated a slug
    const passedArg = vi.mocked(categoryRepository.createCategory).mock.calls[0][0]
    expect(passedArg.slug).toBeDefined()
  })

  it('createCategory uses provided slug', async () => {
    vi.mocked(categoryRepository.createCategory).mockResolvedValue({ id: 1, name: 'Test' } as any)

    await categoryService.createCategory({ name: 'Test', slug: 'custom-slug' })
    const passedArg = vi.mocked(categoryRepository.createCategory).mock.calls[0][0]
    expect(passedArg.slug).toBe('custom-slug')
  })

  it('updateCategory updates with slug if changed', async () => {
    vi.mocked(categoryRepository.updateCategory).mockResolvedValue({ id: 1 } as any)

    await categoryService.updateCategory(1, { name: 'Updated' })
    expect(categoryRepository.updateCategory).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Updated' }))
  })

  it('deleteCategory delegates to softDelete', async () => {
    vi.mocked(categoryRepository.softDeleteCategory).mockResolvedValue({ id: 1 })

    const result = await categoryService.deleteCategory(1)
    expect(result).toEqual({ id: 1 })
  })

  it('restoreCategory delegates to repository', async () => {
    vi.mocked(categoryRepository.restoreCategory).mockResolvedValue({ id: 1 } as any)

    const result = await categoryService.restoreCategory(1)
    expect(result).toEqual({ id: 1 })
  })
})
