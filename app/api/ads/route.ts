import { NextRequest } from 'next/server'
import { fail, ok, parseQuery } from '@/server/http'
import { publicAdQuerySchema } from '@/server/validations/ad.schema'
import * as adService from '@/server/services/ad.service'

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, publicAdQuerySchema)
    return ok(await adService.listPublicAds(query.position))
  } catch (error) {
    return fail(error)
  }
}

