/**
 * GET /api/v1/lesson-progress/course/[courseId]/completed-count
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  return proxyToBackend(request, `/api/v1/lesson-progress/course/${courseId}/completed-count`)
}
