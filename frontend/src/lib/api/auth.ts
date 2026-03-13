
import { get, post, put, buildFormData } from '@/lib/api/client'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '@/types/authType'

const AUTH_PATH = '/api/v1/auth'
const API_BASE_URL = process.env.API_BASE_URL

// ── Auth ───────────────────────────────────────────────────────────────────

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return post<AuthResponse>(`${AUTH_PATH}/login`, payload)
}

export async function logout(): Promise<void> {
  await post<void>(`${AUTH_PATH}/logout`, {}, { raw: true })
}

export async function getMe(): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_PATH}/me`, {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Unauthorized')
  const data = await res.json()
  return data.data
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
export async function refreshToken(): Promise<void> {
  const res = await fetch(`${AUTH_PATH}/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Refresh failed')
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

export function redirectToOAuth(provider: 'google' | 'github'): void {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`
}

export async function getOAuthProviders(): Promise<string[]> {
  return get<string[]>(`${AUTH_PATH}/oauth2/providers`)
}