import { describe, it, expect } from 'vitest'
import { updateSiteSettingsSchema } from '@/server/validations/site-settings.schema'

describe('updateSiteSettingsSchema', () => {
  it('accepts brand settings', () => {
    const result = updateSiteSettingsSchema.parse({
      brand: { name: 'MySite', tagline: 'Best site' },
    })
    expect(result.brand?.name).toBe('MySite')
  })

  it('accepts footer settings', () => {
    const result = updateSiteSettingsSchema.parse({
      footer: { columns: [{ title: 'Links' }] },
    })
    expect(result.footer?.columns).toHaveLength(1)
  })

  it('accepts empty object', () => {
    const result = updateSiteSettingsSchema.parse({})
    expect(result).toEqual({})
  })
})
