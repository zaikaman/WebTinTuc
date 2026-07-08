import { NextRequest } from 'next/server'
import { ZodError, z } from 'zod'

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

export class ApiError extends Error {
  status: number
  code: ApiErrorCode
  details?: unknown

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

function withCacheControl(init?: ResponseInit, ttl = 60): ResponseInit {
  const headers = new Headers(init?.headers);
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 10}`);
  }
  return { ...init, headers };
}

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ success: true, data }, withCacheControl(init))
}

export function created<T>(data: T) {
  return ok(data, { status: 201 })
}

export function noContent(message = 'OK') {
  return Response.json({ success: true, message })
}

export type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; code?: ApiErrorCode; details?: unknown }

export function actionResponse<T>(result: ActionResult<T>, successInit?: ResponseInit) {
  if (result.success) {
    return Response.json(result, successInit)
  }

  const statusByCode: Record<ApiErrorCode, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500
  }

  const failure = result as { success: false; message: string; code?: ApiErrorCode }
  return Response.json(result, { status: failure.code ? statusByCode[failure.code] : 400 })
}

export function fail(error: unknown) {
  if (error instanceof ZodError) {
    const issues = error.errors.map(
      (e) => {
        const field = e.path.length > 0 ? e.path.join('.') : '';
        return field ? `${field}: ${e.message}` : e.message;
      }
    );
    return Response.json(
      {
        success: false,
        code: 'BAD_REQUEST',
        message: issues.length > 0 ? issues.join('; ') : 'Dữ liệu không hợp lệ',
        details: z.treeifyError(error)
      },
      { status: 400 }
    )
  }

  if (error instanceof ApiError) {
    return Response.json(
      {
        success: false,
        code: error.code,
        message: error.message,
        details: error.details
      },
      { status: error.status }
    )
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error'
  return Response.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 })
}

export function parseQuery<T extends z.ZodType>(request: NextRequest, schema: T): z.infer<T> {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries())
  return schema.parse(raw)
}

export async function parseBody<T extends z.ZodType>(request: NextRequest, schema: T): Promise<z.infer<T>> {
  const body = await request.json()
  return schema.parse(body)
}
