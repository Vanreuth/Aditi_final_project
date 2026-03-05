"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  BookOpen,
  Layers,
  GraduationCap,
  Download,
  Filter,
  Calendar,
  Eye,
  Star,
  Sparkles,
} from "lucide-react";
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
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  bgColor,
  loading,
}: {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: typeof BookOpen;
  color: string;
  bgColor: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {change && (
          <div className="flex items-center text-xs mt-1">
            {trend === "up" && <TrendingUp className="mr-1 h-3 w-3 text-green-600" />}
            {trend === "down" && <TrendingUp className="mr-1 h-3 w-3 text-red-600 rotate-180" />}
            <span className={trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"}>
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-4 py-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm text-muted-foreground mt-0.5">
          <span className="font-bold text-primary">{p.value}</span> {p.name}
        </p>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const stats = useDashboardStats();

  const publishedPct = stats.totalCourses > 0
    ? Math.round((stats.publishedCourses / stats.totalCourses) * 100)
    : 0;
  const activePct = stats.totalUsers > 0
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;
  const activeCatPct = stats.totalCategories > 0
    ? Math.round((stats.activeCategories / stats.totalCategories) * 100)
    : 0;

  const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#64748b", "#10b981"];
  const LEVEL_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  // Create enrollment data from courses
  const enrollmentData = stats.recentCourses
    .filter(c => (c.enrolledCount ?? 0) > 0)
    .slice(0, 8)
    .map(c => ({
      name: c.title.length > 15 ? c.title.slice(0, 15) + "…" : c.title,
      enrolled: c.enrolledCount ?? 0,
      lessons: c.totalLessons ?? 0,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Real-time insights from your e-learning platform data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Live Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Courses"
          value={stats.totalCourses}
          change={`${stats.publishedCourses} published`}
          trend="up"
          icon={BookOpen}
          color="text-violet-600"
          bgColor="bg-violet-50 dark:bg-violet-950/40"
          loading={stats.loading}
        />
        <MetricCard
          title="Total Users"
          value={stats.totalUsers}
          change={`${stats.activeUsers} active`}
          trend="up"
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-950/40"
          loading={stats.loading}
        />
        <MetricCard
          title="Total Enrollments"
          value={stats.totalEnrollments}
          change={`${stats.featuredCourses} featured courses`}
          trend="up"
          icon={Activity}
          color="text-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-950/40"
          loading={stats.loading}
        />
        <MetricCard
          title="Categories"
          value={stats.totalCategories}
          change={`${stats.activeCategories} active`}
          trend="neutral"
          icon={Layers}
          color="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/40"
          loading={stats.loading}
        />
      </div>

      {/* Analytics Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Courses by Category
                    </CardTitle>
                    <Badge variant="secondary">Live Data</Badge>
                  </div>
                  <CardDescription>Course distribution across content categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="space-y-3 w-full">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full rounded-lg" />
                        ))}
                      </div>
                    </div>
                  ) : stats.coursesByCategory.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.coursesByCategory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="courses" fill="url(#catBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                          <defs>
                            <linearGradient id="catBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">No category data available</p>
                        <p className="text-xs mt-1">Create categories and courses to see analytics</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Course Enrollment Overview
                    </CardTitle>
                    <Badge variant="secondary">Top Courses</Badge>
                  </div>
                  <CardDescription>Enrollment and lesson counts for top courses</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="space-y-3 w-full">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full rounded-lg" />
                        ))}
                      </div>
                    </div>
                  ) : enrollmentData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={enrollmentData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="enrolled"
                            stroke="#8b5cf6"
                            fill="url(#enrollGrad)"
                            strokeWidth={2}
                          />
                          <defs>
                            <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">No enrollment data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      User Role Distribution
                    </CardTitle>
                    <Badge variant="secondary">Real-time</Badge>
                  </div>
                  <CardDescription>Breakdown of users by role assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                  ) : stats.usersByRole.length > 0 ? (
                    <div className="h-[300px] flex items-center">
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.usersByRole}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                              stroke="none"
                            >
                              {stats.usersByRole.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-1/2 space-y-4 pl-4">
                        {stats.usersByRole.map((role, index) => {
                          const pct = stats.totalUsers > 0 ? Math.round((role.value / stats.totalUsers) * 100) : 0;
                          return (
                            <div key={role.name} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                  />
                                  <span className="font-medium">{role.name}</span>
                                </div>
                                <span className="text-muted-foreground">
                                  {role.value} ({pct}%)
                                </span>
                              </div>
                              <Progress value={pct} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">No user data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Course Level Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-5 w-5 text-primary" />
                Course Levels
              </CardTitle>
              <CardDescription>Difficulty distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : stats.coursesByLevel.length > 0 ? (
                <>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.coursesByLevel}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {stats.coursesByLevel.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index % LEVEL_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {stats.coursesByLevel.map((entry, index) => {
                      const pct = stats.totalCourses > 0 ? Math.round((entry.value / stats.totalCourses) * 100) : 0;
                      return (
                        <div key={entry.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: LEVEL_COLORS[index % LEVEL_COLORS.length] }}
                            />
                            <span className="font-medium">{entry.name}</span>
                          </div>
                          <span className="text-muted-foreground font-semibold">
                            {entry.value} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-primary" />
                Platform Health
              </CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Published Rate
                      </span>
                      <span className="font-bold">{publishedPct}%</span>
                    </div>
                    <Progress value={publishedPct} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Active Users
                      </span>
                      <span className="font-bold">{activePct}%</span>
                    </div>
                    <Progress value={activePct} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        Active Categories
                      </span>
                      <span className="font-bold">{activeCatPct}%</span>
                    </div>
                    <Progress value={activeCatPct} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <p className="text-xl font-bold text-amber-600">{stats.featuredCourses}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Featured</p>
                      </div>
                      <div className="text-center p-3 bg-violet-50 dark:bg-violet-950/30 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <p className="text-xl font-bold text-violet-600">{stats.totalEnrollments}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Enrollments</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
