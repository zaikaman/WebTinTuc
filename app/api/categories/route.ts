import { NextRequest } from 'next/server'
import { fail, okCached, parseQuery } from '@/server/http'
import { publicCategoryListQuerySchema } from '@/server/validations/category.schema'
import * as categoryService from '@/server/services/category.service'

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, publicCategoryListQuerySchema)
    return okCached(await categoryService.listPublicCategories(query.limit))
  } catch (error) {
    return fail(error)
  }
}

