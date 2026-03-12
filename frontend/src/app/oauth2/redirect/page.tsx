'use client'

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getDefaultAppRoute } from '@/types/api'
import { getMe } from '@/lib/api/auth'

import OAuthCard    from "@/components/auth/OAuthCard"
import OAuthLoading from "@/components/auth/OAuthLoading"
import OAuthSuccess from "@/components/auth/OAuthSuccess"
import OAuthError   from "@/components/auth/OAuthError"

type Status = "loading" | "success" | "error"

/** Decode JWT payload to extract roles without a backend call. */
function decodeJwtRoles(token: string): string[] {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    // Spring Security may use 'authorities', 'roles', or 'role'
    const raw = payload.authorities ?? payload.roles ?? payload.role ?? []
    return Array.isArray(raw) ? raw : [String(raw)]
  } catch {
    return []
  }
}

function OAuthCallbackContent() {
  const router = useRouter()
  const params = useSearchParams()

  const redirectError = params.get("error")

  const [status,  setStatus]  = useState<Status>(
    redirectError ? "error" : "loading"
  )
  const [message, setMessage] = useState(
    redirectError ? decodeURIComponent(redirectError) : ""
  )
  const [dots, setDots] = useState("")

  // Animated dots for loading state
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? "" : d + "."))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (redirectError) return

    const accessToken  = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    async function handleCallback() {
      if (accessToken && refreshToken) {
        // Cross-domain OAuth: Spring embeds tokens in the redirect URL because
        // it cannot set cookies across domains (onrender.com → vercel.app).
        // Exchange them for httpOnly cookies on this domain.
        await fetch('/api/v1/auth/oauth2/token', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
        })
        // Remove tokens from URL — prevent exposure in browser history / logs
        window.history.replaceState({}, '', '/oauth2/redirect')

        // Decode roles from the JWT payload we already have — avoids a full
        // backend round-trip (and Render cold-start delay) just to get roles.
        const roles = decodeJwtRoles(accessToken)
        setStatus("success")
        const destination = getDefaultAppRoute(roles)
        setTimeout(() => router.replace(destination), 1200)
        return
      }

      // No tokens in URL — user may have a valid session already; verify it.
      try {
        const user = await getMe()
        setStatus("success")
        const destination = getDefaultAppRoute(user.roles ?? [])
        setTimeout(() => router.replace(destination), 1200)
      } catch {
        setStatus("error")
        setMessage("Authentication failed. Please try again.")
      }
    }

    handleCallback()
  }, [redirectError, router, params])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080d18] relative overflow-hidden">
      <OAuthCard>
        {status === "loading" && <OAuthLoading dots={dots} />}
        {status === "success" && <OAuthSuccess />}
        {status === "error"   && (
          <OAuthError
            message={message}
            onRetry={() => router.replace("/login")}
          />
        )}
      </OAuthCard>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#080d18]">
        <OAuthCard><OAuthLoading dots="" /></OAuthCard>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  )
}