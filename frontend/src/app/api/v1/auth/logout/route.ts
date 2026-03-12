/**
 * POST /api/v1/auth/logout
 * Calls Spring Boot to invalidate the refresh token, then force-expires both
 * auth cookies so the browser cannot reuse a stale session.
 */
import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'
import { expireAuthCookies } from '@/lib/cookies'

export async function POST(request: NextRequest) {
  let response: NextResponse
  try {
    response = await proxyToBackend(request, '/api/v1/auth/logout')
  } catch {
    response = NextResponse.json({ message: 'Logged out' }, { status: 200 })
  }

  expireAuthCookies(response)
}
