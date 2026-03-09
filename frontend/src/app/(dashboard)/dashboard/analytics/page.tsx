"use client";

import { useMemo, useState } from "react";
import {
  BarChart2, TrendingUp, Users, BookOpen, GraduationCap,
  ArrowUpRight, ArrowDownRight, Calendar, Activity,
  Layers, Eye, Download, RefreshCw, ChevronRight,
  Star, Clock, CheckCircle2, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

/* ─── Types ─────────────────────────────────────────────────────── */
type Range = "7d" | "30d" | "90d";

/* ─── Mock time-series data (replace with real API) ─────────────── */
const generateTimeSeries = (range: Range) => {
  const points = range === "7d" ? 7 : range === "30d" ? 30 : 12;
  const labels =
    range === "90d"
      ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(0, points)
      : Array.from({ length: points }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (points - 1 - i));
          return range === "7d"
            ? d.toLocaleDateString("en", { weekday: "short" })
            : d.toLocaleDateString("en", { month: "short", day: "numeric" });
        });

  return labels.map((label, i) => ({
    label,
    enrollments: Math.floor(20 + Math.random() * 80 + i * 2),
    users: Math.floor(5 + Math.random() * 30 + i),
    completions: Math.floor(3 + Math.random() * 20),
  }));
};

/* ─── Custom tooltip ─────────────────────────────────────────────── */
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

/* ─── KPI card ───────────────────────────────────────────────────── */
interface KpiProps {
  title: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: number;
  loading?: boolean;
}

function KpiCard({ title, value, sub, icon: Icon, iconBg, iconColor, trend, loading }: KpiProps) {
  if (loading)
    return (
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
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            trend > 0
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-500"
          )}
        >
          {trend > 0 ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────── */
function Section({
  icon: Icon, title, description, badge, action, children,
}: {
  icon: React.ElementType; title: string; description?: string;
  badge?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
            <Icon className="size-3.5 text-foreground" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground">{title}</p>
            {description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
            )}
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
      {children}
    </div>
  );
}

/* ─── Range toggle ───────────────────────────────────────────────── */
function RangeToggle({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const opts: { label: string; value: Range }[] = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-muted/60 p-0.5">
      {opts.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-150",
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
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
   Analytics Page
═══════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const stats = useDashboardStats();
  const [range, setRange] = useState<Range>("30d");

  const timeSeries = useMemo(() => generateTimeSeries(range), [range]);

  const LEVEL_COLORS = ["#10b981", "#f59e0b", "#ef4444"];
  const PIE_COLORS = ["#6366f1", "#0ea5e9", "#64748b", "#10b981"];

  const publishedPct =
    stats.totalCourses > 0
      ? Math.round((stats.publishedCourses / stats.totalCourses) * 100)
      : 0;
  const activePct =
    stats.totalUsers > 0
      ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
      : 0;

  const KPI_CARDS: KpiProps[] = [
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      sub: `Across ${stats.totalCourses} courses`,
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      trend: 33,
      loading: stats.loading,
    },
    {
      title: "Active Learners",
      value: stats.activeUsers,
      sub: `${activePct}% of total users`,
      icon: Users,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-500",
      trend: 8,
      loading: stats.loading,
    },
    {
      title: "Published Courses",
      value: stats.publishedCourses,
      sub: `${publishedPct}% publication rate`,
      icon: BookOpen,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
      trend: 12,
      loading: stats.loading,
    },
    {
      title: "Featured Courses",
      value: stats.featuredCourses,
      sub: "Highlighted on platform",
      icon: Star,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      trend: 0,
      loading: stats.loading,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Track performance, growth, and engagement across your platform.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/50 flex items-center gap-1">
            <Calendar className="size-3" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <Download className="size-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {KPI_CARDS.map((card) => (
          <KpiCard key={card.title} {...card} />
        ))}
      </div>

      {/* ── Enrollment trend (full width) ───────────────────── */}
      <Section
        icon={TrendingUp}
        title="Enrollment Trend"
        description="New enrollments and user signups over time"
        action={<RangeToggle value={range} onChange={setRange} />}
      >
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={timeSeries} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="gradEnroll" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            />
            <Area
              type="monotone" dataKey="enrollments" name="Enrollments"
              stroke="#6366f1" strokeWidth={2} fill="url(#gradEnroll)" dot={false}
            />
            <Area
              type="monotone" dataKey="users" name="New Users"
              stroke="#0ea5e9" strokeWidth={2} fill="url(#gradUsers)" dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      {/* ── Middle row: Category bar + Level donut ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Courses by Category — bar (2/3) */}
        <Section
          icon={Activity}
          title="Courses by Category"
          description="Distribution of content across categories"
          badge={`${stats.coursesByCategory.length} categories`}
        >
          {stats.loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : stats.coursesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={stats.coursesByCategory}
                margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                barSize={32}
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
        </Section>

        {/* Course Levels donut (1/3) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
              <GraduationCap className="size-3.5 text-foreground" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Course Levels</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Distribution by difficulty</p>
            </div>
          </div>

          {stats.loading ? (
            <div className="flex justify-center mt-6"><Skeleton className="size-36 rounded-full" /></div>
          ) : stats.coursesByLevel.length > 0 ? (
            <>
              <div className="flex justify-center">
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
              <div className="space-y-3 mt-3">
                {stats.coursesByLevel.map((entry, i) => {
                  const pct =
                    stats.totalCourses > 0
                      ? Math.round((entry.value / stats.totalCourses) * 100)
                      : 0;
                  return (
                    <div key={entry.name}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ background: LEVEL_COLORS[i % LEVEL_COLORS.length] }}
                          />
                          {entry.name}
                        </span>
                        <span className="font-semibold text-foreground">
                          {entry.value} ({pct}%)
                        </span>
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

      {/* ── Bottom row: Completions line + Users by Role + Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Completions line chart (2/3) */}
        <Section
          icon={CheckCircle2}
          title="Course Completions"
          description="Completions trend over selected period"
          action={<RangeToggle value={range} onChange={setRange} />}
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeSeries} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone" dataKey="completions" name="Completions"
                stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        {/* Users by Role + Platform health (1/3) */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5">

          {/* Users by Role */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                <Users className="size-3.5 text-foreground" strokeWidth={2} />
              </div>
              <p className="text-[13px] font-semibold text-foreground">Users by Role</p>
            </div>
            {stats.loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
              </div>
            ) : stats.usersByRole.length > 0 ? (
              <div className="space-y-3">
                {stats.usersByRole.map((role, i) => {
                  const pct = stats.totalUsers > 0
                    ? Math.round((role.value / stats.totalUsers) * 100) : 0;
                  return (
                    <div key={role.name}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          {role.name}
                        </span>
                        <span className="font-semibold text-foreground">
                          {role.value} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">No role data available.</p>
            )}
          </div>

          <div className="h-px bg-border/50" />

          {/* Platform health mini */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                <Activity className="size-3.5 text-foreground" strokeWidth={2} />
              </div>
              <p className="text-[13px] font-semibold text-foreground">Platform Health</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Published Rate", value: publishedPct, color: "#6366f1" },
                { label: "Active Users",   value: activePct,    color: "#0ea5e9" },
              ].map((item) => (
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
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Summary pills */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
              <TrendingUp className="mx-auto mb-1 size-4 text-emerald-500" />
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.totalEnrollments}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                Enrollments
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
              <Star className="mx-auto mb-1 size-4 text-amber-500" />
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {stats.featuredCourses}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                Featured
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}