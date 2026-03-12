/**
 * GET  /api/v1/categories   — paginated list
 * POST /api/v1/categories   — [ADMIN] create
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/categories')
}
export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/categories')
}
