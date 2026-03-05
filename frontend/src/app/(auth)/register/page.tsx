"use client"

import { useState, ChangeEvent, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import type { RegisterRequest } from "@/types/authType"
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function PasswordRule({ met, label }: { met: boolean; label: string }) {
  return (
    <span
      className="flex items-center gap-1.5 text-xs transition-colors"
      style={{ color: met ? "oklch(0.55 0.18 145)" : "var(--muted-foreground)" }}
    >
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </span>
  )
}

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [profilePicture, setProfilePicture] = useState<File | undefined>()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setProfilePicture(e.target.files[0])
  }

  const passwordRules = useMemo(() => ({
    length: form.password.length >= 6,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  }), [form.password])

  const passwordValid = Object.values(passwordRules).every(Boolean)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await authService.register({ ...form }, profilePicture)
      router.push("/login")
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div
        className="rounded-2xl border border-border bg-card/85 backdrop-blur-md p-8 shadow-2xl
                   shadow-black/30 ring-1 ring-white/10 transition-colors duration-300"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-wide">
            Create Account
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Join our learning community
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30
                          text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-foreground text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Choose username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground
                         focus-visible:ring-primary focus-visible:border-primary h-11 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-foreground text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground
                         focus-visible:ring-primary focus-visible:border-primary h-11 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-foreground text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground
                           focus-visible:ring-primary focus-visible:border-primary h-11 pr-10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground
                           hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-foreground text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground
                           focus-visible:ring-primary focus-visible:border-primary h-11 pr-10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground
                           hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password rules */}
          {form.password.length > 0 && (
            <div className="rounded-lg bg-muted/40 border border-border p-3 transition-colors">
              <p className="text-xs text-muted-foreground font-medium mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <PasswordRule met={passwordRules.length} label="Min 6 chars" />
                <PasswordRule met={passwordRules.uppercase} label="Uppercase" />
                <PasswordRule met={passwordRules.lowercase} label="Lowercase" />
                <PasswordRule met={passwordRules.number} label="Number" />
              </div>
            </div>
          )}

          {/* Profile picture */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">
              Profile Picture{" "}
              <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className="flex-1 h-11 flex items-center px-3 rounded-lg border border-dashed
                           bg-input/50 border-border group-hover:border-primary/50 transition-colors"
              >
                <span className="text-sm text-muted-foreground truncate">
                  {profilePicture ? profilePicture.name : "Choose image…"}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !passwordValid}
            className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg
                       transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:opacity-80 font-medium transition-opacity"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}