import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB
const FETCH_TIMEOUT_MS = 10_000
const CACHE_TTL = 86_400 // 24 hours

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Only allow http/https URLs
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return new NextResponse('Invalid url parameter – only http/https URLs are allowed', { status: 400 })
    }

    // Block attempts to loop back to our own proxy
    const selfOrigin = request.nextUrl.origin
    if (imageUrl.startsWith(selfOrigin)) {
      return new NextResponse('Cannot proxy a local URL', { status: 400 })
    }

    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'User-Agent': 'WebTinTuc-ImageProxy/1.0',
      },
    })

    if (!response.ok) {
      return new NextResponse(`Upstream responded with ${response.status}`, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || ''

    // Validate it's an allowed image type
    if (!ALLOWED_CONTENT_TYPES.includes(contentType) && !contentType.startsWith('image/')) {
      return new NextResponse('URL does not point to a supported image type', { status: 400 })
    }

    const arrayBuffer = await response.arrayBuffer()

    if (arrayBuffer.byteLength > MAX_IMAGE_SIZE) {
      return new NextResponse('Image exceeds maximum allowed size (10 MB)', { status: 413 })
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL}`,
        'X-Image-Source': 'proxy',
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return new NextResponse('Upstream fetch timed out', { status: 504 })
    }
    return new NextResponse('Failed to fetch image', { status: 502 })
  }
}
