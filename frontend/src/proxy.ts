import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']
const ADMIN_ROUTES  = ['/dashboard']
const AUTH_ROUTES   = ['/account', '/profile', '/settings']

function isMatch(pathname: string, routes: string[]): boolean {
  return routes.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}

function redirect(url: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(url, request.url))
}

function decodeIsAdmin(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    )
    const roles: string[] = payload.roles ?? []
    return roles.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN')
  } catch {
    return false
  }
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  const accessToken  = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // ✅ Consider logged in if EITHER token exists
  // JwtAuthenticationFilter handles the actual refresh on API calls
  const isLoggedIn = !!accessToken || !!refreshToken

  // ✅ Decode role from access_token if available, else assume USER
  // (dashboard will re-check properly after refresh)
  const isAdmin = accessToken ? decodeIsAdmin(accessToken) : false

  const isPublicRoute = isMatch(pathname, PUBLIC_ROUTES)
  const isAdminRoute  = isMatch(pathname, ADMIN_ROUTES)
  const isAuthRoute   = isMatch(pathname, AUTH_ROUTES)

  // 1. Logged-in user visits /login or /register → bounce home
  if (isLoggedIn && isPublicRoute) {
    return redirect(isAdmin ? '/dashboard' : '/account', request)
  }

  // 2. Guest visits protected user pages → /login
  if (!isLoggedIn && isAuthRoute) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // 3. Guest visits admin pages → /login
  if (isAdminRoute && !isLoggedIn) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // 4. Logged-in non-admin visits /dashboard
  // Only block if we have access_token to confirm role
  // If only refresh_token → let through, page will handle it
  if (isAdminRoute && isLoggedIn && accessToken && !isAdmin) {
    return redirect('/account', request)
  }

  // 5. All good
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}