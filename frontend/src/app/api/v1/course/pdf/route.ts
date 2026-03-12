/**
 * GET /api/v1/course/pdf  — list all course PDFs
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/course/pdf')
}
