/**
 * lib/api/auth.ts
 *
 * All auth-related API calls — login, logout, getMe, register, refresh, etc.
 * Consumes the base client from lib/api/client.ts and types from types/auth.ts.
 *
 * Usage:
 *   import { login, logout, getMe } from '@/lib/api/auth'
 */

import { get, post, put, buildFormData } from '@/lib/api/client'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types/authType'

const AUTH_PATH = '/api/v1/auth'

/** Authenticate with username + password. Returns the user profile. */
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return post<AuthResponse>(`${AUTH_PATH}/login`, payload)
}

/** Invalidate the current session server-side and clear cookies. */
export async function logout(): Promise<void> {
  await post<void>(`${AUTH_PATH}/logout`, {}, { raw: true })
}

/** Return the currently authenticated user from an active session cookie. */
export async function getMe(): Promise<AuthResponse> {
  return get<AuthResponse>(`${AUTH_PATH}/me`)
}

/** Register a new user. Optionally attaches a profile picture as multipart. */
export async function register(
  payload: RegisterRequest,
  profilePicture?: File
): Promise<void> {
  const form = buildFormData(
    payload as unknown as Record<string, unknown>,
    { profilePicture }
  )
  return post<void>(`${AUTH_PATH}/register`, form, { multipart: true, raw: true })
}

/** Exchange a valid refresh_token cookie for a new access_token. */
export async function refreshToken(): Promise<AuthResponse> {
  return post<AuthResponse>(`${AUTH_PATH}/refresh`)
}

/** Update the current user's profile. Optionally replaces the profile photo. */
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

/** List available OAuth2 provider names (e.g. ['google', 'github']). */
export async function getOAuthProviders(): Promise<string[]> {
  return get<string[]>(`${AUTH_PATH}/oauth2/providers`)
}

/** Get the redirect URL that starts an OAuth2 flow for the given provider. */
export async function getOAuthUrl(provider: string): Promise<string> {
  return get<string>(`${AUTH_PATH}/oauth2/authorize/${provider}`)
}
