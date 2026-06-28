import { NextRequest } from 'next/server'
import { requireAdmin } from '@/server/auth'
import { actionResponse, fail, ok } from '@/server/http'
import * as settingsService from '@/server/services/site-settings.service'
import { updateSiteSettingsAction } from '@/server/actions/settings.action'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    return ok(await settingsService.getSiteSettings())
  } catch (error) {
    return fail(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    return actionResponse(await updateSiteSettingsAction(await request.json(), admin.id === 'admin-api-secret' ? request.headers.get('x-admin-secret') : null))
  } catch (error) {
    return fail(error)
  }
}
