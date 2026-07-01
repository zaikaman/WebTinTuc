import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('ApiError', () => {
  it('creates error with message and status', async () => {
    const { ApiError } = await import('@/lib/api/http')
    const error = new ApiError('Not found', 404)
    expect(error.message).toBe('Not found')
    expect(error.status).toBe(404)
    expect(error.name).toBe('ApiError')
  })

  it('is an instance of Error', async () => {
    const { ApiError } = await import('@/lib/api/http')
    const error = new ApiError('Bad request', 400)
    expect(error).toBeInstanceOf(Error)
  })
})

describe('isRemoteApiEnabled', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns false when NEXT_PUBLIC_USE_MOCKS is not false', async () => {
    process.env.NEXT_PUBLIC_USE_MOCKS = 'true'
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://api.example.com'
    const { isRemoteApiEnabled } = await import('@/lib/api/http')
    expect(isRemoteApiEnabled()).toBe(false)
  })

  it('returns false when API_BASE_URL is not set', async () => {
    process.env.NEXT_PUBLIC_USE_MOCKS = 'false'
    delete process.env.NEXT_PUBLIC_API_BASE_URL
    const { isRemoteApiEnabled } = await import('@/lib/api/http')
    expect(isRemoteApiEnabled()).toBe(false)
  })

  it('returns true when USE_MOCKS is false and API_BASE_URL is set', async () => {
    process.env.NEXT_PUBLIC_USE_MOCKS = 'false'
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://api.example.com'
    const { isRemoteApiEnabled } = await import('@/lib/api/http')
    expect(isRemoteApiEnabled()).toBe(true)
  })
})

describe('apiGet', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    globalThis.fetch = vi.fn()
    process.env = { ...originalEnv, NEXT_PUBLIC_API_BASE_URL: 'http://api.example.com' }
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env = originalEnv
  })

  it('makes a GET request and returns data', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'test' }),
    } as Response)

    const { apiGet } = await import('@/lib/api/http')
    const result = await apiGet('/articles')
    expect(result).toEqual({ id: 1, name: 'test' })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://api.example.com/articles',
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: 'application/json' }),
      })
    )
  })

  it('unwraps envelope { data: T }', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: 1 }, success: true }),
    } as Response)

    const { apiGet } = await import('@/lib/api/http')
    const result = await apiGet('/articles/1')
    expect(result).toEqual({ id: 1 })
  })

  it('unwraps envelope { data: array }', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [1, 2, 3] }),
    } as Response)

    const { apiGet } = await import('@/lib/api/http')
    const result = await apiGet('/items')
    expect(result).toEqual([1, 2, 3])
  })

  it('throws ApiError on non-ok response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({}),
    } as Response)

    const { apiGet, ApiError } = await import('@/lib/api/http')
    await expect(apiGet('/articles/999')).rejects.toThrow(ApiError)
  })

  it('re-throws fetch error when no timeout abort occurred', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network failure'))

    const { apiGet } = await import('@/lib/api/http')
    await expect(apiGet('/articles')).rejects.toThrow('Network failure')
  })

  it('throws ApiError when BASE_URL is not configured', async () => {
    vi.resetModules()
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_API_BASE_URL

    const { apiGet, ApiError } = await import('@/lib/api/http')
    await expect(apiGet('/test')).rejects.toThrow(ApiError)
  })
})
