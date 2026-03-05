"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Layers,
  TrendingUp,
  Star,
  Eye,
  GraduationCap,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  Activity,
  BarChart3,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  color,
  bgGradient,
  loading,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
  description?: string;
  color: string;
  bgGradient: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-14 w-14 rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/60">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Course Status Badge ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; dot: string }> = {
    PUBLISHED: { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40", dot: "bg-emerald-500" },
    DRAFT: { color: "text-slate-600 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800", dot: "bg-slate-400" },
    ARCHIVED: { color: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-900/40", dot: "bg-red-500" },
  };
  const { color, bg, dot } = config[status] || config.DRAFT;
  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 text-xs font-medium gap-1.5`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { color: string; bg: string; icon: typeof Shield }> = {
    ADMIN: { color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-100 dark:bg-violet-900/40", icon: Shield },
    INSTRUCTOR: { color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/40", icon: GraduationCap },
    USER: { color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800", icon: Users },
  };
  const { color, bg, icon: RoleIcon } = config[role] || config.USER;
  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 gap-1 text-xs`}>
      <RoleIcon className="h-3 w-3" />
      {role}
    </Badge>
  );
}

// ─── Course Thumbnail ─────────────────────────────────────────────────────────

const GRADIENTS = [
  "from-violet-500 via-purple-500 to-indigo-600",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-pink-500 via-rose-500 to-red-500",
  "from-sky-500 via-blue-500 to-indigo-500",
];

// ─── Chart Custom Tooltip ─────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-4 py-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground mt-0.5">
        <span className="font-bold text-primary">{payload[0].value}</span> courses
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const stats = useDashboardStats();

  const now = new Date();
  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const publishedPct = stats.totalCourses > 0
    ? Math.round((stats.publishedCourses / stats.totalCourses) * 100)
    : 0;

  const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

  return (
    <div className="space-y-8">
      {/* ─── Welcome Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your e-learning platform today.
          </p>
          <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/courses">
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.totalCourses}
          description={`${stats.publishedCourses} published · ${stats.draftCourses} drafts`}
          color="#8b5cf6"
          bgGradient="from-violet-500 to-purple-600"
          loading={stats.loading}
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          description={`${stats.activeUsers} active accounts`}
          color="#3b82f6"
          bgGradient="from-blue-500 to-cyan-500"
          loading={stats.loading}
        />
        <StatCard
          icon={Layers}
          label="Categories"
          value={stats.totalCategories}
          description={`${stats.activeCategories} active categories`}
          color="#10b981"
          bgGradient="from-emerald-500 to-teal-500"
          loading={stats.loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Enrollments"
          value={stats.totalEnrollments}
          description={`${stats.featuredCourses} featured courses`}
          color="#f59e0b"
          bgGradient="from-amber-500 to-orange-500"
          loading={stats.loading}
        />
      </div>

      {/* ─── Charts Section ─────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course by Category — Bar Chart */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-primary" />
                  Courses by Category
                </CardTitle>
                <CardDescription>Distribution of courses across categories</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {stats.coursesByCategory.length} categories
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="h-[280px] flex items-center justify-center">
                <div className="space-y-3 w-full">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            ) : stats.coursesByCategory.length > 0 ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.coursesByCategory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="courses"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Layers className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No category data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Level — Pie Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-5 w-5 text-primary" />
              Course Levels
            </CardTitle>
            <CardDescription>Distribution by difficulty</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="h-[280px] flex items-center justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : stats.coursesByLevel.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.coursesByLevel}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.coursesByLevel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {stats.coursesByLevel.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="font-medium">{entry.name}</span>
                      </div>
                      <span className="text-muted-foreground font-semibold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No level data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Progress & Quick Stats ─────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Publishing Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Publishing Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Published Courses</span>
                    <span className="font-bold text-lg">{publishedPct}%</span>
                  </div>
                  <Progress value={publishedPct} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">{stats.publishedCourses}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                    <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{stats.draftCourses}</p>
                    <p className="text-xs text-muted-foreground">Drafts</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : stats.usersByRole.length > 0 ? (
              stats.usersByRole.map((role) => {
                const pct = stats.totalUsers > 0 ? Math.round((role.value / stats.totalUsers) * 100) : 0;
                return (
                  <div key={role.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: role.fill }} />
                        <span className="font-medium">{role.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {role.value} <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No user data</p>
            )}
          </CardContent>
        </Card>

        {/* Featured Courses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Featured Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentCourses
                  .filter((c) => c.featured || c.isFeatured)
                  .slice(0, 4)
                  .map((course) => {
                    const gradient = GRADIENTS[course.id % GRADIENTS.length];
                    return (
                      <div
                        key={course.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className={`h-9 w-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}
                          >
                            {course.title.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{course.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {(course.avgRating ?? 0).toFixed(1)}
                            <span className="mx-1">·</span>
                            {course.enrolledCount ?? 0} enrolled
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {stats.recentCourses.filter((c) => c.featured || c.isFeatured).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No featured courses yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Recent Activity ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Courses */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Courses
                </CardTitle>
                <CardDescription>Latest courses added to the platform</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/dashboard/courses">
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold text-xs">Course</TableHead>
                      <TableHead className="font-semibold text-xs">Category</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentCourses.map((course) => {
                      const gradient = GRADIENTS[course.id % GRADIENTS.length];
                      return (
                        <TableRow key={course.id} className="hover:bg-muted/30">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              {course.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div
                                  className={`h-9 w-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0 text-sm`}
                                >
                                  {course.title.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate max-w-[180px]">{course.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {course.totalLessons ?? 0} lessons · {(course.enrolledCount ?? 0).toLocaleString()} enrolled
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {course.categoryName ?? "—"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={course.status ?? "DRAFT"} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {stats.recentCourses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No courses found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recent Users
                </CardTitle>
                <CardDescription>Latest users registered on the platform</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/dashboard/users">
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-semibold text-xs">User</TableHead>
                      <TableHead className="font-semibold text-xs">Role</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/30">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                              <AvatarImage src={user.avatar || user.profilePicture || undefined} alt={user.username} />
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-medium text-xs">
                                {user.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{user.username}</p>
                              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {stats.recentUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Quick Actions ──────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
              <Link href="/dashboard/courses">
                <BookOpen className="h-6 w-6 text-violet-500" />
                <span className="font-medium">Manage Courses</span>
                <span className="text-xs text-muted-foreground">View & edit all courses</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
              <Link href="/dashboard/categories">
                <Layers className="h-6 w-6 text-emerald-500" />
                <span className="font-medium">Manage Categories</span>
                <span className="text-xs text-muted-foreground">Organize your content</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
              <Link href="/dashboard/users">
                <Users className="h-6 w-6 text-blue-500" />
                <span className="font-medium">Manage Users</span>
                <span className="text-xs text-muted-foreground">User accounts & roles</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-6 w-6 text-amber-500" />
                <span className="font-medium">View Analytics</span>
                <span className="text-xs text-muted-foreground">Insights & reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}