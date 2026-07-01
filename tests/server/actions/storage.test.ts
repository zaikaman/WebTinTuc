import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/services/storage.service', () => ({
  uploadFileToR2: vi.fn(),
  deleteFileFromR2: vi.fn(),
  moveFileInR2: vi.fn(),
  copyFileInR2: vi.fn(),
  createFolderInR2: vi.fn(),
}))

vi.mock('@/server/validations/storage.schema', () => ({
  storageKeySchema: { parse: vi.fn((input) => input) },
  storageMoveSchema: { parse: vi.fn((input) => input) },
}))

describe('storageActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deleteFileAction deletes file', async () => {
    const { deleteFileFromR2 } = await import('@/server/services/storage.service')
    vi.mocked(deleteFileFromR2).mockResolvedValue({ success: true, message: 'Deleted' })

    const { deleteFileAction } = await import('@/server/actions/storage.action')
    const result = await deleteFileAction({ key: 'test.jpg' }, 'test-admin-secret')

    expect(result.success).toBe(true)
  })

  it('moveFileAction moves file', async () => {
    const { moveFileInR2 } = await import('@/server/services/storage.service')
    vi.mocked(moveFileInR2).mockResolvedValue({ success: true, fromKey: 'a.jpg', toKey: 'b.jpg' })

    const { moveFileAction } = await import('@/server/actions/storage.action')
    const result = await moveFileAction({ fromKey: 'a.jpg', toKey: 'b.jpg' }, 'test-admin-secret')

    expect(result.success).toBe(true)
  })

  it('copyFileAction copies file', async () => {
    const { copyFileInR2 } = await import('@/server/services/storage.service')
    vi.mocked(copyFileInR2).mockResolvedValue({ success: true, fromKey: 'a.jpg', toKey: 'b.jpg' })

    const { copyFileAction } = await import('@/server/actions/storage.action')
    const result = await copyFileAction({ fromKey: 'a.jpg', toKey: 'b.jpg' }, 'test-admin-secret')

    expect(result.success).toBe(true)
  })

  it('uploadFileAction uploads file from FormData', async () => {
    const { uploadFileToR2 } = await import('@/server/services/storage.service')
    vi.mocked(uploadFileToR2).mockResolvedValue({ success: true, key: 'articles/test.jpg', url: 'https://cdn.example.com/test.jpg' })

    const { uploadFileAction } = await import('@/server/actions/storage.action')
    const formData = new FormData()
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))
    formData.append('folder', 'articles')
    const result = await uploadFileAction(formData, 'test-admin-secret')

    expect(result.success).toBe(true)
  })

  it('uploadFileAction fails when no file', async () => {
    const { uploadFileAction } = await import('@/server/actions/storage.action')
    const formData = new FormData()
    const result = await uploadFileAction(formData, 'test-admin-secret')

    expect(result.success).toBe(false)
  })
})
