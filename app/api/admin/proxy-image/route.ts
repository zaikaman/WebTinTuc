import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { fail } from '@/server/http'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return new NextResponse('Invalid url parameter', { status: 400 })
    }

    const response = await fetch(imageUrl)
    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status })
    }

    const blob = await response.blob()
    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    return fail(error)
  }
}
