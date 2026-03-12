/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user from the active session cookie.
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/auth/me')
}
