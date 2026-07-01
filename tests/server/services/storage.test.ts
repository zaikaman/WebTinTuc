import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { s3Client } from '@/lib/r2/admin'

// Mock s3Client
vi.mock('@/lib/r2/admin', () => ({
  s3Client: {
    send: vi.fn(),
  },
}))

describe('storageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploadFileToR2 uploads file and returns URL', async () => {
    vi.mocked(s3Client.send).mockResolvedValue({})

    const { uploadFileToR2 } = await import('@/server/services/storage.service')
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    const result = await uploadFileToR2(file, 'articles')

    expect(result.success).toBe(true)
    expect(result.key).toContain('articles/')
    expect(result.key).toContain('.jpg')
    expect(result.url).toContain('https://test.r2.dev/articles/')
    expect(s3Client.send).toHaveBeenCalled()
  })

  it('deleteFileFromR2 deletes file', async () => {
    vi.mocked(s3Client.send).mockResolvedValue({})

    const { deleteFileFromR2 } = await import('@/server/services/storage.service')
    const result = await deleteFileFromR2('articles/test.jpg')

    expect(result.success).toBe(true)
    expect(s3Client.send).toHaveBeenCalled()
  })

  it('copyFileInR2 copies file', async () => {
    vi.mocked(s3Client.send).mockResolvedValue({})

    const { copyFileInR2 } = await import('@/server/services/storage.service')
    const result = await copyFileInR2('source.jpg', 'dest.jpg')

    expect(result.success).toBe(true)
    expect(result.fromKey).toBe('source.jpg')
    expect(result.toKey).toBe('dest.jpg')
  })

  it('moveFileInR2 copies then deletes', async () => {
    vi.mocked(s3Client.send).mockResolvedValue({})

    const { moveFileInR2 } = await import('@/server/services/storage.service')
    const result = await moveFileInR2('source.jpg', 'dest.jpg')

    expect(result.success).toBe(true)
    // Should have been called twice: CopyObject + DeleteObject
    expect(s3Client.send).toHaveBeenCalledTimes(2)
  })

  it('createFolderInR2 creates folder (empty object)', async () => {
    vi.mocked(s3Client.send).mockResolvedValue({})

    const { createFolderInR2 } = await import('@/server/services/storage.service')
    const result = await createFolderInR2('new-folder', 'articles')

    expect(result.success).toBe(true)
    expect(result.key).toBe('articles/new-folder/')
  })
})
