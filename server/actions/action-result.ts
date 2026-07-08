import { ApiError, ActionResult } from '@/server/http'
import { ZodError, z } from 'zod'
import { formatZodIssue } from '@/server/validations/i18n'

export async function runAction<T>(handler: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await handler() }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        code: error.code,
        message: error.message,
        details: error.details
      }
    }

    if (error instanceof ZodError) {
      const issues = error.issues.map((e) => formatZodIssue(e));
      return {
        success: false,
        code: 'BAD_REQUEST',
        message: issues.length > 0 ? issues.join('; ') : 'Dữ liệu không hợp lệ',
        details: z.treeifyError(error)
      }
    }

    return {
      success: false,
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Lỗi hệ thống'
    }
  }
}

