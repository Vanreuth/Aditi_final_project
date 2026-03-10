'use client'

import {
  createContext,
  useContext,
  useEffect,
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
  isAdmin         : boolean
  isAuthenticated : boolean
  login           : (username: string, password: string) => Promise<AuthResponse>
  logout          : () => Promise<void>
  updateProfile   : (payload: UpdateProfileRequest, photo?: File) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // ── On mount: restore session ─────────────────────────────
  useEffect(() => {
    authService.me()
      .then(setUser)
      .catch(async () => {
        try {
          // ✅ access_token expired → try refresh first
          await authService.refresh()
          // ✅ refresh succeeded → get user again
          const userData = await authService.me()
          setUser(userData)
        } catch {
          // ✅ refresh also failed → user must login
          setUser(null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    const userData = await authService.login({ username, password })
    setUser(userData)
    const admin = hasAdminRole(userData.roles)
    window.location.href = admin ? '/dashboard' : '/account'
    return userData
  }, [])

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await authService.logout()
    setUser(null)
  }, [])

  // ── Update profile ────────────────────────────────────────
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
      user, loading, initialized,
      isAdmin, isAuthenticated,
      login, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>')
  return ctx
}