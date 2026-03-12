/**
 * GET /api/v1/courses/category/[categoryId]
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params
  return proxyToBackend(request, `/api/v1/courses/category/${categoryId}`)
}
