import { fail, ok } from '@/server/http'
import { slugParamSchema } from '@/server/validations/common.schema'
import * as categoryService from '@/server/services/category.service'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = slugParamSchema.parse(await context.params)
    return ok(await categoryService.getCategoryBySlug(slug))
  } catch (error) {
    return fail(error)
  }
}

