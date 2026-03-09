'use client'

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setRoleCookie } from "@/lib/Cookies"
import { hasAdminRole } from "@/types/apiType"
import { authService } from "@/services/authService"

import OAuthCard from "@/components/auth/OAuthCard"
import OAuthLoading from "@/components/auth/ OAuthLoading"
import OAuthSuccess from "@/components/auth/OAuthSuccess"
import OAuthError from "@/components/auth/OAuthError"

type Status = "loading" | "success" | "error"

export default function OAuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  const redirectError = params.get("error")

  const [status, setStatus] = useState<Status>(
      redirectError ? "error" : "loading"
  )

  const [message, setMessage] = useState(
      redirectError ? decodeURIComponent(redirectError) : ""
  )

  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? "" : d + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (redirectError) return

    authService
        .me()
        .then((user) => {
          setStatus("success")

          const admin = hasAdminRole(user.roles)
          setRoleCookie(admin)

          setTimeout(() => {
            router.replace(admin ? "/dashboard" : "/account")
          }, 1200)
        })
        .catch(() => {
          setStatus("error")
          setMessage("Authentication failed. Please try again.")
        })
  }, [redirectError, router])

  return (
      <div className="min-h-screen flex items-center justify-center bg-[#080d18] relative overflow-hidden">

        <OAuthCard>

          {status === "loading" && <OAuthLoading dots={dots} />}

          {status === "success" && <OAuthSuccess />}

          {status === "error" && (
              <OAuthError
                  message={message}
                  onRetry={() => router.replace("/login")}
              />
          )}

        </OAuthCard>

      </div>
  )
}