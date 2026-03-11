// context/AuthContext.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { authService }  from '../services/authService'
import { hasAdminRole } from '@/types/apiType'
import type {
  AuthResponse,
  UpdateProfileRequest,
} from '../types/authType'

interface AuthContextValue {
  user            : AuthResponse | null
  loading         : boolean
  initialized     : boolean
  /** true while a refresh call is in-flight — prevents premature redirects */
  isRefreshing    : boolean
  isAdmin         : boolean
  isAuthenticated : boolean
  login           : (username: string, password: string) => Promise<AuthResponse>
  logout          : () => Promise<void>
  updateProfile   : (payload: UpdateProfileRequest, photo?: File) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,         setUser]         = useState<AuthResponse | null>(null)
  const [loading,      setLoading]      = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  // Prevent the bootstrap effect from running more than once
  // (React 18 Strict Mode mounts twice in dev — this guard stops double-fetches)
  const didInit = useRef(false)

  // ── On mount: restore session ─────────────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    let cancelled = false

    async function bootstrap() {
      // ── Step 1: try /me with current access_token ────────────────────────
      try {
        const userData = await authService.me()
        if (!cancelled) setUser(userData)
        return                        // ✅ already logged in — done
      } catch {
        // access_token missing or expired — fall through to refresh
      }

      // ── Step 2: try to get a new access_token via refresh_token ──────────
      setIsRefreshing(true)
      try {
        // ✅ FIX 1 — use the AuthResponse returned by refresh() DIRECTLY.
        //
        // ❌ BEFORE:
        //   await authService.refresh()    // returns AuthResponse but result ignored
        //   const userData = await authService.me()  // extra call that FAILS if
        //                                            // proxy didn't forward Set-Cookie
        //   setUser(userData)
        //
        //   Chain when proxy drops Set-Cookie:
        //     refresh() → new access_token NOT saved as cookie
        //     me()      → fails (still no access_token cookie)
        //     setUser(null) → initialized=true → AccountPage fires router.replace('/login')
        //     middleware    → has refresh_token → redirects back to /account
        //     AuthProvider  → mounts again → same cycle → infinite loop ♻️
        //
        // ✅ AFTER:
        //   refresh() already returns the full AuthResponse including user data.
        //   Use it directly — no second me() call needed.
        //   Even if the proxy hasn't forwarded Set-Cookie yet, the user is set
        //   in memory and the page renders correctly for this session.
        const refreshed = await authService.refresh()
        if (!cancelled) setUser(refreshed)
      } catch {
        // refresh_token also expired/missing — call the logout endpoint via raw
        // fetch (bypasses the 401 interceptor) to clear the stale httpOnly cookies.
        // Without this, the middleware sees canRefresh=true and bounces /login → /account
        // in an infinite loop even though the refresh_token is no longer valid.
        try {
          await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
        } catch {
          // backend unreachable — nothing we can do, proceed anyway
        }
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsRefreshing(false)
      }
    }

    bootstrap().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, []) // ✅ empty deps — runs exactly ONCE on mount

  // ── Login ─────────────────────────────────────────────────────────────────
  // Navigation is handled by the caller (LoginPage) — do NOT do window.location.href
  // here, which would cause a hard reload race with the caller's router.replace().
  const login = useCallback(async (
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    const userData = await authService.login({ username, password })
    setUser(userData)
    return userData
  }, [])

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout()
    setUser(null)
  }, [])

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (
    payload: UpdateProfileRequest,
    photo?: File
  ): Promise<void> => {
    const updated = await authService.updateProfile(payload, photo)
    setUser(updated)
  }, [])

  const isAdmin         = hasAdminRole(user?.roles)
  const isAuthenticated = !!user
  const initialized     = !loading

  return (
    <AuthContext.Provider value={{
      user, loading, initialized, isRefreshing,
      isAdmin, isAuthenticated,
      login, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── useAuth (alias kept for backward compat with AccountPage) ─────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

// ── useAuthContext (original name) ────────────────────────────────────────
export const useAuthContext = useAuth