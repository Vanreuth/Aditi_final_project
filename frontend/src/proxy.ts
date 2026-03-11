// middleware.ts
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
    return roles.some((r) => r === 'ADMIN' || r === 'ROLE_ADMIN')
  } catch {
    return false
  }
}

/** Only allow safe internal relative paths — prevents open-redirect attacks */
function safeCallback(raw: string | null, fallback: string): string {
  if (!raw) return fallback
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw
  return fallback
}

// ─────────────────────────────────────────────────────────────────────────────
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  const accessToken  = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // ✅ FIX 1 — split isLoggedIn into two distinct states:
  //
  //   isLoggedIn  = has a valid access_token  → we KNOW who the user is
  //   canRefresh  = has only a refresh_token  → we CAN get a new access_token
  //                                             but haven't done so yet
  //
  // ❌ BEFORE: isLoggedIn = !!accessToken || !!refreshToken
  //    Problem: canRefresh was treated as fully logged-in.
  //    Middleware let user into /account → useAuth called /me → FAILED (no access_token)
  //    → useAuth called /refresh → got new access_token in response body
  //    → BUT proxy never forwarded Set-Cookie back to browser
  //    → cookie not saved → next render: /me fails again → infinite loop ♻️
  //
  // ✅ AFTER: let canRefresh users into auth routes so useAuth can silently
  //    refresh on the client side, then the page resolves normally.
  const isLoggedIn = !!accessToken                     // confirmed valid session
  const canRefresh = !accessToken && !!refreshToken    // stale session, can recover
  const isAdmin    = accessToken ? decodeIsAdmin(accessToken) : false

  const isPublicRoute = isMatch(pathname, PUBLIC_ROUTES)
  const isAdminRoute  = isMatch(pathname, ADMIN_ROUTES)
  const isAuthRoute   = isMatch(pathname, AUTH_ROUTES)

  // ── 1. Confirmed logged-in user visits /login or /register ────────────────
  // ✅ FIX 2 — honour callbackUrl so /login → /account → /login loop can't happen
  // ✅ Only redirect away from public routes when access_token is confirmed —
  //    NOT when only refresh_token exists (that would cause the loop)
  if (isLoggedIn && isPublicRoute) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    const fallback    = isAdmin ? '/dashboard' : '/account'
    return redirect(safeCallback(callbackUrl, fallback), request)
  }

  // ── 2. canRefresh user visits /login or /register ─────────────────────────
  // ✅ FIX 3 — same as above but for refresh-only sessions
  //    Without this, a user with only refresh_token visiting /login would NOT
  //    be redirected away, letting them see the login page while technically
  //    still having a live session.
  if (canRefresh && isPublicRoute) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    return redirect(safeCallback(callbackUrl, '/account'), request)
  }

  // ── 3. Pure guest (no tokens) visits protected user pages → /login ─────────
  if (!isLoggedIn && !canRefresh && isAuthRoute) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // ✅ FIX 4 — canRefresh user visits /account → let through!
  //    useAuth will call /refresh client-side, get back access_token cookie,
  //    then /me will succeed on the next request. No redirect needed here.
  //    (Previously this fell into the guest check above and caused the loop)

  // ── 4. Pure guest visits admin pages → /login ──────────────────────────────
  if (isAdminRoute && !isLoggedIn && !canRefresh) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // ── 5. canRefresh user visits /dashboard → let through ─────────────────────
  // useAuth will refresh and then the page will re-check the role.
  // No redirect here — avoids bouncing a legitimate admin mid-refresh.

  // ── 6. Confirmed logged-in NON-admin visits /dashboard → /account ──────────
  // Only block when access_token confirms the role.
  // If only refresh_token → let through, page will handle after refresh.
  if (isAdminRoute && isLoggedIn && !isAdmin) {
    return redirect('/account', request)
  }

  // ── 7. All good ────────────────────────────────────────────────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}