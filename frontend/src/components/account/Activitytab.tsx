"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  CircleDot,
  Layers,
  TrendingUp,
  BarChart3,
  Timer,
  Trash2,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCompletedCount, useLessonProgressActions } from "@/hooks/useLessonProgress";
import type { LessonProgressResponse } from "@/types/lessonProgressType";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface ActivityTabProps {
  progressLoading: boolean;
  totalLessonsTracked: number;
  lessonsCompleted: number;
  distinctCourses: number;
  lessonsProgressPct: number;
  totalReadSeconds: number;
  progressByCourse: Record<string, LessonProgressResponse[]>;
}

// ─────────────────────────────────────────────────────────────
//  StatCard
// ─────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {loading ? (
          <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  GlobalCompletedStat — GET /me/completed-count
// ─────────────────────────────────────────────────────────────

function GlobalCompletedStat() {
  const { data: count, loading } = useCompletedCount();
  return (
    <StatCard
      loading={loading}
      label="បានបញ្ចប់"
      value={count ?? 0}
      icon={
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  LessonRow
//  Uses useLessonProgressActions — mutations ONLY, no per-row GET
// ─────────────────────────────────────────────────────────────

function LessonRow({ p }: { p: LessonProgressResponse }) {
  // ✅ useLessonProgressActions fires NO query — only registers mutations
  const {
    markCompleted,
    remove,
    isCompletePending,
    isRemovePending,
  } = useLessonProgressActions(p.lessonId);

  const scrollPct = p.scrollPct ?? 0;
  const readSec   = p.readTimeSeconds ?? 0;
  const readLabel =
    readSec >= 60 ? `${Math.round(readSec / 60)}m` : readSec > 0 ? `${readSec}s` : null;
  const dateStr = p.completedAt ?? p.createdAt;

  const handleMarkComplete = async () => {
    try {
      await markCompleted();
      toast.success("មេរៀនបានបញ្ចប់!");
    } catch {
      toast.error("មិនអាចធ្វើបច្ចុប្បន្នភាពវឌ្ឍនភាព");
    }
  };

  const handleDelete = async () => {
    try {
      await remove();
      toast.success("បានលុបវឌ្ឍនភាព");
    } catch {
      toast.error("មិនអាចលុបវឌ្ឍនភាព");
    }
  };

  return (
    <div className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
      {/* Status icon */}
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          p.completed
            ? "bg-emerald-100 dark:bg-emerald-900/30"
            : "bg-blue-100 dark:bg-blue-900/30"
        }`}
      >
        {p.completed ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <CircleDot className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm text-slate-900 dark:text-white leading-snug truncate">
            {p.lessonTitle ?? `មេរៀនទី ${p.lessonId}`}
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">
            {dateStr ? new Date(dateStr).toLocaleDateString("km-KH") : "--"}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-3 flex-wrap">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              p.completed
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            {p.completed ? "✓ បានបញ្ចប់" : "● កំពុងរៀន"}
          </span>

          {/* Scroll progress */}
          {scrollPct > 0 && scrollPct < 100 && (
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-400"
                  style={{ width: `${scrollPct}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{scrollPct}%</span>
            </div>
          )}

          {/* Read time */}
          {readLabel && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Timer className="h-3 w-3" />
              {readLabel}
            </span>
          )}

          {/* PDF badge */}
          {p.pdfDownloaded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              PDF
            </span>
          )}
        </div>
      </div>

      {/* ── Action buttons ──────────────────────────────────── */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">

        {/* Mark complete — POST /complete?lessonId=, only for incomplete */}
        {!p.completed && (
          <Button
            size="icon"
            variant="ghost"
            disabled={isCompletePending}
            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20"
            title="សម្គាល់ថាបានបញ្ចប់"
            onClick={handleMarkComplete}
          >
            {isCompletePending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <CheckCheck className="h-3.5 w-3.5" />
            }
          </Button>
        )}

        {/* Delete — requires confirm dialog, DELETE ?lessonId= */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={isRemovePending}
              className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
              title="លុបវឌ្ឍនភាព"
            >
              {isRemovePending
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />
              }
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>លុបវឌ្ឍនភាព?</AlertDialogTitle>
              <AlertDialogDescription>
                នេះនឹងលុបកំណត់ត្រាវឌ្ឍនភាពរបស់អ្នកសម្រាប់{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {p.lessonTitle ?? `មេរៀនទី ${p.lessonId}`}
                </span>
                ។ ដំណើរការនេះមិនអាចត្រឡប់វិញបានទេ។
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>បោះបង់</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700"
              >
                លុបវឌ្ឍនភាព
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CourseGroup
// ─────────────────────────────────────────────────────────────

function CourseGroup({
  courseTitle,
  lessons,
}: {
  courseTitle: string;
  lessons: LessonProgressResponse[];
}) {
  const doneCount = lessons.filter((l) => l.completed).length;
  const coursePct = Math.round((doneCount / lessons.length) * 100);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-blue-50 px-5 py-4 dark:border-slate-800 dark:from-violet-950/30 dark:to-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
            <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
              {courseTitle}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {doneCount}/{lessons.length} មេរៀន · {coursePct}%
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="h-1.5 w-24 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${coursePct}%` }}
            />
          </div>
          <span
            className={`text-xs font-semibold ${
              coursePct === 100 ? "text-emerald-600" : "text-violet-600"
            }`}
          >
            {coursePct}%
          </span>
        </div>
      </div>

      {/* Lessons */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {lessons.map((p) => (
          <LessonRow key={p.id ?? p.lessonId} p={p} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ReadTime stat in activity header
// ─────────────────────────────────────────────────────────────

function formatReadTime(seconds: number): string {
  if (seconds <= 0)    return "--";
  if (seconds >= 3600) return `${Math.round(seconds / 3600)}h`;
  if (seconds >= 60)   return `${Math.round(seconds / 60)}m`;
  return `${seconds}s`;
}

// ─────────────────────────────────────────────────────────────
//  Skeleton & empty state
// ─────────────────────────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <BookOpen className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-300">
          មិនទាន់មានសកម្មភាពនៅឡើយ
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          ចាប់ផ្តើមរៀនមេរៀនដំបូងរបស់អ្នក!
        </p>
      </div>
      <Link href="/courses">
        <Button className="gap-2 mt-1">
          <BookOpen className="h-4 w-4" />
          រុករកវគ្គសិក្សា
        </Button>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ActivityTab — main export
// ─────────────────────────────────────────────────────────────

export function ActivityTab({
  progressLoading,
  totalLessonsTracked,
  lessonsCompleted,
  distinctCourses,
  lessonsProgressPct,
  totalReadSeconds,
  progressByCourse,
}: ActivityTabProps) {
  return (
    <div className="space-y-6">

      {/* ── Summary Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          loading={progressLoading}
          label="មេរៀនសរុប"
          value={totalLessonsTracked}
          icon={
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          }
        />

        {/* Dedicated GET /me/completed-count — always accurate */}
        <GlobalCompletedStat />

        <StatCard
          loading={progressLoading}
          label="វគ្គសិក្សា"
          value={distinctCourses}
          icon={
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          }
        />
        <StatCard
          loading={progressLoading}
          label="ម៉ោងសិក្សា"
          value={progressLoading ? null : formatReadTime(totalReadSeconds)}
          icon={
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          }
        />
      </div>

      {/* ── Overall progress bar ──────────────────────────── */}
      {!progressLoading && totalLessonsTracked > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                វឌ្ឍនភាពសរុប
              </span>
            </div>
            <span className="text-sm font-semibold text-violet-600">
              {lessonsCompleted}/{totalLessonsTracked} មេរៀន
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${lessonsProgressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Hint ─────────────────────────────────────────── */}
      {!progressLoading && totalLessonsTracked > 0 && (
        <p className="text-xs text-muted-foreground px-1">
          💡 ចុចលើរូបតំណាង{" "}
          <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600">
            <CheckCheck className="inline h-3 w-3" /> បញ្ចប់
          </span>{" "}
          ឬ{" "}
          <span className="inline-flex items-center gap-0.5 font-medium text-rose-500">
            <Trash2 className="inline h-3 w-3" /> លុប
          </span>{" "}
          ដើម្បីគ្រប់គ្រងវឌ្ឍនភាពរបស់អ្នក — ត្រូវវាត់លើ (hover) លើមេរៀន។
        </p>
      )}

      {/* ── Course-grouped list ───────────────────────────── */}
      {progressLoading ? (
        <ActivitySkeleton />
      ) : Object.keys(progressByCourse).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(progressByCourse).map(([courseTitle, lessons]) => (
            <CourseGroup key={courseTitle} courseTitle={courseTitle} lessons={lessons} />
          ))}
        </div>
      ) : (
        <EmptyActivity />
      )}
    </div>
  );
}