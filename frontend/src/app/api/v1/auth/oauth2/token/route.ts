
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
    maxAge  : 15 * 60,      
    path    : '/',
  })

  response.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    secure  : isProd,
    sameSite: 'lax',
    maxAge  : 24 * 60 * 60,  
    path    : '/',
  })

  return response
}
