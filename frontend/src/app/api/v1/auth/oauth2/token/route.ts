/**
 * POST /api/v1/auth/oauth2/token
 *
 * Called by the frontend OAuth redirect page when tokens arrive as URL params
 * (cross-domain OAuth: Spring is on onrender.com, frontend on vercel.app).
 *
 * Reads { access_token, refresh_token } from the request body and sets them
 * as httpOnly cookies on the frontend domain so the BFF proxy can forward
 * them to Spring Boot on subsequent requests.
 */
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let access_token: string, refresh_token: string

  try {
    const body   = await request.json()
    access_token  = body.access_token
    refresh_token = body.refresh_token
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  if (!access_token || !refresh_token) {
    return NextResponse.json({ message: 'Missing tokens' }, { status: 400 })
  }

  const isProd = process.env.NODE_ENV === 'production'

  const response = NextResponse.json({ success: true })

  response.cookies.set('access_token', access_token, {
    httpOnly: true,
    secure  : isProd,
    sameSite: 'lax',
    maxAge  : 15 * 60,       // 15 minutes — matches Spring's CookieUtil
    path    : '/',
  })

  response.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    secure  : isProd,
    sameSite: 'lax',
    maxAge  : 24 * 60 * 60,  // 24 hours — matches Spring's CookieUtil
    path    : '/',
  })

  return response
}
