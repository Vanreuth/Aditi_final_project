/**
 * GET /api/v1/courses/instructor/[instructorId]
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ instructorId: string }> }
) {
  const { instructorId } = await params
  return proxyToBackend(request, `/api/v1/courses/instructor/${instructorId}`)
}
