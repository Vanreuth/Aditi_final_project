'use client'

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getDefaultAppRoute } from '@/types/api'
import { getMe } from '@/lib/api/auth'

import OAuthCard from "@/components/auth/OAuthCard"
import OAuthLoading from "@/components/auth/ OAuthLoading"
import OAuthSuccess from "@/components/auth/OAuthSuccess"
import OAuthError from "@/components/auth/OAuthError"

type Status = "loading" | "success" | "error"

function OAuthCallbackContent() {
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

    getMe()
      .then((user) => {
        setStatus("success")

        const destination = getDefaultAppRoute(user.roles ?? [])

        setTimeout(() => {
          router.replace(destination)
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