import { NextRequest, NextResponse } from 'next/server'

export const BACKEND = (
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_BASE_URL ?? ''
).replace(/\/$/, '')

const BODYLESS_METHODS = new Set(['GET', 'HEAD'])

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'x-middleware-subrequest',
  'x-middleware-invoke',
])

const RESPONSE_HEADERS_TO_SKIP = new Set([
  ...HOP_BY_HOP_HEADERS,
  'set-cookie',
  'content-encoding',
  'content-length',
])

export interface ProxyOptions {
  method?: string
  body?: BodyInit
  headers?: Record<string, string>
}

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  options: ProxyOptions = {},
): Promise<NextResponse> {
  const method = options.method ?? request.method
  const url = buildBackendUrl(request, backendPath)
  const init = buildUpstreamRequestInit(request, method, options)

  try {
    const upstream = await fetch(url, init)
    return buildResponse(upstream)
  } catch (error) {
    console.error(`[bff] unreachable -> ${url}`, error)
    return buildUnreachableResponse()
  }
}

function buildBackendUrl(request: NextRequest, backendPath: string): string {
  return `${BACKEND}${backendPath}${request.nextUrl.search}`
}

function buildUpstreamRequestInit(
  request: NextRequest,
  method: string,
  options: ProxyOptions,
): RequestInit & { duplex?: 'half' } {
  const body = resolveBody(request, method, options.body)
  const init: RequestInit & { duplex?: 'half' } = {
    method,
    headers: buildUpstreamHeaders(request, options.headers),
    body,
  }

  if (body !== undefined) {
    init.duplex = 'half'
  }

  return init
}

function buildUpstreamHeaders(
  request: NextRequest,
  extras?: Record<string, string>,
): Headers {
  const headers = new Headers()

  for (const [key, value] of request.headers.entries()) {
    if (!shouldForwardRequestHeader(key)) continue
    headers.set(key, value)
  }

  const cookie = request.headers.get('cookie')
  if (cookie) headers.set('cookie', cookie)

  for (const [key, value] of Object.entries(extras ?? {})) {
    headers.set(key, value)
  }

  return headers
}

function shouldForwardRequestHeader(headerName: string): boolean {
  const normalizedHeader = headerName.toLowerCase()
  return normalizedHeader !== 'host' && !HOP_BY_HOP_HEADERS.has(normalizedHeader)
}

function resolveBody(
  request: NextRequest,
  method: string,
  override?: BodyInit,
): BodyInit | undefined {
  if (BODYLESS_METHODS.has(method.toUpperCase())) return undefined
  return override ?? request.body ?? undefined
}

async function buildResponse(upstream: Response): Promise<NextResponse> {
  const headers = buildResponseHeaders(upstream.headers)
  const body = await upstream.arrayBuffer()

  return new NextResponse(body, {
    status: upstream.status,
    headers,
  })
}

function buildResponseHeaders(upstreamHeaders: Headers): Headers {
  const responseHeaders = new Headers({
    'content-type': upstreamHeaders.get('content-type') ?? 'application/json',
  })

  for (const [key, value] of upstreamHeaders.entries()) {
    if (RESPONSE_HEADERS_TO_SKIP.has(key.toLowerCase())) continue
    responseHeaders.set(key, value)
  }

  for (const cookie of getSetCookies(upstreamHeaders)) {
    responseHeaders.append('set-cookie', cookie)
  }

  return responseHeaders
}

function getSetCookies(headers: Headers): string[] {
  return (
    headers.getSetCookie?.() ??
    headers.get('set-cookie')?.split(/,(?=\s*\w+=)/) ??
    []
  )
}

function buildUnreachableResponse(): NextResponse {
  return NextResponse.json(
    { message: 'Backend unreachable' },
    { status: 502 },
  )
}
