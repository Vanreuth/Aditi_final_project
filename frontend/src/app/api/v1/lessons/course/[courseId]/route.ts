/**
 * GET /api/v1/lessons/course/[courseId]
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  return proxyToBackend(request, `/api/v1/lessons/course/${courseId}`)
}
