import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

vi.mock('@/server/services/ad.service', () => ({
  createAd: vi.fn(),
  updateAd: vi.fn(),
  deleteAd: vi.fn(),
  restoreAd: vi.fn(),
}))

vi.mock('@/server/validations/ad.schema', () => ({
  createAdSchema: { parse: vi.fn((input) => input) },
  updateAdSchema: { parse: vi.fn((input) => input) },
}))

describe('adActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createAdAction creates ad and revalidates', async () => {
    const { createAd } = await import('@/server/services/ad.service')
    vi.mocked(createAd).mockResolvedValue({ id: 1, name: 'New Ad' })

    const { createAdAction } = await import('@/server/actions/ad.action')
    const result = await createAdAction({ name: 'New Ad', position: 'sidebar' }, 'test-admin-secret')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(1)
    }
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('updateAdAction updates and revalidates', async () => {
    const { updateAd } = await import('@/server/services/ad.service')
    vi.mocked(updateAd).mockResolvedValue({ id: 1, name: 'Updated' })

    const { updateAdAction } = await import('@/server/actions/ad.action')
    const result = await updateAdAction(1, { name: 'Updated' }, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('deleteAdAction deletes and revalidates', async () => {
    const { deleteAd } = await import('@/server/services/ad.service')
    vi.mocked(deleteAd).mockResolvedValue({ id: 1 })

    const { deleteAdAction } = await import('@/server/actions/ad.action')
    const result = await deleteAdAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('restoreAdAction restores and revalidates', async () => {
    const { restoreAd } = await import('@/server/services/ad.service')
    vi.mocked(restoreAd).mockResolvedValue({ id: 1, name: 'Restored' })

    const { restoreAdAction } = await import('@/server/actions/ad.action')
    const result = await restoreAdAction(1, 'test-admin-secret')

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalled()
  })
})
