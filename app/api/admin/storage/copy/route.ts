import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail } from '@/server/http'
import { copyFileAction } from '@/server/actions/storage.action'

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    return actionResponse(await copyFileAction(await request.json(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null))
  } catch (error) {
    return fail(error)
  }
}
