/**
 * POST /api/v1/auth/login
 * Proxies credentials → Spring Boot → sets access_token + refresh_token httpOnly cookies.
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/auth/login')
}
