/**
 * GET /api/v1/lesson-progress/me/completed-count
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/lesson-progress/me/completed-count')
}
