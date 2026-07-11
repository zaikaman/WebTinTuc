import { describe, it, expect } from 'vitest'
import { runAction } from '@/server/actions/action-result'
import { ApiError } from '@/server/http'
import { z } from 'zod'

describe('runAction', () => {
  it('returns success result when handler succeeds', async () => {
    const result = await runAction(async () => ({ id: 1, name: 'test' }))
    expect(result).toEqual({ success: true, data: { id: 1, name: 'test' } })
  })

  it('returns error result when handler throws ApiError', async () => {
    const result = await runAction(async () => {
      throw new ApiError(404, 'NOT_FOUND', 'Item not found')
    })
    expect(result).toEqual({
      success: false,
      code: 'NOT_FOUND',
      message: 'Item not found',
    })
  })

  it('includes ApiError details in error result', async () => {
    const result = await runAction(async () => {
      throw new ApiError(400, 'BAD_REQUEST', 'Invalid', { field: 'email' })
    })
    expect(result).toEqual({
      success: false,
      code: 'BAD_REQUEST',
      message: 'Invalid',
      details: { field: 'email' },
    })
  })

  it('returns error result when handler throws ZodError', async () => {
    const result = await runAction(async () => {
      const schema = z.object({ name: z.string().min(1) })
      schema.parse({ name: '' })
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect((result as any).code).toBe('BAD_REQUEST')
      expect((result as any).message).toContain('Tên')
    }
  })

  it('returns internal error for unknown errors without leaking internal details', async () => {
    const result = await runAction(async () => {
      throw new Error('relation "secret_table" does not exist')
    })
    expect(result).toEqual({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Lỗi hệ thống',
    })
    if (!result.success) {
      expect(result.message).not.toContain('secret_table')
    }
  })

  it('returns generic message for non-Error throws', async () => {
    const result = await runAction(async () => {
      throw 'string error'
    })
    expect(result).toEqual({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Lỗi hệ thống',
    })
  })
})
