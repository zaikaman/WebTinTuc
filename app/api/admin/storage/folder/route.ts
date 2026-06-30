import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail } from '@/server/http'
import { createFolderAction } from '@/server/actions/storage.action'

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const body = await request.json()
    return actionResponse(await createFolderAction(body, admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null), { status: 201 })
  } catch (error) {
    return fail(error)
  }
}
