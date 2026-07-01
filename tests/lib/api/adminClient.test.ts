import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('adminClient', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = process.env

  beforeEach(() => {
    globalThis.fetch = vi.fn()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_BASE_URL: '/api',
    }
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    process.env = originalEnv
  })

  describe('fetchAdmin (internal)', () => {
    it('makes a successful GET request', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1 }], success: true }),
      } as Response)

      const { getAdminArticles } = await import('@/lib/api/adminClient')
      const result = await getAdminArticles()

      expect(result).toEqual([{ id: 1 }])
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/articles',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-admin-secret': 'admin-api-secret',
          }),
        })
      )
    })

    it('throws on error response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Article not found' }),
      } as Response)

      const { getAdminArticles } = await import('@/lib/api/adminClient')
      await expect(getAdminArticles()).rejects.toThrow('Article not found')
    })

    it('handles JSON parse error in error response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)

      const { getAdminArticles } = await import('@/lib/api/adminClient')
      await expect(getAdminArticles()).rejects.toThrow('Internal Server Error')
    })

    it('appends query string to URL', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], success: true }),
      } as Response)

      const { getAdminArticles } = await import('@/lib/api/adminClient')
      await getAdminArticles('?page=2&limit=10')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/articles?page=2&limit=10',
        expect.anything()
      )
    })
  })

  describe('article CRUD', () => {
    it('createAdminArticle sends POST', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: 1 }, success: true }),
      } as Response)

      const { createAdminArticle } = await import('@/lib/api/adminClient')
      const result = await createAdminArticle({ title: 'New' })

      expect(result).toEqual({ id: 1 })
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/articles',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('updateAdminArticle sends PATCH', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: 1 }, success: true }),
      } as Response)

      const { updateAdminArticle } = await import('@/lib/api/adminClient')
      const result = await updateAdminArticle(1, { title: 'Updated' })

      expect(result).toEqual({ id: 1 })
      const call = vi.mocked(globalThis.fetch).mock.calls[0]
      expect(call[0]).toBe('/api/admin/articles/1')
      expect((call[1] as any).method).toBe('PATCH')
    })

    it('deleteAdminArticle sends DELETE', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: 1 }, success: true }),
      } as Response)

      const { deleteAdminArticle } = await import('@/lib/api/adminClient')
      await deleteAdminArticle(1)

      const call = vi.mocked(globalThis.fetch).mock.calls[0]
      expect(call[0]).toBe('/api/admin/articles/1')
      expect((call[1] as any).method).toBe('DELETE')
    })

    it('restoreAdminArticle sends POST to /restore', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: 1 }, success: true }),
      } as Response)

      const { restoreAdminArticle } = await import('@/lib/api/adminClient')
      await restoreAdminArticle(1)

      const call = vi.mocked(globalThis.fetch).mock.calls[0]
      expect(call[0]).toBe('/api/admin/articles/1/restore')
      expect((call[1] as any).method).toBe('POST')
    })
  })

  describe('category CRUD', () => {
    it('getAdminCategories fetches categories', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [{ id: 1, name: 'News' }], success: true }),
      } as Response)

      const { getAdminCategories } = await import('@/lib/api/adminClient')
      const result = await getAdminCategories()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('News')
    })

    it('createAdminCategory sends POST', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: 1 }, success: true }),
      } as Response)

      const { createAdminCategory } = await import('@/lib/api/adminClient')
      await createAdminCategory({ name: 'Tech' })

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/categories',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('updateAdminCategory sends PATCH', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: 1 }, success: true }),
      } as Response)

      const { updateAdminCategory } = await import('@/lib/api/adminClient')
      await updateAdminCategory(1, { name: 'Updated' })

      const call = vi.mocked(globalThis.fetch).mock.calls[0]
      expect(call[0]).toBe('/api/admin/categories/1')
      expect((call[1] as any).method).toBe('PATCH')
    })

    it('deleteAdminCategory sends DELETE', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: 1 }, success: true }),
      } as Response)

      const { deleteAdminCategory } = await import('@/lib/api/adminClient')
      await deleteAdminCategory(1)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/categories/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('restoreAdminCategory sends POST to restore', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: 1 }, success: true }),
      } as Response)

      const { restoreAdminCategory } = await import('@/lib/api/adminClient')
      await restoreAdminCategory(1)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/categories/1/restore',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('ad CRUD', () => {
    it('getAdminAds fetches with query string', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], success: true }),
      } as Response)

      const { getAdminAds } = await import('@/lib/api/adminClient')
      await getAdminAds('?position=sidebar')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/ads?position=sidebar',
        expect.anything()
      )
    })

    it('deleteAdminAd sends DELETE', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {}, success: true }),
      } as Response)

      const { deleteAdminAd } = await import('@/lib/api/adminClient')
      await deleteAdminAd(5)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/ads/5',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('settings', () => {
    it('getAdminSettings fetches settings', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { brand: { name: 'Site' } }, success: true }),
      } as Response)

      const { getAdminSettings } = await import('@/lib/api/adminClient')
      const result = await getAdminSettings()

      expect(result.brand.name).toBe('Site')
    })

    it('updateAdminSettings sends PATCH', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {}, success: true }),
      } as Response)

      const { updateAdminSettings } = await import('@/lib/api/adminClient')
      await updateAdminSettings({ brand: { name: 'Updated' } })

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/settings',
        expect.objectContaining({ method: 'PATCH' })
      )
    })
  })

  describe('storage/media', () => {
    it('getAdminMedia fetches with prefix', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { files: [] }, success: true }),
      } as Response)

      const { getAdminMedia } = await import('@/lib/api/adminClient')
      await getAdminMedia('articles', true)

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/storage?prefix=articles&recursive=true',
        expect.anything()
      )
    })

    it('uploadAdminMedia sends FormData via POST', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { key: 'test.jpg' }, status: 'ok' }),
      } as Response)

      const { uploadAdminMedia } = await import('@/lib/api/adminClient')
      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.jpg'))
      const result = await uploadAdminMedia(formData)

      expect(result).toEqual({ key: 'test.jpg' })
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/storage',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('uploadAdminMedia throws on error status', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      } as Response)

      const { uploadAdminMedia } = await import('@/lib/api/adminClient')
      const formData = new FormData()
      await expect(uploadAdminMedia(formData)).rejects.toThrow()
    })

    it('uploadAdminMedia throws on status error in response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'error', message: 'Upload failed' }),
      } as Response)

      const { uploadAdminMedia } = await import('@/lib/api/adminClient')
      const formData = new FormData()
      await expect(uploadAdminMedia(formData)).rejects.toThrow('Upload failed')
    })

    it('deleteAdminMedia sends DELETE', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { success: true }, success: true }),
      } as Response)

      const { deleteAdminMedia } = await import('@/lib/api/adminClient')
      await deleteAdminMedia('test.jpg')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/storage?key=test.jpg',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('moveAdminMedia sends POST to move', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { success: true }, success: true }),
      } as Response)

      const { moveAdminMedia } = await import('@/lib/api/adminClient')
      await moveAdminMedia('a.jpg', 'b.jpg')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/storage/move',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('createAdminFolder sends POST to folder', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { key: 'new-folder/' }, success: true }),
      } as Response)

      const { createAdminFolder } = await import('@/lib/api/adminClient')
      await createAdminFolder('new-folder', 'articles')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/storage/folder',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('dashboard', () => {
    it('getAdminDashboardStats fetches stats', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { totalArticles: 100 }, success: true }),
      } as Response)

      const { getAdminDashboardStats } = await import('@/lib/api/adminClient')
      const result = await getAdminDashboardStats()

      expect(result.totalArticles).toBe(100)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/admin/dashboard',
        expect.anything()
      )
    })
  })
})
