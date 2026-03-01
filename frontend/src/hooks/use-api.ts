"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  CategoryDto,
  CourseDto,
  ChapterDto,
  LessonDto,
  CodeSnippetDto,
  UserDto,
  PageResponse,
  DashboardStats,
  LessonProgressDto,
} from "@/lib/types";
import {
  fetchCategories,
  fetchCourses,
  fetchCourseById,
  fetchCourseBySlug,
  fetchCoursesByCategory,
  fetchChaptersByCourse,
  fetchLessonsByCourse,
  fetchLessonsByChapter,
  fetchLessonById,
  fetchSnippetsByLesson,
  fetchUsers,
  fetchUserById,
  fetchDashboardStats,
  getUserProgress,
  getCurrentUser,
} from "@/lib/api";

// ─── Generic Fetch Hook ───────────────────────────────────────────────────────

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (isMounted.current) {
        setData(result);
      }
    } catch (e) {
      if (isMounted.current) {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    fetch();
    return () => {
      isMounted.current = false;
    };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── Categories Hook ──────────────────────────────────────────────────────────

export function useCategories(page = 0, size = 50) {
  return useQuery<PageResponse<CategoryDto>>(
    () => fetchCategories(page, size),
    [page, size]
  );
}

// ─── Courses Hooks ────────────────────────────────────────────────────────────

export function useCourses(
  page = 0,
  size = 20,
  sortBy = "createdAt",
  sortDir: "asc" | "desc" = "desc"
) {
  return useQuery<PageResponse<CourseDto>>(
    () => fetchCourses(page, size, sortBy, sortDir),
    [page, size, sortBy, sortDir]
  );
}

export function useCourse(id: number | null) {
  return useQuery<CourseDto | null>(
    async () => (id ? fetchCourseById(id) : null),
    [id]
  );
}

export function useCourseBySlug(slug: string | null) {
  return useQuery<CourseDto | null>(
    async () => (slug ? fetchCourseBySlug(slug) : null),
    [slug]
  );
}

export function useCoursesByCategory(categoryId: number | null, page = 0, size = 20) {
  return useQuery<PageResponse<CourseDto> | null>(
    async () => (categoryId ? fetchCoursesByCategory(categoryId, page, size) : null),
    [categoryId, page, size]
  );
}

// ─── Chapters Hook ────────────────────────────────────────────────────────────

export function useChaptersByCourse(courseId: number | null) {
  return useQuery<ChapterDto[] | null>(
    async () => (courseId ? fetchChaptersByCourse(courseId) : null),
    [courseId]
  );
}

// ─── Lessons Hooks ────────────────────────────────────────────────────────────

export function useLessonsByCourse(courseId: number | null) {
  return useQuery<LessonDto[] | null>(
    async () => (courseId ? fetchLessonsByCourse(courseId) : null),
    [courseId]
  );
}

export function useLessonsByChapter(chapterId: number | null) {
  return useQuery<LessonDto[] | null>(
    async () => (chapterId ? fetchLessonsByChapter(chapterId) : null),
    [chapterId]
  );
}

export function useLesson(id: number | null) {
  return useQuery<LessonDto | null>(
    async () => (id ? fetchLessonById(id) : null),
    [id]
  );
}

// ─── Snippets Hook ────────────────────────────────────────────────────────────

export function useSnippetsByLesson(lessonId: number | null) {
  return useQuery<CodeSnippetDto[] | null>(
    async () => (lessonId ? fetchSnippetsByLesson(lessonId) : null),
    [lessonId]
  );
}

// ─── Users Hooks ──────────────────────────────────────────────────────────────

export function useUsers(page = 0, size = 20) {
  return useQuery<PageResponse<UserDto>>(
    () => fetchUsers(page, size),
    [page, size]
  );
}

export function useUser(id: number | null) {
  return useQuery<UserDto | null>(
    async () => (id ? fetchUserById(id) : null),
    [id]
  );
}

export function useCurrentUser() {
  return useQuery<UserDto | null>(
    async () => {
      try {
        return await getCurrentUser();
      } catch {
        return null;
      }
    },
    []
  );
}

// ─── Dashboard Stats Hook ─────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery<DashboardStats>(fetchDashboardStats, []);
}

// ─── User Progress Hook ───────────────────────────────────────────────────────

export function useUserProgress(userId: number | null) {
  return useQuery<LessonProgressDto[] | null>(
    async () => (userId ? getUserProgress(userId) : null),
    [userId]
  );
}

// ─── Mutation Hook ────────────────────────────────────────────────────────────

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Unknown error");
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, data, loading, error, reset };
}
