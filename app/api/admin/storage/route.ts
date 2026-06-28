import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok, parseQuery } from '@/server/http'
import { storagePrefixQuerySchema } from '@/server/validations/storage.schema'
import { getStorageTree } from '@/server/services/storage.service'
import { deleteFileAction, uploadFileAction } from '@/server/actions/storage.action'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { prefix } = parseQuery(request, storagePrefixQuerySchema)
    return ok(await getStorageTree(prefix))
  } catch (error) {
    return fail(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    return actionResponse(await uploadFileAction(await request.formData(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null), { status: 201 })
  } catch (error) {
    return fail(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    const key = request.nextUrl.searchParams.get('key')
    return actionResponse(await deleteFileAction({ key }, admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null))
  } catch (error) {
    return fail(error)
  }
}
