"use client";

import { useMemo } from "react";
import {
  BookOpen, Users, Layers, TrendingUp, Plus, BarChart2,
  ArrowUpRight, ArrowDownRight, Calendar, GraduationCap,
  FileText, Activity, CheckCircle2, Clock, Star,
  MoreHorizontal, Eye, ChevronRight, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

/* ── Chart tooltip ──────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
      <div className="rounded-xl border border-border/50 bg-background/95 px-3 py-2.5 shadow-xl backdrop-blur-sm text-xs">
        {label && <p className="mb-1.5 font-semibold text-foreground">{label}</p>}
        {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
              <span className="capitalize text-muted-foreground">{p.name}</span>
              <span className="ml-1 font-semibold text-foreground">{p.value}</span>
            </div>
        ))}
      </div>
  );
}

/* ── Stat card ──────────────────────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: number;
  loading?: boolean;
}

function StatCard({ title, value, sub, icon: Icon, iconBg, iconColor, trend, loading }: StatCardProps) {
  if (loading) return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
  );

  return (
      <div className="group rounded-xl border border-border bg-card p-5 hover:border-border/80 hover:shadow-sm transition-all duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-muted-foreground truncate">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{sub}</p>
          </div>
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
            <Icon className={cn("size-5", iconColor)} strokeWidth={1.75} />
          </div>
        </div>
        {trend !== undefined && trend !== 0 && (
            <div className={cn(
                "mt-3 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                trend > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-500"
            )}>
              {trend > 0 ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
              {Math.abs(trend)}% this month
            </div>
        )}
      </div>
  );
}

/* ── Section header ─────────────────────────────────────────────── */
function SectionHeader({
                         icon: Icon, title, description, badge, action
                       }: {
  icon: React.ElementType; title: string; description?: string;
  badge?: string; action?: React.ReactNode;
}) {
  return (
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
            <Icon className="size-3.5 text-foreground" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground">{title}</p>
            {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {badge && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {badge}
          </span>
          )}
          {action}
        </div>
      </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
      <div className="flex h-52 flex-col items-center justify-center gap-2 text-muted-foreground">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60">
          <Icon className="size-5 opacity-40" />
        </div>
        <p className="text-[13px] font-medium">{title}</p>
        {sub && <p className="text-[11px] opacity-60">{sub}</p>}
      </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main Dashboard
═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const stats = useDashboardStats();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const emoji = hour < 12 ? "☀️" : hour < 17 ? "👋🏼" : "🌙";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  /* Derived */
  const publishedPct = stats.totalCourses > 0
      ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) : 0;
  const activePct = stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;
  const activeCatPct = stats.totalCategories > 0
      ? Math.round((stats.activeCategories / stats.totalCategories) * 100) : 0;

  const LEVEL_COLORS = ["#10b981", "#f59e0b", "#ef4444"];
  const PIE_COLORS   = ["#6366f1", "#0ea5e9", "#64748b", "#10b981"];

  /* Enrollment area data from recent courses */
  const enrollmentData = stats.recentCourses
      .filter(c => (c.enrolledCount ?? 0) > 0)
      .slice(0, 7)
      .map(c => ({
        name: c.title.length > 12 ? c.title.slice(0, 12) + "…" : c.title,
        enrolled: c.enrolledCount ?? 0,
        lessons: c.totalLessons ?? 0,
      }));

  const STAT_CARDS: StatCardProps[] = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      sub: `${stats.publishedCourses} published · ${stats.totalCourses - stats.publishedCourses} drafts`,
      icon: BookOpen,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
      trend: 12,
      loading: stats.loading,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      sub: `${stats.activeUsers} active accounts`,
      icon: Users,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-500",
      trend: 5,
      loading: stats.loading,
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      sub: `${stats.activeCategories} active categories`,
      icon: Layers,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      trend: 0,
      loading: stats.loading,
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      sub: `${stats.featuredCourses} featured courses`,
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      trend: 33,
      loading: stats.loading,
    },
  ];

  return (
      <div className="space-y-6">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {greeting} <span>{emoji}</span>
            </h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Here's what's happening with your e-learning platform today.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/50 flex items-center gap-1">
              <Calendar className="size-3" />
              {dateStr}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
              <BarChart2 className="size-3.5" />
              Analytics
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-[12px]">
              <Plus className="size-3.5" />
              New Course
            </Button>
          </div>
        </div>

        {/* ── KPI cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {STAT_CARDS.map(card => <StatCard key={card.title} {...card} />)}
        </div>

        {/* ── Charts row ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Courses by Category — bar chart (2/3) */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <SectionHeader
                icon={Activity}
                title="Courses by Category"
                description="Distribution of courses across categories"
                badge={`${stats.coursesByCategory.length} categories`}
            />
            <div className="mt-5">
              {stats.loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
                  </div>
              ) : stats.coursesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                        data={stats.coursesByCategory}
                        margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                        barSize={36}
                    >
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.04 }} />
                      <Bar dataKey="courses" fill="url(#barGrad)" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <EmptyState icon={BarChart2} title="No category data yet" sub="Create categories and courses to see distribution" />
              )}
            </div>
          </div>

          {/* Course Levels — donut (1/3) */}
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHeader
                icon={GraduationCap}
                title="Course Levels"
                description="Distribution by difficulty"
            />
            <div className="mt-4">
              {stats.loading ? (
                  <div className="flex justify-center mt-6"><Skeleton className="size-36 rounded-full" /></div>
              ) : stats.coursesByLevel.length > 0 ? (
                  <>
                    <div className="flex justify-center my-2">
                      <PieChart width={160} height={160}>
                        <Pie
                            data={stats.coursesByLevel}
                            cx={75} cy={75}
                            innerRadius={48} outerRadius={72}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                          {stats.coursesByLevel.map((_, i) => (
                              <Cell key={i} fill={LEVEL_COLORS[i % LEVEL_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </div>
                    <div className="space-y-3 mt-2">
                      {stats.coursesByLevel.map((entry, i) => {
                        const pct = stats.totalCourses > 0
                            ? Math.round((entry.value / stats.totalCourses) * 100) : 0;
                        return (
                            <div key={entry.name}>
                              <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="size-2 rounded-full shrink-0" style={{ background: LEVEL_COLORS[i % LEVEL_COLORS.length] }} />
                            {entry.name}
                          </span>
                                <span className="font-semibold text-foreground">{entry.value} ({pct}%)</span>
                              </div>
                              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%`, background: LEVEL_COLORS[i % LEVEL_COLORS.length] }}
                                />
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  </>
              ) : (
                  <EmptyState icon={GraduationCap} title="No level data" />
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom row ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent courses table (2/3) */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div>
                <p className="text-[13px] font-semibold text-foreground">Recent Courses</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Latest published content</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground">
                View all <ChevronRight className="size-3" />
              </Button>
            </div>

            <div className="divide-y divide-border/50">
              {stats.loading ? (
                  [...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <Skeleton className="size-8 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3 w-40" />
                          <Skeleton className="h-2.5 w-24" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                  ))
              ) : stats.recentCourses.length > 0 ? (
                  stats.recentCourses.slice(0, 5).map((course, i) => (
                      <div
                          key={i}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group"
                      >
                        {/* Course icon */}
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                          <BookOpen className="size-3.5 text-violet-500" strokeWidth={2} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">{course.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Users className="size-2.5" />
                        {course.enrolledCount ?? 0} enrolled
                      </span>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="flex items-center gap-1">
                        <FileText className="size-2.5" />
                              {course.totalLessons ?? 0} lessons
                      </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        course.isPublished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                    )}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                          <Button
                              variant="ghost" size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="size-3" />
                          </Button>
                        </div>
                      </div>
                  ))
              ) : (
                  <EmptyState icon={BookOpen} title="No courses yet" sub="Create your first course to get started" />
              )}
            </div>
          </div>

          {/* Platform health (1/3) */}
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHeader
                icon={Activity}
                title="Platform Health"
                description="Key metrics at a glance"
            />

            <div className="mt-5 space-y-5">
              {stats.loading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)
              ) : (
                  <>
                    {[
                      { label: "Published Rate",   value: publishedPct, color: "#6366f1" },
                      { label: "Active Users",      value: activePct,    color: "#0ea5e9" },
                      { label: "Active Categories", value: activeCatPct, color: "#f59e0b" },
                    ].map(item => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-bold text-foreground">{item.value}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${item.value}%`, background: item.color }}
                            />
                          </div>
                        </div>
                    ))}

                    {/* Summary pills */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/50">
                      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
                        <Star className="mx-auto mb-1 size-4 text-amber-500" />
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                          {stats.featuredCourses}
                        </p>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                          Featured
                        </p>
                      </div>
                      <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 p-3 text-center">
                        <TrendingUp className="mx-auto mb-1 size-4 text-violet-500" />
                        <p className="text-xl font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                          {stats.totalEnrollments}
                        </p>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                          Enrollments
                        </p>
                      </div>
                    </div>

                    {/* User role breakdown */}
                    {stats.usersByRole.length > 0 && (
                        <div className="pt-2 border-t border-border/50 space-y-2">
                          <p className="text-[11px] font-semibold text-foreground">Users by Role</p>
                          {stats.usersByRole.map((role, i) => (
                              <div key={role.name} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                              className="size-2 rounded-full shrink-0"
                              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          {role.name}
                        </span>
                                <span className="font-semibold text-foreground">{role.value}</span>
                              </div>
                          ))}
                        </div>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}