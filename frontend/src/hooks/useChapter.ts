'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { chapterService } from '../services/chapterService'
import type { ChapterResponse, ChapterRequest } from '../types/chapterType'

// ─────────────────────────────────────────────────────────────
//  Query Keys
// ─────────────────────────────────────────────────────────────

export const chapterKeys = {
  all     : ['chapters'] as const,
  byCourse: (courseId: number) => ['chapters', 'course', courseId] as const,
  detail  : (id: number)      => ['chapters', id] as const,
}

function toState<T>(q: { data?: T; isPending: boolean; error: Error | null }) {
  return { data: q.data ?? null, loading: q.isPending, error: q.error?.message ?? null }
}

// ═════════════════════════════════════════════════════════════
//  1. useChaptersByCourse — all chapters in a course
// ═════════════════════════════════════════════════════════════

export function useChaptersByCourse(courseId: number) {
  const query = useQuery({
    queryKey: chapterKeys.byCourse(courseId),
    queryFn : () => chapterService.getByCourse(courseId),
    enabled : !!courseId,
  })
  return { ...toState<ChapterResponse[]>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  2. useChapterById — single chapter by id
// ═════════════════════════════════════════════════════════════

export function useChapterById(id: number) {
  const query = useQuery({
    queryKey: chapterKeys.detail(id),
    queryFn : () => chapterService.getById(id),
    enabled : !!id,
  })
  return { ...toState<ChapterResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  3. useChapterAdmin — CRUD mutations [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useChapterAdmin() {
  const qc = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (payload: ChapterRequest) => chapterService.create(payload),
    onSuccess : (data) => qc.invalidateQueries({ queryKey: chapterKeys.byCourse(data.courseId) }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChapterRequest }) =>
      chapterService.update(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: chapterKeys.detail(data.id) })
      qc.invalidateQueries({ queryKey: chapterKeys.byCourse(data.courseId) })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => chapterService.remove(id),
    onSuccess : () => qc.invalidateQueries({ queryKey: chapterKeys.all }),
  })

  return {
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    removing: removeMutation.isPending,
    error   : (createMutation.error ?? updateMutation.error ?? removeMutation.error)?.message ?? null,
    create  : (payload: ChapterRequest) => createMutation.mutateAsync(payload),
    update  : (id: number, payload: ChapterRequest) => updateMutation.mutateAsync({ id, payload }),
    remove  : (id: number) =>
      removeMutation.mutateAsync(id).then(() => true as const).catch(() => false as const),
  }
}
