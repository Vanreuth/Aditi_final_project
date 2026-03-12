/**
 * GET /api/v1/snippets/lesson/[lessonId]
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  return proxyToBackend(request, `/api/v1/snippets/lesson/${lessonId}`)
}
