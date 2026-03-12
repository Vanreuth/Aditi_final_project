/**
 * POST /api/v1/auth/refresh
 * Exchange a valid refresh_token cookie for a new access_token.
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/auth/refresh')
}
