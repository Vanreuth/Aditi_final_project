"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  ScrollText,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  BookOpen,
  Zap,
  Star,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LessonProgressResponse } from "@/types/lessonProgressType";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface UserShape {
  createdAt?: string;
  status?: string;
  roles?: string[];
  role?: string;
  loginAttempt?: number;
  login_attempt?: number;
}

export interface UserPerformanceCardProps {
  user: UserShape;
  progressData: LessonProgressResponse[] | null;
  loading: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function formatReadTime(sec: number): string {
  if (sec <= 0)    return "0s";
  if (sec >= 3600) return `${Math.round(sec / 3600)}h ${Math.round((sec % 3600) / 60)}m`;
  if (sec >= 60)   return `${Math.round(sec / 60)}m`;
  return `${sec}s`;
}

function daysBetween(a: Date, b: Date) {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / 86_400_000);
}

// ─────────────────────────────────────────────────────────────
//  Score engine
// ─────────────────────────────────────────────────────────────

interface Metric {
  key    : string;
  label  : string;
  value  : string;
  raw    : number;         // 0-100 normalised
  weight : number;         // weight in total score (all weights sum to 100)
  icon   : React.ReactNode;
  accent : string;
  bg     : string;
  status : "excellent" | "good" | "average" | "poor";
  tip    : string;
}

type Grade = "S" | "A" | "B" | "C" | "D" | "F";

interface PerformanceResult {
  totalScore   : number;
  grade        : Grade;
  gradeLabel   : string;
  gradeColor   : string;
  gradeBg      : string;
  gradeBorder  : string;
  summary      : string;
  metrics      : Metric[];
  // account health
  memberDays   : number;
  daysActive   : number;
  activityRate : number;   // daysActive / memberDays * 100
  currentStreak: number;
  longestStreak: number;
  isAccountActive: boolean;
  isAdmin      : boolean;
}

function computeStreaks(dates: Set<string>): { current: number; longest: number } {
  if (!dates.size) return { current: 0, longest: 0 };
  const sorted = [...dates].sort();
  let longest = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    if (daysBetween(prev, curr) === 1) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }

  // Current streak — count backwards from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = new Date(sorted[i]);
    d.setHours(0, 0, 0, 0);
    const diff = daysBetween(d, today) - current;
    if (diff === 0) { current++; }
    else break;
  }

  return { current, longest };
}

function compute(
  data: LessonProgressResponse[],
  user: UserShape,
): PerformanceResult {
  const total     = data.length;
  const completed = data.filter((p) => p.completed);
  const pdfItems  = data.filter((p) => p.pdfDownloaded);

  // ── Metric 1 · Completion Rate  (weight 35) ───────────────
  const completionRate  = total > 0 ? completed.length / total : 0;
  const completionRaw   = Math.round(completionRate * 100);
  const completionTip   =
    completionRate >= 0.9 ? "ល្អបំផុត! បន្តបំពេញមេរៀន" :
    completionRate >= 0.6 ? "ល្អ — ព្យាយាមបំពេញឱ្យបាន 90%" :
    completionRate >= 0.3 ? "ត្រូវការការខិតខំ — បំពេញមេរៀនដែលបានចាប់ផ្តើម" :
                            "ចាប់ផ្តើមមេរៀន ហើយព្យាយាមបញ្ចប់វា!";

  // ── Metric 2 · Avg Read Time / lesson  (weight 30) ────────
  const totalReadSec = data.reduce((s, p) => s + (p.readTimeSeconds ?? 0), 0);
  const avgReadSec   = total > 0 ? totalReadSec / total : 0;
  const readRaw      =
    avgReadSec >= 300 ? 100 :
    avgReadSec >= 180 ? 78  :
    avgReadSec >= 90  ? 55  :
    avgReadSec >= 30  ? 30  :
    avgReadSec > 0    ? 12  : 0;
  const readTip =
    avgReadSec >= 300 ? "ពិតជាចំណាយពេលអានដោយយកចិត្តទុកដាក់!" :
    avgReadSec >= 180 ? "ល្អ — អ្នកអាន 3 នាទីក្នុងមួយមេរៀន" :
    avgReadSec >= 30  ? "ព្យាយាមចំណាយពេលច្រើនជាងនេះក្នុងការអានមេរៀន" :
                        "ចំណាយពេលអានមេរៀនឱ្យបានច្រើន ដើម្បីរៀនបានល្អ";

  // ── Metric 3 · Avg Scroll Depth on completed  (weight 20) ─
  const avgScroll =
    completed.length > 0
      ? completed.reduce((s, p) => s + (p.scrollPct ?? 0), 0) / completed.length
      : 0;
  const scrollRaw = Math.round(avgScroll);
  const scrollTip =
    avgScroll >= 90 ? "ល្អណាស់ — អ្នកអានដល់ចុងក្រោយ!" :
    avgScroll >= 70 ? "ល្អ — ព្យាយាមអានឱ្យដល់ 100%" :
    avgScroll >= 40 ? "អ្នកឈប់នៅកណ្ដាល — បន្តអានឱ្យបានដល់ចុង" :
                      "ព្យាយាមអានមេរៀនឱ្យបានគ្រប់";

  // ── Metric 4 · PDF Engagement  (weight 15) ────────────────
  const pdfRate  = total > 0 ? pdfItems.length / total : 0;
  const pdfRaw   = Math.round(pdfRate * 100);
  const pdfTip   =
    pdfRate >= 0.5 ? "ល្អណាស់ — អ្នកទាញ PDF ដើម្បីទុកអានបន្ត" :
    pdfRate > 0    ? "ល្អ — PDF ជួយអ្នករៀនខាងក្រៅ" :
                     "សាកល្បងទាញ PDF ដើម្បីអានបន្ថែម";

  // ── Weighted total ─────────────────────────────────────────
  const totalScore = Math.min(
    100,
    Math.round(
      completionRaw * 0.35 +
      readRaw       * 0.30 +
      scrollRaw     * 0.20 +
      pdfRaw        * 0.15,
    ),
  );

  // ── Grade ─────────────────────────────────────────────────
  const grade: Grade =
    totalScore >= 90 ? "S" :
    totalScore >= 80 ? "A" :
    totalScore >= 65 ? "B" :
    totalScore >= 50 ? "C" :
    totalScore >= 30 ? "D" : "F";

  type GradeMeta = { label: string; color: string; bg: string; border: string; summary: string };
  const gradeMap: Record<Grade, GradeMeta> = {
    S: { label: "ឆ្នើម",         color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200 dark:border-violet-800", summary: "អ្នកជាអ្នករៀនដ៏ពូកែ! ការខិតខំប្រឹងប្រែងរបស់អ្នកគ្មានន័យ" },
    A: { label: "ល្អណាស់",       color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", summary: "ការខិតខំប្រឹងប្រែងរបស់អ្នកគ្រប់គ្រាន់ — បន្តទៅមុខ!" },
    B: { label: "ល្អ",            color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800",       summary: "ល្អ! បន្តទម្លាប់ ហើយព្យាយាមបំពេញមេរៀនឱ្យបានច្រើន" },
    C: { label: "មធ្យម",          color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800",     summary: "ការចូលរៀនល្អ ប៉ុន្តែត្រូវការការខិតខំបន្ថែមទៀត" },
    D: { label: "ត្រូវការកែ",     color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200 dark:border-orange-800",   summary: "ចាប់ផ្តើមរៀនជារៀងរាល់ថ្ងៃ ទោះបែបណាក៏ចំណេញ" },
    F: { label: "ទើបចាប់ផ្តើម",  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-950/30",       border: "border-rose-200 dark:border-rose-800",       summary: "ចូររៀនមេរៀនដំបូង! ដំណើររយពាន់ ចាប់ផ្តើមពីក្រ" },
  };

  const g = gradeMap[grade];

  // ── Metric objects ─────────────────────────────────────────
  function status(v: number, t: [number, number, number]): Metric["status"] {
    return v >= t[0] ? "excellent" : v >= t[1] ? "good" : v >= t[2] ? "average" : "poor";
  }

  const metrics: Metric[] = [
    {
      key    : "completion",
      label  : "អត្រាបញ្ចប់",
      value  : `${completionRaw}%`,
      raw    : completionRaw,
      weight : 35,
      icon   : <CheckCircle2 className="h-4 w-4" />,
      accent : "text-emerald-600 dark:text-emerald-400",
      bg     : "bg-emerald-100 dark:bg-emerald-900/30",
      status : status(completionRaw, [80, 60, 30]),
      tip    : completionTip,
    },
    {
      key    : "readtime",
      label  : "ពេលវេលាអាន",
      value  : formatReadTime(avgReadSec),
      raw    : readRaw,
      weight : 30,
      icon   : <Clock className="h-4 w-4" />,
      accent : "text-blue-600 dark:text-blue-400",
      bg     : "bg-blue-100 dark:bg-blue-900/30",
      status : status(readRaw, [78, 55, 30]),
      tip    : readTip,
    },
    {
      key    : "scroll",
      label  : "ការអានស៊ីជម្រៅ",
      value  : `${Math.round(avgScroll)}%`,
      raw    : scrollRaw,
      weight : 20,
      icon   : <ScrollText className="h-4 w-4" />,
      accent : "text-violet-600 dark:text-violet-400",
      bg     : "bg-violet-100 dark:bg-violet-900/30",
      status : status(scrollRaw, [90, 70, 40]),
      tip    : scrollTip,
    },
    {
      key    : "pdf",
      label  : "ការប្រើ PDF",
      value  : `${pdfRaw}%`,
      raw    : pdfRaw,
      weight : 15,
      icon   : <FileText className="h-4 w-4" />,
      accent : "text-amber-600 dark:text-amber-400",
      bg     : "bg-amber-100 dark:bg-amber-900/30",
      status : status(pdfRaw, [50, 25, 5]),
      tip    : pdfTip,
    },
  ];

  // ── Account / activity ─────────────────────────────────────
  const memberDays = user.createdAt
    ? Math.max(1, daysBetween(new Date(user.createdAt), new Date()))
    : 0;

  const activityDates = new Set(
    data
      .flatMap((p) => [p.completedAt, p.updatedAt, p.createdAt])
      .filter(Boolean)
      .map((d) => d!.slice(0, 10)),
  );
  const daysActive   = activityDates.size;
  const activityRate = memberDays > 0 ? Math.round((daysActive / memberDays) * 100) : 0;

  const { current: currentStreak, longest: longestStreak } = computeStreaks(activityDates);

  const isAccountActive =
    !user.status || user.status.toUpperCase() === "ACTIVE";
  const isAdmin =
    user.roles?.some((r) => r.includes("ADMIN")) ||
    user.role?.includes("ADMIN") ||
    false;

  return {
    totalScore, grade,
    gradeLabel: g.label, gradeColor: g.color, gradeBg: g.bg, gradeBorder: g.border,
    summary: g.summary,
    metrics,
    memberDays, daysActive, activityRate,
    currentStreak, longestStreak,
    isAccountActive, isAdmin,
  };
}

// ─────────────────────────────────────────────────────────────
//  Status badge colours
// ─────────────────────────────────────────────────────────────

const statusStyle: Record<Metric["status"], { bar: string; badge: string; badgeText: string }> = {
  excellent: { bar: "bg-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-900/30", badgeText: "text-emerald-700 dark:text-emerald-400" },
  good:      { bar: "bg-blue-500",    badge: "bg-blue-100 dark:bg-blue-900/30",       badgeText: "text-blue-700 dark:text-blue-400"       },
  average:   { bar: "bg-amber-500",   badge: "bg-amber-100 dark:bg-amber-900/30",     badgeText: "text-amber-700 dark:text-amber-400"     },
  poor:      { bar: "bg-rose-500",    badge: "bg-rose-100 dark:bg-rose-900/30",       badgeText: "text-rose-700 dark:text-rose-400"       },
};

const statusLabel: Record<Metric["status"], string> = {
  excellent: "ឆ្នើម", good: "ល្អ", average: "មធ្យម", poor: "ត្រូវកែ",
};

// ─────────────────────────────────────────────────────────────
//  Trend icon helper
// ─────────────────────────────────────────────────────────────

function TrendIcon({ s }: { s: Metric["status"] }) {
  if (s === "excellent" || s === "good")
    return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (s === "average")
    return <Minus className="h-3.5 w-3.5 text-amber-500" />;
  return <TrendingDown className="h-3.5 w-3.5 text-rose-500" />;
}

// ─────────────────────────────────────────────────────────────
//  Skeleton
// ─────────────────────────────────────────────────────────────

function PerformanceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 w-full rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-800" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 w-full rounded-2xl animate-pulse bg-slate-100 dark:bg-slate-800/60" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────

export function UserPerformanceCard({ user, progressData, loading }: UserPerformanceCardProps) {
  const result = useMemo(
    () => (progressData ? compute(progressData, user) : null),
    [progressData, user],
  );
  const loginAttempts = user.loginAttempt ?? user.login_attempt ?? 0;

  if (loading) return <PerformanceSkeleton />;
  if (!result || !progressData?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <TrendingUp className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="font-medium text-slate-600 dark:text-slate-400">
          មិនទាន់មានទិន្នន័យវឌ្ឍនភាព
        </p>
        <p className="text-sm text-muted-foreground">ចាប់ផ្តើមរៀននៅពេលដែលទិន្នន័យនឹងបង្ហាញ</p>
      </div>
    );
  }

  const {
    totalScore, grade, gradeLabel, gradeColor, gradeBg, gradeBorder, summary,
    metrics, memberDays, daysActive, activityRate, currentStreak, longestStreak,
    isAccountActive, isAdmin,
  } = result;

  // Score ring colour
  const ringColor =
    totalScore >= 90 ? "#7c3aed" :
    totalScore >= 80 ? "#059669" :
    totalScore >= 65 ? "#2563eb" :
    totalScore >= 50 ? "#d97706" :
    totalScore >= 30 ? "#ea580c" : "#e11d48";

  const circumference = 2 * Math.PI * 42; // r=42
  const dashOffset    = circumference * (1 - totalScore / 100);

  return (
    <div className="space-y-4">

      {/* ── Score hero card ─────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl border p-5 ${gradeBg} ${gradeBorder}`}>
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-20"
          style={{ background: ringColor }} />

        <div className="relative flex items-center gap-5">
          {/* SVG ring */}
          <div className="relative shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Track */}
              <circle cx="50" cy="50" r="42"
                fill="none" stroke="currentColor"
                strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
              {/* Progress */}
              <circle cx="50" cy="50" r="42"
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            {/* Grade letter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black leading-none ${gradeColor}`}>{grade}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{totalScore}pts</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xl font-bold ${gradeColor}`}>{gradeLabel}</span>
              {isAdmin && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                  Admin
                </Badge>
              )}
              <Badge className={`text-[10px] ${isAccountActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}`}>
                {isAccountActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-snug">
              {summary}
            </p>
            {/* Mini account stats */}
            <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {memberDays > 0 ? `${memberDays} ថ្ងៃ` : "--"} សមាជិក
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {daysActive} ថ្ងៃ សកម្ម
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                Streak {currentStreak} ថ្ងៃ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Per-metric rows ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" />
            សូចនាករលម្អិត
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-4">
          {metrics.map((m) => {
            const s = statusStyle[m.status];
            return (
              <div key={m.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.bg}`}>
                      <span className={m.accent}>{m.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none">
                        {m.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        weight {m.weight}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{m.value}</span>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.badge} ${s.badgeText}`}>
                      <TrendIcon s={m.status} />
                      {statusLabel[m.status]}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                    style={{ width: `${m.raw}%` }}
                  />
                </div>

                {/* Tip */}
                <p className="text-[11px] text-muted-foreground flex items-start gap-1 leading-snug">
                  <Info className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" />
                  {m.tip}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Activity & streak card ───────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            សកម្មភាព & Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">

          {/* Activity rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">អត្រាសកម្ម</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {daysActive}/{memberDays} ថ្ងៃ ({activityRate}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
                style={{ width: `${Math.min(activityRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Streak stats */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/20">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                  {currentStreak}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Streak បច្ចុប្បន្ន</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-3 dark:bg-violet-950/20">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Star className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                  {longestStreak}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Streak យូរបំផុត</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Account health card ──────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            សុខភាពគណនី
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-2">
          {[
            {
              label  : "ស្ថានភាពគណនី",
              ok     : isAccountActive,
              okText : "ACTIVE — ប្រើប្រាស់បានធម្មតា",
              badText: "INACTIVE — គណនីត្រូវបានបញ្ឈប់",
            },
            {
              label  : "ការចូលមិនបានសម្រេច",
              ok     : loginAttempts < 3,
              okText : `${loginAttempts}/5 ដង — គ្មានបញ្ហា`,
              badText: `${loginAttempts}/5 ដង — ប្រុងប្រយ័ត្ន`,
            },
            {
              label  : "ប្រភេទគណនី",
              ok     : true,
              okText : isAdmin ? "Administrator" : "Standard User",
              badText: "",
            },
            {
              label  : "ថ្ងៃចូលរៀន",
              ok     : true,
              okText : user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("km-KH", {
                    year: "numeric", month: "long", day: "numeric",
                  })
                : "--",
              badText: "",
            },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span
                className={`text-sm font-medium flex items-center gap-1 ${
                  !row.ok ? "text-rose-600" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {!row.ok && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
                {row.ok ? row.okText : row.badText}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
