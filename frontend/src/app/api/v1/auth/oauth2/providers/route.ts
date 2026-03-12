/**
 * GET /api/v1/auth/oauth2/providers
 * Returns the list of available OAuth2 provider names (e.g. ['google', 'github']).
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/auth/oauth2/providers')
}
