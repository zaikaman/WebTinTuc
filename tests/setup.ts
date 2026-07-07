import { vi } from 'vitest'

// Mock environment variables
process.env.ADMIN_API_SECRET = 'test-admin-secret'
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
process.env.R2_BUCKET_NAME = 'test-bucket'
process.env.R2_PUBLIC_URL = 'https://test.r2.dev'
process.env.NEXT_PUBLIC_R2_PUBLIC_URL = 'https://test.r2.dev'

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}))

// Mock supabase admin
vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {} as any,
}))

// Mock supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

// Mock R2/S3 client
vi.mock('@/lib/r2/admin', () => ({
  s3Client: {
    send: vi.fn(),
  } as any,
}))
