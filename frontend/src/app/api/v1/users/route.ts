/**
 * GET  /api/v1/users  — list all users
 * POST /api/v1/users  — create user
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/users')
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/users')
}
