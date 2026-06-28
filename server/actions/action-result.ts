import { ApiError, ActionResult } from '@/server/http'
import { ZodError, z } from 'zod'

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
      return {
        success: false,
        code: 'BAD_REQUEST',
        message: 'Dữ liệu không hợp lệ',
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
