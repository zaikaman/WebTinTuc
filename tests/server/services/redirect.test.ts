import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as redirectService from '@/server/services/redirect.service'
import * as redirectRepository from '@/server/repositories/redirect.repository'

vi.mock('@/server/repositories/redirect.repository', () => ({
  listRedirects: vi.fn(),
  getRedirectById: vi.fn(),
  upsertRedirect: vi.fn(),
  updateRedirect: vi.fn(),
  deleteRedirect: vi.fn(),
  findRedirectByPath: vi.fn(),
}))

describe('redirectService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listRedirects delegates to repository', async () => {
    const mockResult = { items: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } }
    vi.mocked(redirectRepository.listRedirects).mockResolvedValue(mockResult)

    const result = await redirectService.listRedirects()
    expect(result).toEqual(mockResult)
  })

  it('getRedirectById delegates to repository', async () => {
    vi.mocked(redirectRepository.getRedirectById).mockResolvedValue({ id: 1 } as any)

    const result = await redirectService.getRedirectById(1)
    expect(result).toEqual({ id: 1 })
  })

  it('createRedirect flattens target and delegates', async () => {
    vi.mocked(redirectRepository.findRedirectByPath).mockResolvedValue(null)
    vi.mocked(redirectRepository.upsertRedirect).mockResolvedValue({ id: 1, from_path: '/old', to_path: '/new' } as any)

    const result = await redirectService.createRedirect({ from_path: '/old', to_path: '/new' })
    expect(result).toEqual({ id: 1, from_path: '/old', to_path: '/new' })
    expect(redirectRepository.findRedirectByPath).toHaveBeenCalledWith('/new')
  })

  it('createRedirect follows chain of redirects', async () => {
    vi.mocked(redirectRepository.findRedirectByPath)
      .mockResolvedValueOnce({ id: 2, from_path: '/intermediate', to_path: '/final', status_code: 301 } as any)
    vi.mocked(redirectRepository.upsertRedirect).mockResolvedValue({ id: 1 } as any)

    await redirectService.createRedirect({ from_path: '/old', to_path: '/intermediate' })
    expect(redirectRepository.upsertRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ to_path: '/final' })
    )
  })

  it('createRedirect throws on self-referencing redirect', async () => {
    await expect(
      redirectService.createRedirect({ from_path: '/same', to_path: '/same' })
    ).rejects.toThrow('Redirect không được trỏ về chính nó')
  })

  it('createRedirect throws on circular redirect', async () => {
    vi.mocked(redirectRepository.findRedirectByPath)
      .mockResolvedValueOnce({ id: 2, from_path: '/b', to_path: '/a' } as any)

    await expect(
      redirectService.createRedirect({ from_path: '/a', to_path: '/b' })
    ).rejects.toThrow('Redirect tạo vòng lặp')
  })

  it('deleteRedirect delegates to repository', async () => {
    vi.mocked(redirectRepository.deleteRedirect).mockResolvedValue({ id: 1 })

    const result = await redirectService.deleteRedirect(1)
    expect(result).toEqual({ id: 1 })
  })
})
