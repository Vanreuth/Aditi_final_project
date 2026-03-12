/**
 * GET /api/v1/lessons/chapter/[chapterId]
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params
  return proxyToBackend(request, `/api/v1/lessons/chapter/${chapterId}`)
}
