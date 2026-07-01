'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminAccess } from '@/server/auth'
import { createCategorySchema, updateCategorySchema } from '@/server/validations/category.schema'
import * as categoryService from '@/server/services/category.service'
import { runAction } from './action-result'
import { clearMemoryCache } from '@/lib/api/news'

export async function createCategoryAction(input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const category = await categoryService.createCategory(createCategorySchema.parse(input))
    clearMemoryCache()
    revalidatePath('/')
    return category
  })
}

export async function updateCategoryAction(id: number, input: unknown, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const category = await categoryService.updateCategory(id, updateCategorySchema.parse(input))
    clearMemoryCache()
    revalidatePath('/')
    return category
  })
}

export async function deleteCategoryAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const result = await categoryService.deleteCategory(id)
    clearMemoryCache()
    revalidatePath('/')
    return result
  })
}

export async function restoreCategoryAction(id: number, adminSecret?: string | null) {
  return runAction(async () => {
    await requireAdminAccess(adminSecret)
    const category = await categoryService.restoreCategory(id)
    clearMemoryCache()
    revalidatePath('/')
    return category
  })
}

