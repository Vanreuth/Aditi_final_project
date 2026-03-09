'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useScrollTracker } from './useLessonProgress'

// ─────────────────────────────────────────────────────────────
//  useReadingTimer
//
//  Measures how long the user actually spends reading a lesson.
//  - Starts counting on mount
//  - Pauses automatically when the tab is hidden (Page Visibility API)
//  - Resumes when the tab becomes visible again
//  - Saves accumulated seconds to the backend (via upsert) every
//    SAVE_INTERVAL_MS, and also on page unload / unmount
//  - Works together with useScrollTracker so one upsert carries
//    both scroll position AND reading time
//
//  Usage on a lesson page:
//    useReadingTimer(lesson.id)
// ─────────────────────────────────────────────────────────────

const SAVE_INTERVAL_MS = 30_000 // auto-save every 30 s

export function useReadingTimer(lessonId: number) {
  const { saveScroll } = useScrollTracker(lessonId)

  // Total seconds accumulated in previous "active" sessions
  const accumulatedRef = useRef(0)
  // Timestamp when the current active session started (null = paused)
  const sessionStartRef = useRef<number | null>(null)
  // Keep saveScroll stable in refs so interval/event closures are never stale
  const saveScrollRef = useRef(saveScroll)
  useEffect(() => { saveScrollRef.current = saveScroll }, [saveScroll])

  // ── Core helpers ─────────────────────────────────────────

  /** How many seconds have elapsed in the current active session */
  const currentSessionSeconds = useCallback((): number => {
    if (!sessionStartRef.current) return 0
    return Math.round((Date.now() - sessionStartRef.current) / 1000)
  }, [])

  /** Total seconds = previous sessions + current session */
  const totalSeconds = useCallback((): number => {
    return accumulatedRef.current + currentSessionSeconds()
  }, [currentSessionSeconds])

  /** Pause: bank the current session seconds, clear the start timestamp */
  const pause = useCallback(() => {
    if (!sessionStartRef.current) return          // already paused
    accumulatedRef.current += currentSessionSeconds()
    sessionStartRef.current = null
  }, [currentSessionSeconds])

  /** Resume: start a new session from now */
  const resume = useCallback(() => {
    if (sessionStartRef.current) return           // already running
    sessionStartRef.current = Date.now()
  }, [])

  /** Save current total to backend alongside current scroll position */
  const save = useCallback(() => {
    const seconds = totalSeconds()
    if (!seconds) return
    const scrollPosition = typeof window !== 'undefined'
      ? Math.round(window.scrollY)
      : 0
    saveScrollRef.current(scrollPosition, seconds)
  }, [totalSeconds])

  // ── Mount / unmount ──────────────────────────────────────

  useEffect(() => {
    if (!lessonId) return

    // Start counting immediately
    sessionStartRef.current = Date.now()

    // Auto-save on a regular interval
    const interval = setInterval(save, SAVE_INTERVAL_MS)

    // Save when the user closes / navigates away
    const handleUnload = () => { pause(); save() }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleUnload)
      // Final save on component unmount (Next.js route change)
      pause()
      save()
    }
  }, [lessonId, pause, save])

  // ── Page Visibility API ───────────────────────────────────
  // Pause timer when user switches tabs / minimises window;
  // resume when they come back — so idle time is not counted.

  useEffect(() => {
    if (!lessonId || typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pause()
        save()          // save immediately on hide
      } else {
        resume()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [lessonId, pause, resume, save])

  // ── Expose for optional manual control ───────────────────

  return { pause, resume, save, totalSeconds }
}