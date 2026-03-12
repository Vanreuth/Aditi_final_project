/**
 * lib/api/auth.ts
 */

import { get, post, put, buildFormData } from '@/lib/api/client'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types/authType'

// ── Paths ──────────────────────────────────────────────────────────────────
//
// All paths go through Next.js BFF (/api/...)
// BFF forwards to Spring Boot with httpOnly cookies attached
//
// Browser → /api/auth/login  (Next.js BFF)
//                │
//                ▼
//           Spring Boot /api/v1/auth/login ✅

const AUTH_PATH = '/api/v1/auth'

// ── Auth ───────────────────────────────────────────────────────────────────

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return post<AuthResponse>(`${AUTH_PATH}/login`, payload)
}

export async function logout(): Promise<void> {
  await post<void>(`${AUTH_PATH}/logout`, {}, { raw: true })
}

export async function getMe(): Promise<AuthResponse> {
  return get<AuthResponse>(`${AUTH_PATH}/me`)
}

export async function register(
  payload: RegisterRequest,
  profilePicture?: File
): Promise<void> {
  const form = buildFormData(
    payload as unknown as Record<string, unknown>,
    { profilePicture }
  )
  return post<void>(
    `${AUTH_PATH}/register`,
    form,
    { multipart: true, raw: true }
  )
}

export async function refreshToken(): Promise<AuthResponse> {
  return post<AuthResponse>(`${AUTH_PATH}/refresh`)
}

export async function updateProfile(
  payload: UpdateProfileRequest,
  photo?: File
): Promise<AuthResponse> {
  const form = buildFormData(
    payload as Record<string, unknown>,
    { profilePicture: photo }
  )
  return put<AuthResponse>(`${AUTH_PATH}/profile`, form, { multipart: true })
}

// Backend URL for browser-level redirects (OAuth initiation).
// Falls back to the production URL so it always works even if the env var
// is not injected at runtime.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://growcodekh.onrender.com'

export function redirectToOAuth(provider: 'google' | 'github'): void {
  // Redirect the browser DIRECTLY to Spring Boot's OAuth2 endpoint.
  // Must NOT go through the Next.js BFF — Spring Security needs to own
  // the full OAuth handshake (session state, CSRF token, callback URL).
  // After Google auth, Spring redirects to /oauth2/redirect?access_token=...&refresh_token=...
  window.location.href = `${BACKEND_URL}/oauth2/authorization/${provider}`
}

/** List available OAuth2 providers */
export async function getOAuthProviders(): Promise<string[]> {
  return get<string[]>(`${AUTH_PATH}/oauth2/providers`)
}
