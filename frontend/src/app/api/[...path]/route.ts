

import { NextRequest, NextResponse } from "next/server";

const BACKEND = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

// Hop-by-hop headers that must never be forwarded
const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate",
  "proxy-authorization", "te", "trailers",
  "transfer-encoding", "upgrade",
  "x-middleware-subrequest", "x-middleware-invoke",
]);

async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const upstreamUrl = `${BACKEND}${pathname}${search}`;

  // ── Build upstream request headers ──────────────────────────────────────
  const upstreamHeaders = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue;
    if (key.toLowerCase() === "host") continue;
    upstreamHeaders.set(key, value);
  }
  // Always forward cookies so Spring Boot can read access_token / refresh_token
  const cookies = request.headers.get("cookie");
  if (cookies) upstreamHeaders.set("cookie", cookies);

  // ── Forward request to Spring Boot ──────────────────────────────────────
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method : request.method,
      headers: upstreamHeaders,
      body   : ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      // Required for streaming request bodies (file uploads etc.)
      // @ts-expect-error — Node 18 fetch supports this
      duplex : "half",
    });
  } catch (err) {
    console.error(`[proxy] upstream unreachable: ${upstreamUrl}`, err);
    return NextResponse.json(
      { message: "Backend unreachable" },
      { status: 502 },
    );
  }

  // ── Read upstream response body ──────────────────────────────────────────
  const body = await upstreamResponse.arrayBuffer();

  // ── Build our response ───────────────────────────────────────────────────
  const response = new NextResponse(body, {
    status : upstreamResponse.status,
    headers: { "content-type": upstreamResponse.headers.get("content-type") ?? "application/json" },
  });

  // ── Copy safe response headers ───────────────────────────────────────────
  for (const [key, value] of upstreamResponse.headers.entries()) {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k)) continue;
    if (k === "set-cookie") continue; // handled separately below
    if (k === "content-encoding") continue; // body already decoded by fetch
    response.headers.set(key, value);
  }

  // ── ✅ THE CRITICAL FIX — forward ALL Set-Cookie headers ────────────────
  //
  // Headers.get("set-cookie") only returns the FIRST cookie.
  // Headers.getSetCookie() returns ALL of them (Node 18+).
  //
  // /login  sets TWO cookies: access_token + refresh_token
  // /refresh sets ONE cookie: access_token
  //
  // Without this, the browser never receives any auth cookies.
  const setCookies = upstreamResponse.headers.getSetCookie?.()
    // Fallback for environments where getSetCookie() isn't available
    ?? upstreamResponse.headers.get("set-cookie")?.split(/,(?=\s*\w+=)/) 
    ?? [];

  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

// Export all HTTP methods — Spring Boot uses GET, POST, PUT, DELETE, PATCH
export const GET     = proxy;
export const POST    = proxy;
export const PUT     = proxy;
export const PATCH   = proxy;
export const DELETE  = proxy;
export const OPTIONS = proxy;