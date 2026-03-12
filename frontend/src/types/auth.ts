/**
 * types/auth.ts
 *
 * Auth-related TypeScript types — re-exported from the canonical authType.ts
 * so both the old path and the new lib/api/* path work without duplication.
 *
 * Usage:
 *   import type { AuthResponse, LoginRequest } from '@/types/auth'
 */

export type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from './authType'
