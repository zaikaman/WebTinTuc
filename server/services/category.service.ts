import { generateSlug } from '@/lib/format/slug'
import * as categoryRepository from '@/server/repositories/category.repository'

function normalizeCategoryPayload(data: Record<string, any>) {
  return {
    ...data,
    slug: data.slug ?? (data.name ? generateSlug(data.name) : undefined)
  }
}

export async function listAdminCategories(options = {}) {
  return categoryRepository.listAdminCategories(options)
}

export async function listPublicCategories(limit?: number) {
  return categoryRepository.listPublicCategories(limit)
}

export async function getCategoryById(id: number) {
  return categoryRepository.getCategoryById(id)
}

export async function getCategoryBySlug(slug: string) {
  return categoryRepository.getPublicCategoryBySlug(slug)
}

export async function createCategory(data: Record<string, any>) {
  return categoryRepository.createCategory(normalizeCategoryPayload(data))
}

export async function updateCategory(id: number, data: Record<string, any>) {
  return categoryRepository.updateCategory(id, normalizeCategoryPayload(data))
}

export async function deleteCategory(id: number) {
  return categoryRepository.softDeleteCategory(id)
}

export async function restoreCategory(id: number) {
  return categoryRepository.restoreCategory(id)
}

