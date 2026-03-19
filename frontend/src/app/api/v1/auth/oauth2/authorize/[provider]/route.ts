
import { NextRequest, NextResponse } from 'next/server'
import { BACKEND } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const url = `${BACKEND}/oauth2/authorization/${provider}`

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method  : 'GET',
      redirect: 'manual',   
      headers : { cookie: request.headers.get('cookie') ?? '' },
    })
  } catch {
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 })
  }

  const location = upstream.headers.get('location')
  if (location) {
    return NextResponse.redirect(location, { status: upstream.status })
  }

  // Unexpected: Spring Boot didn't redirect — surface the raw response
  return new NextResponse(await upstream.arrayBuffer(), {
    status : upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}
