'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/lib/api/analyticsService'
import type { AnalyticsRange, DashboardAnalyticsResponse } from '@/types/analyticsType'

// ─────────────────────────────────────────────────────────────
//  Dashboard Stats — backed by the analytics endpoint
// ─────────────────────────────────────────────────────────────

export interface DashboardStats extends DashboardAnalyticsResponse {
  loading: boolean
  error: string | null
  refetch: () => Promise<unknown>
}

const EMPTY_ANALYTICS: DashboardAnalyticsResponse = {
  totalCourses: 0,
  totalUsers: 0,
  totalCategories: 0,
  totalEnrollments: 0,
  publishedCourses: 0,
  draftCourses: 0,
  featuredCourses: 0,
  activeUsers: 0,
  activeCategories: 0,
  coursesByLevel: [],
  coursesByCategory: [],
  usersByRole: [],
  recentCourses: [],
  recentUsers: [],
  activitySeries: [],
}

export function useDashboardStats(range: AnalyticsRange = '30d'): DashboardStats {
  const analyticsQuery = useQuery({
    queryKey: ['dashboard', 'analytics', range],
    queryFn: () => analyticsService.getDashboard(range),
    staleTime: 2 * 60 * 1000,
  })

  const analytics = analyticsQuery.data ?? EMPTY_ANALYTICS

  return {
    ...analytics,
    loading: analyticsQuery.isPending,
    error: analyticsQuery.error?.message ?? null,
    refetch: () => analyticsQuery.refetch(),
  }
}
