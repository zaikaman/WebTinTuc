import { z } from 'zod'

export const updateSiteSettingsSchema = z.object({
  brand: z.record(z.string(), z.unknown()).optional(),
  footer: z.record(z.string(), z.unknown()).optional()
})

