"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { BarChart3, BookOpen, DollarSign, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/dataTable/DataTable";
import { CourseDialog } from "@/components/dialog/CourseDialog";
import { DeleteConfirmDialog } from "@/components/dialog/DeleteConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { courseKeys, useCourseAdmin, useInstructorCourses, useInstructorStats } from "@/hooks/useCourses";
import { courseService } from "@/lib/api/courseService";
import type { CourseRequest, CourseResponse } from "@/types/courseType";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function courseRevenue(course: CourseResponse): number {
  const price = Number(course.price ?? 0)
  const enrolled = Number(course.enrolledCount ?? 0)
  if (course.isFree || price <= 0) return 0
  return price * enrolled
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    COMING_SOON: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    FEATURED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  }

  return (
    <Badge variant="outline" className={`border-0 text-xs font-medium ${config[status] ?? config.DRAFT}`}>
      {status === "COMING_SOON" ? "Coming Soon" : status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  )
}

function useInstructorCoursesTable(params: Record<string, unknown>) {
  const query = useQuery({
    queryKey       : courseKeys.instructorList(params),
    queryFn        : () => courseService.getMine(params),
    placeholderData: keepPreviousData,
  })

  return {
    data     : query.data ? { success: true as const, message: "", data: query.data } : undefined,
    isLoading: query.isPending,
    isError  : query.isError,
    error    : query.error,
    refetch  : query.refetch,
  }
}

export default function InstructorDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [activeCourse, setActiveCourse] = useState<CourseResponse | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<CourseResponse | null>(null)

  const { data: stats, loading: statsLoading } = useInstructorStats()
  const { data: allCoursesData, loading: coursesLoading } = useInstructorCourses({ page: 0, size: 200 })
  const { data: categoriesData } = useCategories({ page: 0, size: 100 })
  const { create, update, remove, creating, updating, removing } = useCourseAdmin()

  const categories = categoriesData?.content ?? []
  const allCourses = allCoursesData?.content ?? []
  const featuredCourses = allCourses.filter((course) => course.isFeatured).length

  useEffect(() => {
    if (searchParams.get("tab") === "create") {
      setDialogMode("add")
      setActiveCourse(null)
      setCourseDialogOpen(true)
    }
  }, [searchParams])

  const closeDialog = (open: boolean) => {
    setCourseDialogOpen(open)
    if (!open && searchParams.get("tab") === "create") {
      router.replace("/instructor")
    }
  }

  const columns = useMemo(() => [
    {
      key     : "title",
      label   : "Title",
      sortable: true,
      render  : (_value: unknown, item: CourseResponse) => (
        <div className="min-w-0">
          <p className="truncate font-medium leading-tight">{item.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.categoryName ?? "Uncategorized"}</p>
        </div>
      ),
    },
    {
      key   : "status",
      label : "Status",
      render: (value: string) => <StatusBadge status={value ?? "DRAFT"} />,
    },
    {
      key   : "enrolledCount",
      label : "Students",
      render: (value: number) => <span className="font-medium">{Number(value ?? 0).toLocaleString()}</span>,
    },
    {
      key   : "price",
      label : "Revenue",
      render: (_value: number, item: CourseResponse) => (
        <span className="font-medium text-emerald-700 dark:text-emerald-300">{formatCurrency(courseRevenue(item))}</span>
      ),
    },
  ], [])

  const filters = useMemo(() => [
    {
      key    : "status",
      label  : "Status",
      type   : "select" as const,
      options: [
        { label: "Published", value: "PUBLISHED" },
        { label: "Draft", value: "DRAFT" },
        { label: "Coming Soon", value: "COMING_SOON" },
      ],
    },
    {
      key    : "categoryId",
      label  : "Category",
      type   : "select" as const,
      options: categories.map((category) => ({ label: category.name, value: String(category.id) })),
    },
    {
      key    : "isFeatured",
      label  : "Featured",
      type   : "select" as const,
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  ], [categories])

  const handleCreate = () => {
    setDialogMode("add")
    setActiveCourse(null)
    setCourseDialogOpen(true)
  }

  const handleEdit = (course: CourseResponse) => {
    setDialogMode("edit")
    setActiveCourse(course)
    setCourseDialogOpen(true)
  }

  const handleSubmit = async (payload: CourseRequest, thumbnail?: File) => {
    try {
      if (dialogMode === "edit" && activeCourse) {
        await update(activeCourse.id, payload, thumbnail)
        toast.success("Course updated", { description: payload.title })
      } else {
        await create(payload, thumbnail)
        toast.success("Course created", { description: payload.title })
      }

      closeDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Course action failed")
    }
  }

  const handleDelete = async () => {
    if (!deletingCourse) return

    const ok = await remove(deletingCourse.id)
    setDeletingCourse(null)

    if (ok) {
      toast.success("Course deleted", { description: deletingCourse.title })
      return
    }

    toast.error("Failed to delete course")
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="rounded-3xl border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.08))] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-300/80">
              Instructor dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage your courses and track teaching performance</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Create new courses, update existing content, and monitor how many students are learning from your catalog.
            </p>
          </div>
          <Button size="sm" className="gap-2 self-start lg:self-auto" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>
      </section>

      <section id="stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Courses" value={stats?.totalCourses ?? 0} color="#0f766e" loading={statsLoading} />
        <StatCard icon={Users} label="Students Enrolled" value={stats?.totalStudents ?? 0} color="#2563eb" loading={statsLoading} />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} color="#059669" loading={statsLoading} />
        <StatCard icon={BarChart3} label="Featured Courses" value={featuredCourses} color="#d97706" loading={coursesLoading} />
      </section>

      <section id="courses" className="space-y-4">
        <DataTable<CourseResponse>
          title="My Courses"
          description="Only courses assigned to your instructor account are shown here."
          useDataHook={useInstructorCoursesTable}
          columns={columns}
          filters={filters}
          onEdit={handleEdit}
          onDelete={setDeletingCourse}
          headerActions={
            <Button size="sm" className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          }
          actionLabels={{ edit: "Edit", delete: "Delete" }}
        />
      </section>

      <CourseDialog
        isOpen={courseDialogOpen}
        onOpenChange={closeDialog}
        mode={dialogMode}
        course={activeCourse}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={creating || updating}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        onConfirm={handleDelete}
        itemName={deletingCourse?.title}
        isLoading={removing}
      />
    </div>
  )
}