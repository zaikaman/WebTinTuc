import { unstable_cache } from 'next/cache'
import { generateSlug } from '@/lib/format/slug'
import * as categoryRepository from '@/server/repositories/category.repository'

type CategoryPayload = {
  name?: string | undefined
  slug?: string | undefined
  priority?: number | undefined
  description?: string | null | undefined
  status?: 'active' | 'inactive' | undefined
}

function normalizeCategoryPayload(data: CategoryPayload, isUpdate = false) {
  const payload = { ...data }
  if (isUpdate) {
    delete payload.slug
  } else if (!payload.slug && payload.name) {
    payload.slug = generateSlug(payload.name)
  }
  return payload
}

export const listAdminCategories = unstable_cache(
  async (options = {}) => {
    return categoryRepository.listAdminCategories(options)
  },
  ['admin-categories-list'],
  { revalidate: 300, tags: ['admin-categories'] }
)

export async function listPublicCategories(limit?: number) {
  return categoryRepository.listPublicCategories(limit)
}

export async function getCategoryById(id: number) {
  return categoryRepository.getCategoryById(id)
}

export async function getCategoryBySlug(slug: string) {
  return categoryRepository.getPublicCategoryBySlug(slug)
}

export async function createCategory(data: CategoryPayload) {
  return categoryRepository.createCategory(normalizeCategoryPayload(data, false))
}

export async function updateCategory(id: number, data: CategoryPayload) {
  return categoryRepository.updateCategory(id, normalizeCategoryPayload(data, true))
}

export async function deleteCategory(id: number) {
  return categoryRepository.softDeleteCategory(id)
}

export async function restoreCategory(id: number) {
  return categoryRepository.restoreCategory(id)
}

