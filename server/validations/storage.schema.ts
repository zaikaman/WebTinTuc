import { z } from 'zod'

export const storagePrefixQuerySchema = z.object({
  prefix: z.string().default('')
})

export const storageKeySchema = z.object({
  key: z.string().min(1)
})

export const storageMoveSchema = z.object({
  fromKey: z.string().min(1),
  toKey: z.string().min(1)
})

