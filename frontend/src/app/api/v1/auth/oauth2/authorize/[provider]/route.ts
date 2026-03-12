/**
 * GET /api/v1/auth/oauth2/authorize/[provider]
 * Initiates the OAuth2 authorization flow for the given provider.
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  return proxyToBackend(request, `/api/v1/auth/oauth2/authorize/${provider}`)
}
