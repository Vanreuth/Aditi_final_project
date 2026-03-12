/**
 * GET /api/v1/courses/coming-soon   — paginated upcoming courses
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/courses/coming-soon')
}
