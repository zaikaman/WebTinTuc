import { describe, it, expect } from 'vitest'
import { ApiError, ok, created, noContent, fail, parseQuery, parseBody, actionResponse } from '@/server/http'
import { z } from 'zod'
import { NextRequest } from 'next/server'

describe('ApiError', () => {
  it('creates an error with status, code, and message', () => {
    const error = new ApiError(404, 'NOT_FOUND', 'Resource not found')
    expect(error.status).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe('Resource not found')
    expect(error.details).toBeUndefined()
  })

  it('includes optional details', () => {
    const details = { field: 'id', reason: 'missing' }
    const error = new ApiError(400, 'BAD_REQUEST', 'Invalid input', details)
    expect(error.details).toEqual(details)
  })

  it('is an instance of Error', () => {
    const error = new ApiError(500, 'INTERNAL_ERROR', 'Oops')
    expect(error).toBeInstanceOf(Error)
  })
})

describe('ok', () => {
  it('returns a successful JSON response', async () => {
    const data = { id: 1, name: 'test' }
    const response = ok(data)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ success: true, data })
  })

  it('includes cache control headers by default', () => {
    const response = ok({})
    const cacheControl = response.headers.get('Cache-Control')
    expect(cacheControl).toContain('public')
    expect(cacheControl).toContain('s-maxage=60')
  })

  it('merges with custom init', async () => {
    const data = { message: 'custom' }
    const response = ok(data, { status: 201, headers: { 'X-Custom': 'value' } })
    expect(response.status).toBe(201)
    expect(response.headers.get('X-Custom')).toBe('value')
    const body = await response.json()
    expect(body).toEqual({ success: true, data })
  })
})

describe('created', () => {
  it('returns a 201 response', async () => {
    const data = { id: 1 }
    const response = created(data)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toEqual({ success: true, data })
  })
})

describe('noContent', () => {
  it('returns a success response with default message', async () => {
    const response = noContent()
    const body = await response.json()
    expect(body).toEqual({ success: true, message: 'OK' })
  })

  it('returns a success response with custom message', async () => {
    const response = noContent('Deleted')
    const body = await response.json()
    expect(body).toEqual({ success: true, message: 'Deleted' })
  })
})

describe('fail', () => {
  it('handles ZodError', async () => {
    const schema = z.object({ name: z.string().min(1) })
    let zodError: z.ZodError | null = null
    try {
      schema.parse({ name: '' })
    } catch (e) {
      zodError = e as z.ZodError
    }
    const response = fail(zodError!)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.code).toBe('BAD_REQUEST')
  })

  it('handles ApiError', async () => {
    const apiError = new ApiError(403, 'FORBIDDEN', 'Access denied')
    const response = fail(apiError)
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.code).toBe('FORBIDDEN')
    expect(body.message).toBe('Access denied')
  })

  it('handles unknown errors as 500', async () => {
    const response = fail(new Error('Something broke'))
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.code).toBe('INTERNAL_ERROR')
    expect(body.message).toBe('Something broke')
  })

  it('handles non-Error values as 500', async () => {
    const response = fail('string error')
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.code).toBe('INTERNAL_ERROR')
    expect(body.message).toBe('Internal Server Error')
  })
})

describe('parseQuery', () => {
  it('parses query parameters from request URL', () => {
    const schema = z.object({ page: z.coerce.number(), limit: z.coerce.number() })
    const url = new URL('http://localhost?page=1&limit=20')
    const request = new NextRequest(url)
    const result = parseQuery(request, schema)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  it('throws ZodError on invalid query params', () => {
    const schema = z.object({ page: z.coerce.number().positive() })
    const url = new URL('http://localhost?page=-1')
    const request = new NextRequest(url)
    expect(() => parseQuery(request, schema)).toThrow()
  })
})

describe('parseBody', () => {
  it('parses JSON body from request', async () => {
    const schema = z.object({ name: z.string() })
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    })
    const result = await parseBody(request, schema)
    expect(result.name).toBe('test')
  })

  it('throws ZodError on invalid body', async () => {
    const schema = z.object({ name: z.string().min(5) })
    const request = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ name: 'abc' }),
    })
    await expect(parseBody(request, schema)).rejects.toThrow()
  })
})

describe('actionResponse', () => {
  it('returns success response for successful result', async () => {
    const result = { success: true as const, data: { id: 1 } }
    const response = actionResponse(result)
    const body = await response.json()
    expect(body).toEqual(result)
  })

  it('returns error response with appropriate status code', async () => {
    const result = { success: false as const, message: 'Not found', code: 'NOT_FOUND' as const }
    const response = actionResponse(result)
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toEqual(result)
  })

  it('defaults to 400 for errors without code', async () => {
    const result = { success: false as const, message: 'Something went wrong' }
    const response = actionResponse(result)
    expect(response.status).toBe(400)
  })
})
