import { NextRequest } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '@/lib/r2/admin'
import { requireAdmin } from '@/server/auth'
import { fail, ok } from '@/server/http'
import { z } from 'zod'

const downloadUrlBodySchema = z.object({
  key: z.string().trim().min(1).max(512)
})

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const { key } = downloadUrlBodySchema.parse(body)

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || '',
      Key: key
    })

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return ok({ downloadUrl, key, expiresIn: 3600 })
  } catch (error) {
    return fail(error)
  }
}
