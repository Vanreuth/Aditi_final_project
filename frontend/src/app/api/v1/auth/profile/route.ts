/**
 * PUT /api/v1/auth/profile
 * Update the current user's profile (multipart/form-data — proxied as-is).
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function PUT(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/auth/profile')
}
