import { NextRequest } from 'next/server'
import { fail, okCached } from '@/server/http'
import * as settingsService from '@/server/services/site-settings.service'

export async function GET(_request: NextRequest) {
  try {
    return okCached(await settingsService.getSiteSettings())
  } catch (error) {
    return fail(error)
  }
}
