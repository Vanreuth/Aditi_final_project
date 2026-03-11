// hooks/useLessonProgress.ts
'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { lessonProgressService } from '../services/lessonProgressService'
import type {
  LessonProgressResponse,
  LessonProgressRequest,
} from '../types/lessonProgressType'

// ─────────────────────────────────────────────────────────────
//  Query Keys
// ─────────────────────────────────────────────────────────────

export const progressKeys = {
  all          : ['progress'] as const,
  mine         : ['progress', 'mine'] as const,
  detail       : (lessonId: number) => ['progress', lessonId] as const,
  byCourse     : (courseId: number) => ['progress', 'course', courseId] as const,
  count        : ['progress', 'count'] as const,
  countByCourse: (courseId: number) => ['progress', 'count', courseId] as const,
}

// ─────────────────────────────────────────────────────────────
//  Helper — map React Query state to legacy shape
// ─────────────────────────────────────────────────────────────

function toState<T>(q: { data?: T; isPending: boolean; error: Error | null }) {
  return {
    data   : q.data ?? null,
    loading: q.isPending,
    error  : q.error?.message ?? null,
  }
}

// ═════════════════════════════════════════════════════════════
//  1. useLessonProgress — single lesson progress + mutations
// ═════════════════════════════════════════════════════════════

export function useLessonProgress(lessonId: number) {
  const qc    = useQueryClient()
  const query = useQuery({
    queryKey: progressKeys.detail(lessonId),
    queryFn : () => lessonProgressService.get(lessonId),
    enabled : !!lessonId,
  })

  const upsertMutation = useMutation({
    mutationFn: (payload: LessonProgressRequest) => lessonProgressService.upsert(payload),
    onSuccess : (data) => {
      qc.setQueryData(progressKeys.detail(lessonId), data)
      qc.invalidateQueries({ queryKey: progressKeys.mine })
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => lessonProgressService.markCompleted(lessonId),
    onSuccess : (data) => {
      qc.setQueryData(progressKeys.detail(lessonId), data)
      qc.invalidateQueries({ queryKey: progressKeys.mine })
      qc.invalidateQueries({ queryKey: progressKeys.count })
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => lessonProgressService.remove(lessonId),
    onSuccess : () => {
      qc.removeQueries({ queryKey: progressKeys.detail(lessonId) })
      qc.invalidateQueries({ queryKey: progressKeys.mine })
      qc.invalidateQueries({ queryKey: progressKeys.count })
    },
  })

  return {
    ...toState<LessonProgressResponse>(query),
    refetch      : query.refetch,
    upsert       : (payload: LessonProgressRequest) => upsertMutation.mutateAsync(payload),
    markCompleted: () => completeMutation.mutateAsync(),
    remove       : async () => { await removeMutation.mutateAsync(); return true },
  }
}

// ═════════════════════════════════════════════════════════════
//  2. useLessonProgressActions — mutations ONLY, no GET query
// ═════════════════════════════════════════════════════════════

export function useLessonProgressActions(lessonId: number) {
  const qc = useQueryClient()

  const completeMutation = useMutation({
    mutationFn: () => lessonProgressService.markCompleted(lessonId),
    onSuccess : (data) => {
      qc.setQueryData(progressKeys.detail(lessonId), data)
      qc.invalidateQueries({ queryKey: progressKeys.mine })
      qc.invalidateQueries({ queryKey: progressKeys.count })
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => lessonProgressService.remove(lessonId),
    onSuccess : () => {
      qc.removeQueries({ queryKey: progressKeys.detail(lessonId) })
      qc.invalidateQueries({ queryKey: progressKeys.mine })
      qc.invalidateQueries({ queryKey: progressKeys.count })
    },
  })

  const upsertMutation = useMutation({
    mutationFn: (payload: LessonProgressRequest) => lessonProgressService.upsert(payload),
    onSuccess : (data) => {
      qc.setQueryData(progressKeys.detail(lessonId), data)
      qc.invalidateQueries({ queryKey: progressKeys.mine })
    },
  })

  return {
    markCompleted    : () => completeMutation.mutateAsync(),
    remove           : () => removeMutation.mutateAsync(),
    upsert           : (payload: LessonProgressRequest) => upsertMutation.mutateAsync(payload),
    isCompletePending: completeMutation.isPending,
    isRemovePending  : removeMutation.isPending,
  }
}

// ═════════════════════════════════════════════════════════════
//  3. useMyProgress — all progress for authenticated user
// ═════════════════════════════════════════════════════════════

export function useMyProgress() {
  const query = useQuery({
    queryKey: progressKeys.mine,
    queryFn : () => lessonProgressService.getMine(),
  })

  // ✅ FIX 1 — stable completedIds with useMemo instead of inline array creation.
  //
  // ❌ BEFORE:
  //   const completedIds = query.data?.filter(...).map(...)
  //   → new array reference on EVERY render, even when data hasn't changed
  //   → anything that depended on completedIds (useCallback, useEffect) would
  //     re-run on every render, causing cascading re-renders across the whole page.
  //
  // ✅ AFTER: useMemo with query.data as the dep — only recomputes when data changes.
  const completedIds = useMemo(
    () => (query.data ?? []).filter((p) => p.completed).map((p) => p.lessonId),
    [query.data],
  )

  const isCompleted = useCallback(
    (lessonId: number) => completedIds.includes(lessonId),
    [completedIds],   // ✅ stable — only changes when completedIds actually changes
  )

  return {
    ...toState<LessonProgressResponse[]>(query),
    completedIds,
    isCompleted,
    refetch: query.refetch,
  }
}

// ═════════════════════════════════════════════════════════════
//  4. useCourseProgress — progress within a specific course
// ═════════════════════════════════════════════════════════════

export function useCourseProgress(courseId: number, totalLessons: number = 0) {
  const query = useQuery({
    queryKey: progressKeys.byCourse(courseId),
    queryFn : () => lessonProgressService.getByCourse(courseId),
    enabled : !!courseId,
  })

  // ✅ Same fix — stable completedIds
  const completedIds = useMemo(
    () => (query.data ?? []).filter((p) => p.completed).map((p) => p.lessonId),
    [query.data],
  )

  const completedCount  = completedIds.length
  const totalCount      = totalLessons || (query.data?.length ?? 0)
  const percentComplete = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0

  const isCompleted = useCallback(
    (lessonId: number) => completedIds.includes(lessonId),
    [completedIds],
  )

  return {
    ...toState<LessonProgressResponse[]>(query),
    completedCount,
    totalCount,
    percentComplete,
    completedIds,
    isCompleted,
    refetch: query.refetch,
  }
}

// ═════════════════════════════════════════════════════════════
//  5. useCompletedCount
// ═════════════════════════════════════════════════════════════

export function useCompletedCount() {
  const query = useQuery({
    queryKey: progressKeys.count,
    queryFn : () => lessonProgressService.countCompleted(),
  })
  return { ...toState<number>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  6. useCompletedCountByCourse
// ═════════════════════════════════════════════════════════════

export function useCompletedCountByCourse(courseId: number) {
  const query = useQuery({
    queryKey: progressKeys.countByCourse(courseId),
    queryFn : () => lessonProgressService.countCompletedByCourse(courseId),
    enabled : !!courseId,
  })
  return { ...toState<number>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  7. useScrollTracker — debounced scroll auto-save
// ═════════════════════════════════════════════════════════════

export function useScrollTracker(lessonId: number) {
  // ✅ FIX 2 — use a ref for the timer instead of useState.
  //
  // ❌ BEFORE:
  //   const [timer, setTimer] = useState(null)
  //   saveScroll called setTimer(t) → state update → re-render
  //   → new timer ref → saveScroll recreated → anything using saveScroll re-ran
  //   → if saveScroll was in a useEffect dep, it fired again → infinite loop.
  //
  // ✅ AFTER: useRef never triggers a re-render when mutated.
  //   The timer value is stored in ref.current — stable, no re-render side effects.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, []) // ✅ empty deps — runs cleanup exactly once on unmount

  const saveScroll = useCallback(
    (scrollPosition: number, readTimeSeconds?: number) => {
      if (!lessonId) return
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        lessonProgressService
          .upsert({ lessonId, scrollPosition, readTimeSeconds })
          .catch(() => {})
      }, 1500)
      // ✅ No setTimer call — ref mutation is silent, no re-render triggered
    },
    [lessonId], // ✅ only lessonId — timer is a ref now, not a dep
  )

  return { saveScroll }
}