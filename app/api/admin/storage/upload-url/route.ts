import { NextRequest } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '@/lib/r2/admin'
import { requireAdmin } from '@/server/auth'
import { fail, ok } from '@/server/http'
import { z } from 'zod'

const uploadUrlBodySchema = z.object({
  key: z.string().trim().min(1).max(512),
  contentType: z.string().trim().min(1).max(128)
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const { key, contentType } = uploadUrlBodySchema.parse(body)

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Key: key,
      ContentType: contentType
    })

    const uploadUrl = await getSignedUrl(s3Client as any, command, { expiresIn: 3600 })

    return ok({ uploadUrl, key, expiresIn: 3600 })
  } catch (error) {
    return fail(error)
  }
}
