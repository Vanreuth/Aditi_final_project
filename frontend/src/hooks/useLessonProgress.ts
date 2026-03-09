'use client'

import { useCallback, useEffect, useState } from 'react'
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
//     Use this when you need to READ a single lesson's progress
//     (e.g. lesson detail page). It fires GET /lesson-progress?lessonId=
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
      // ✅ deleted completed lesson must also decrement the count cache
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
//
//     Use this in list rows (e.g. ActivityTab's LessonRow) where
//     you already have the data from /me and do NOT want an extra
//     GET /lesson-progress?lessonId= firing for every row.
// ═════════════════════════════════════════════════════════════

export function useLessonProgressActions(lessonId: number) {
  const qc = useQueryClient()

  const completeMutation = useMutation({
    mutationFn: () => lessonProgressService.markCompleted(lessonId),
    onSuccess : (data) => {
      // Update detail cache if it exists (no-op if not cached)
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

  const completedIds = (query.data ?? [])
    .filter((p) => p.completed)
    .map((p) => p.lessonId)

  const isCompleted = useCallback(
    (lessonId: number) => completedIds.includes(lessonId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(completedIds)],
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

  const completedIds = (query.data ?? [])
    .filter((p) => p.completed)
    .map((p) => p.lessonId)

  const completedCount  = completedIds.length
  const totalCount      = totalLessons || (query.data?.length ?? 0)
  const percentComplete = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0

  const isCompleted = useCallback(
    (lessonId: number) => completedIds.includes(lessonId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(completedIds)],
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
//  5. useCompletedCount — global completed lesson count
//     Hits GET /me/completed-count — fast, cheap, always accurate
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
//     Hits GET /course/{courseId}/completed-count
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
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const saveScroll = useCallback(
    (scrollPosition: number, readTimeSeconds?: number) => {
      if (!lessonId) return
      if (timer) clearTimeout(timer)
      const t = setTimeout(() => {
        lessonProgressService
          .upsert({ lessonId, scrollPosition, readTimeSeconds })
          .catch(() => {})
      }, 1500)
      setTimer(t)
    },
    [lessonId, timer],
  )

  useEffect(() => {
    return () => { if (timer) clearTimeout(timer) }
  }, [timer])

  return { saveScroll }
}