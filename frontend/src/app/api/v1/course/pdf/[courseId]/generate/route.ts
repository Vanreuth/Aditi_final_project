
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  return proxyToBackend(request, `/api/v1/course/pdf/${courseId}/generate`)
}
