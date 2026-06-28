import { NextRequest } from 'next/server'
import { fail, ok } from '@/server/http'
import * as settingsService from '@/server/services/site-settings.service'

export async function GET(request: NextRequest) {
  try {
    return ok(await settingsService.getSiteSettings())
  } catch (error) {
    return fail(error)
  }
}
