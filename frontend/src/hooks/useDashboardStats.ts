'use client'

import { useQuery } from '@tanstack/react-query'
import { courseService } from '../services/courseService'
import { userService } from '../services/userService'
import { categoryService } from '../services/categoryService'
import type { PageResponse } from '../types/apiType'
import type { CourseResponse } from '../types/courseType'
import type { UserResponse } from '../types/userType'
import type { CategoryResponse } from '../types/category'

// ─────────────────────────────────────────────────────────────
//  Dashboard Stats — aggregates data from multiple APIs
// ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  // Counts
  totalCourses: number
  totalUsers: number
  totalCategories: number
  totalEnrollments: number
  publishedCourses: number
  draftCourses: number
  featuredCourses: number
  activeUsers: number
  activeCategories: number

  // Distributions
  coursesByLevel: { name: string; value: number; fill: string }[]
  coursesByCategory: { name: string; courses: number }[]
  usersByRole: { name: string; value: number; fill: string }[]

  // Recent items
  recentCourses: CourseResponse[]
  recentUsers: UserResponse[]

  // Loading
  loading: boolean
  error: string | null
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: '#10b981',
  INTERMEDIATE: '#f59e0b',
  ADVANCED: '#ef4444',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#8b5cf6',
  INSTRUCTOR: '#3b82f6',
  USER: '#64748b',
}

export function useDashboardStats(): DashboardStats {
  const coursesQuery = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => courseService.getAll({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' }),
    staleTime: 2 * 60 * 1000,
  })

  const usersQuery = useQuery({
    queryKey: ['dashboard', 'users'],
    queryFn: () => userService.getAll({ page: 0, size: 100, sortBy: 'id', sortDir: 'desc' }),
    staleTime: 2 * 60 * 1000,
  })

  const categoriesQuery = useQuery({
    queryKey: ['dashboard', 'categories'],
    queryFn: () => categoryService.getAll({ page: 0, size: 100, sortBy: 'orderIndex', sortDir: 'asc' }),
    staleTime: 2 * 60 * 1000,
  })

  const coursesData = coursesQuery.data as PageResponse<CourseResponse> | undefined
  const usersData = usersQuery.data as PageResponse<UserResponse> | undefined
  const categoriesData = categoriesQuery.data as PageResponse<CategoryResponse> | undefined

  const courses = coursesData?.content ?? []
  const users = usersData?.content ?? []
  const categories = categoriesData?.content ?? []

  // --- Counts ---
  const totalCourses = coursesData?.totalElements ?? 0
  const totalUsers = usersData?.totalElements ?? 0
  const totalCategories = categoriesData?.totalElements ?? 0
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledCount ?? 0), 0)
  const publishedCourses = courses.filter(c => c.status === 'PUBLISHED').length
  const draftCourses = courses.filter(c => c.status === 'DRAFT').length
  const featuredCourses = courses.filter(c => c.featured || c.isFeatured).length
  const activeUsers = users.filter(u => u.isActive).length
  const activeCategories = categories.filter(c => c.isActive).length

  // --- Courses by level ---
  const levelCounts: Record<string, number> = {}
  courses.forEach(c => {
    const level = c.level ?? 'BEGINNER'
    levelCounts[level] = (levelCounts[level] ?? 0) + 1
  })
  const coursesByLevel = Object.entries(levelCounts).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value,
    fill: LEVEL_COLORS[name] ?? '#6366f1',
  }))

  // --- Courses by category ---
  const coursesByCategory = categories
    .filter(c => (c.courseCount ?? 0) > 0)
    .map(c => ({ name: c.name, courses: c.courseCount ?? 0 }))
    .sort((a, b) => b.courses - a.courses)
    .slice(0, 8)

  // --- Users by role ---
  const roleCounts: Record<string, number> = {}
  users.forEach(u => {
    const role = u.role ?? 'USER'
    roleCounts[role] = (roleCounts[role] ?? 0) + 1
  })
  const usersByRole = Object.entries(roleCounts).map(([name, value]) => ({
    name,
    value,
    fill: ROLE_COLORS[name] ?? '#64748b',
  }))

  // --- Recent items ---
  const recentCourses = courses.slice(0, 5)
  const recentUsers = users.slice(0, 5)

  const loading = coursesQuery.isPending || usersQuery.isPending || categoriesQuery.isPending
  const error =
    coursesQuery.error?.message ??
    usersQuery.error?.message ??
    categoriesQuery.error?.message ??
    null

  return {
    totalCourses,
    totalUsers,
    totalCategories,
    totalEnrollments,
    publishedCourses,
    draftCourses,
    featuredCourses,
    activeUsers,
    activeCategories,
    coursesByLevel,
    coursesByCategory,
    usersByRole,
    recentCourses,
    recentUsers,
    loading,
    error,
  }
}
