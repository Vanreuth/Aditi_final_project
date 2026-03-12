/**
 * POST /api/v1/lessons  — create lesson
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/lessons')
}
