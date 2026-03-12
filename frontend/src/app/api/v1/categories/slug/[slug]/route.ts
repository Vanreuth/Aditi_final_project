/**
 * GET /api/v1/categories/slug/[slug]
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return proxyToBackend(request, `/api/v1/categories/slug/${slug}`)
}
