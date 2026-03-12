"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/lib/api/courseService";
import { lessonProgressService } from "@/lib/api/lessonProgressService";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Menu, X } from "lucide-react";
import {
  useCourseWithChapters,
  useChaptersByCourse,
  useLessonsByCourse,
  courseKeys,
} from "@/hooks/useCourses";
import type { ChapterResponse } from "@/types/chapterType";
import type { LessonResponse } from "@/types/lessonType";
import { useCoursePdf } from "@/hooks/useCoursesPdf";
import { CourseSidebar } from "@/components/course/CourseSidebar";
import { LessonContent } from "@/components/course/LessonContent";
import { WelcomeScreen } from "@/components/course/WelcomeScreen";

// ── ADD 1: import useReadingTimer ─────────────────────────────────────────────
import { useReadingTimer } from "@/hooks/usereadingtimer";

// ─── Visual helper ────────────────────────────────────────────────────────────

// ─── Single GFG-inspired green theme ─────────────────────────────────────────
const GFG_ACCENT      = "#2f8d46";
const GFG_MUTED       = "rgba(47,141,70,0.10)";
const GFG_RING        = "rgba(47,141,70,0.22)";

function getCourseVisual(title: string): {
  accent: string;
  accentMuted: string;
  accentRing: string;
  icon: string;
  tag: string;
} {
  const t = title.toLowerCase();
  let icon = "📚";
  let tag  = "Course";

  if      (t.includes("html"))                              { icon = "🌐"; tag = "HTML";    }
  else if (t.includes("css"))                               { icon = "🎨"; tag = "CSS";     }
  else if (t.includes("javascript") || t.includes("js"))   { icon = "⚡"; tag = "JS";      }
  else if (t.includes("next"))                              { icon = "▲";  tag = "Next.js"; }
  else if (t.includes("react"))                             { icon = "⚛️"; tag = "React";   }
  else if (t.includes("spring") || t.includes("java"))     { icon = "☕"; tag = "Java";    }
  else if (t.includes("docker") || t.includes("devops"))   { icon = "🐳"; tag = "DevOps";  }
  else if (t.includes("python"))                            { icon = "🐍"; tag = "Python";  }

  // One consistent green accent for every course — GFG-inspired
  return { accent: GFG_ACCENT, accentMuted: GFG_MUTED, accentRing: GFG_RING, icon, tag };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function CourseDetailSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-72 shrink-0 flex flex-col border-r border-border bg-card">
        <div className="h-32 animate-pulse bg-muted" />
        <div className="p-3 space-y-2 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-11 w-full rounded-xl animate-pulse bg-muted" />
              {i < 2 &&
                Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 rounded-lg ml-5 animate-pulse bg-muted/60" style={{ width: "calc(100% - 1.25rem)" }} />
                ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-10 space-y-5">
        <div className="h-5 w-48 rounded-full animate-pulse bg-muted" />
        <div className="h-8 w-2/3 rounded-xl animate-pulse bg-muted" />
        <div className="h-4 w-full rounded animate-pulse bg-muted/60" />
        <div className="h-4 w-5/6 rounded animate-pulse bg-muted/60" />
        <div className="h-56 w-full rounded-2xl mt-4 animate-pulse bg-muted" />
      </div>
    </div>
  );
}

// ─── Content processing ──────────────────────────────────────────────────────

function processLessonContent(raw?: string | null): string {
  if (!raw || !raw.trim()) return "";
  const trimmed = raw.trim();

  // Already HTML — return as-is (backward compat with old HTML-stored content)
  if (/<(?:p|div|br|h[1-6]|ul|ol|li|table|blockquote|pre|section|article)[/\s>]/i.test(trimmed)) {
    return trimmed;
  }

  // ── Step 1: protect fenced code blocks ──────────────────────────────────
  const codeBlocks: string[] = [];
  let s = trimmed.replace(/```(\w*)\r?\n?([\s\S]*?)```/g, (_m, lang, code) => {
    const safe = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    codeBlocks.push(
      `<pre><code class="language-${lang || "text"}">${safe.trim()}</code></pre>`
    );
    return `\x00BLK${codeBlocks.length - 1}\x00`;
  });

  // ── Step 2: inline formatting ────────────────────────────────────────────
  s = s
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^(?:---|\*\*\*|___) *$/gm, "<hr/>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

  // ── Step 3: block-level elements ─────────────────────────────────────────
  const html = s
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((blk) => {
      const t = blk.trim();
      if (!t) return "";
      if (/^\x00BLK\d+\x00$/.test(t)) return t; // placeholder
      if (/^<(?:h[1-6]|hr|ul|ol|blockquote|pre)/i.test(t)) return t; // already html
      // Blockquote
      if (/^> /m.test(t)) {
        const inner = t.replace(/^> /gm, "").replace(/\n/g, "<br/>");
        return `<blockquote>${inner}</blockquote>`;
      }
      // Unordered list
      if (/^[*\-+] /m.test(t)) {
        const items = t
          .split("\n")
          .filter((l) => /^[*\-+] /.test(l))
          .map((l) => `<li>${l.replace(/^[*\-+] /, "")}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      // Ordered list
      if (/^\d+\. /m.test(t)) {
        const items = t
          .split("\n")
          .filter((l) => /^\d+\. /.test(l))
          .map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      }
      // Paragraph
      return `<p>${t.split("\n").map((l) => l.trimEnd()).join("<br/>")}</p>`;
    })
    .join("\n");

  // ── Step 4: restore code blocks ──────────────────────────────────────────
  return codeBlocks.reduce(
    (acc, block, i) => acc.replace(`\x00BLK${i}\x00`, block),
    html
  );
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

function normalizeLessonSlug(value?: string | null) {
  if (!value) return "";
  return decodeURIComponent(value).replace(/\.asp$/i, "").trim().toLowerCase();
}

function toUrlSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u1780-\u17FF-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

function lessonPathSegment(slug?: string | null, title?: string | null): string {
  const raw = (title ? toUrlSlug(title) : null) || slug;
  const normalized = normalizeLessonSlug(raw);
  return normalized ? encodeURIComponent(normalized) : "";
}

function hasLessonPayload(lesson?: LessonResponse | null) {
  if (!lesson) return false;
  if (!Array.isArray(lesson.codeSnippets)) return false;
  return (
    (typeof lesson.content === "string" && lesson.content.trim().length > 0) ||
    lesson.codeSnippets.length > 0
  );
}

function findLessonIndex(lessons: LessonResponse[], lesson: LessonResponse | null): number {
  if (!lesson || lessons.length === 0) return -1;
  const id = Number(lesson.id);
  if (Number.isFinite(id)) {
    const byId = lessons.findIndex((l) => Number(l.id) === id);
    if (byId !== -1) return byId;
  }
  const n = normalizeLessonSlug(lesson.slug || lesson.title);
  if (!n) return -1;
  return lessons.findIndex((l) => normalizeLessonSlug(l.slug || l.title) === n);
}

const completedCache = new Map<string, number[]>();

function cacheKey(userId: number | string, slug: string) {
  return `completed-lessons:${userId}:${slug}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  courseSlug: string;
  initialLessonSlug?: string;
}
interface OpenLessonOptions {
  syncUrl?: boolean;
  history?: "push" | "replace";
}

export function CourseLearningContent({ courseSlug, initialLessonSlug }: Props) {
  const router = useRouter();
  const slug = courseSlug;
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const completedCacheKey = useMemo(
    () => (isAuthenticated && user?.id ? cacheKey(user.id, slug) : null),
    [isAuthenticated, user?.id, slug]
  );

  const { data: course, loading: courseLoading } = useCourseWithChapters(slug);
  const { data: pdfData, downloading: pdfDownloading, incrementDownload } = useCoursePdf(course?.id ?? 0);

  const handlePdfDownload = async () => {
    const result = await incrementDownload();
    const url = result?.fileUrl ?? pdfData?.fileUrl;
    if (url) window.open(url, "_blank");
  };

  const shouldFetchFallbackChapters = Boolean(course?.id) && !(course?.chapters?.length);
  const shouldFetchFallbackLessons =
    Boolean(course?.id) &&
    (!(course?.chapters?.length) ||
      (course?.chapters?.some((chapter) => !chapter.lessons?.length) ?? false));
  const { data: fallbackLessons, loading: lessonsByCourseLoading } = useLessonsByCourse(
    shouldFetchFallbackLessons ? (course?.id ?? null) : null
  );
  const { data: fallbackChapters, loading: chaptersByCourseLoading } = useChaptersByCourse(
    shouldFetchFallbackChapters ? (course?.id ?? null) : null
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [markingComplete, setMarkingComplete] = useState(false);

  useReadingTimer(selectedLesson?.id ?? 0);

  const requestRef = useRef(0);
  const normalizedInit = useMemo(
    () => normalizeLessonSlug(searchParams?.get("lesson") || initialLessonSlug),
    [initialLessonSlug, searchParams]
  );

  const persistCache = useCallback(
    (lessons: Set<number>) => {
      if (!completedCacheKey) return;
      const arr = [...lessons];
      completedCache.set(completedCacheKey, arr);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(completedCacheKey, JSON.stringify(arr));
      }
    },
    [completedCacheKey]
  );

  const markLocal = useCallback(
    (id: number) => {
      setCompletedLessons((prev) => {
        const next = new Set(prev);
        next.add(id);
        persistCache(next);
        return next;
      });
    },
    [persistCache]
  );

  const chapters = useMemo<ChapterResponse[]>(() => {
    const src = course?.chapters?.length ? course.chapters : fallbackChapters;
    const lessons = [...(fallbackLessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const byChapter = new Map<number, LessonResponse[]>();
    for (const l of lessons) {
      if (!byChapter.has(l.chapterId)) byChapter.set(l.chapterId, []);
      byChapter.get(l.chapterId)!.push(l);
    }
    if (src?.length) {
      return src
        .map((ch) => {
          const attached = ch.lessons?.length
            ? [...ch.lessons].sort((a, b) => a.orderIndex - b.orderIndex)
            : (byChapter.get(ch.id) ?? []);
          return { ...ch, lessons: attached, lessonCount: attached.length };
        })
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }
    if (!course || !fallbackLessons?.length) return [];
    return [
      {
        id: -1,
        title: "មេរៀនទាំងអស់",
        description: "",
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        courseId: course.id,
        courseTitle: course.title,
        lessonCount: lessons.length,
        lessons,
      },
    ];
  }, [course, fallbackChapters, fallbackLessons]);

  const isLoadingContent =
    Boolean(course) &&
    !course?.chapters?.length &&
    (chaptersByCourseLoading || lessonsByCourseLoading);

  const allLessons = useMemo(() => chapters.flatMap((c) => c.lessons || []), [chapters]);

  useEffect(() => {
    requestRef.current += 1;
    setExpandedChapters([]);
    setSelectedLesson(null);
    setLoadingLesson(false);
  }, [slug]);

  const loadLessonDetail = useCallback(
    async (lesson: LessonResponse): Promise<LessonResponse> => {
      if (!lesson.slug) return lesson;
      if (hasLessonPayload(lesson)) {
        queryClient.setQueryData(courseKeys.lesson(slug, lesson.slug), lesson);
        return lesson;
      }
      return queryClient.ensureQueryData({
        queryKey: courseKeys.lesson(slug, lesson.slug),
        queryFn: () => courseService.getLessonBySlug(slug, lesson.slug!),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient, slug]
  );

  const selectLesson = useCallback(
    async (lesson: LessonResponse) => {
      setSelectedLesson(lesson);
      if (!lesson.slug || hasLessonPayload(lesson)) return;
      const reqId = ++requestRef.current;
      setLoadingLesson(true);
      try {
        const full = await loadLessonDetail(lesson);
        if (requestRef.current === reqId) setSelectedLesson(full);
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        if (requestRef.current === reqId) setLoadingLesson(false);
      }
    },
    [loadLessonDetail]
  );

  const openLesson = useCallback(
    async (lesson: LessonResponse, options: OpenLessonOptions = {}) => {
      const { syncUrl = true, history = "push" } = options;
      if (syncUrl && typeof window !== "undefined") {
        const lessonPath = lessonPathSegment(lesson.slug, lesson.title);
        if (lessonPath) {
          const href = `/courses/${slug}/${lessonPath}`;
          const currentPath = window.location.pathname;
          if (currentPath !== href) {
            if (history === "replace") {
              router.replace(href, { scroll: false });
            } else {
              router.push(href, { scroll: false });
            }
          }
        }
      }
      await selectLesson(lesson);
    },
    [router, selectLesson, slug]
  );

  const lessonFromUrl = useMemo(() => {
    if (!normalizedInit) return undefined;
    return (
      allLessons.find((l) => normalizeLessonSlug(l.slug) === normalizedInit) ??
      allLessons.find((l) => normalizeLessonSlug(l.title) === normalizedInit) ??
      allLessons.find((l) => toUrlSlug(l.title) === normalizedInit)
    );
  }, [allLessons, normalizedInit]);

  useEffect(() => {
    if (!chapters.length || !allLessons.length || selectedLesson) return;
    const target = lessonFromUrl ?? allLessons[0];
    const shouldSyncUrl = Boolean(lessonFromUrl);
    void openLesson(target, { syncUrl: shouldSyncUrl, history: "replace" });
    if (!expandedChapters.length) {
      const chId = target.chapterId ?? target.courseId;
      setExpandedChapters(chapters.some((c) => c.id === chId) ? [chId] : [chapters[0].id]);
    }
  }, [allLessons, chapters, selectedLesson, openLesson, lessonFromUrl, expandedChapters.length]);

  useEffect(() => {
    if (!lessonFromUrl || !selectedLesson) return;
    const selectedSlug = normalizeLessonSlug(selectedLesson.slug || selectedLesson.title);
    const urlSlug = normalizeLessonSlug(lessonFromUrl.slug || lessonFromUrl.title);
    if (!selectedSlug || selectedSlug === urlSlug) return;
    void openLesson(lessonFromUrl, { syncUrl: false });
  }, [lessonFromUrl, openLesson, selectedLesson]);

  const currentIdx = useMemo(
    () => findLessonIndex(allLessons, selectedLesson),
    [allLessons, selectedLesson]
  );
  const canGoPrev = currentIdx > 0;
  const canGoNext = currentIdx !== -1 && currentIdx < allLessons.length - 1;
  const goPrev = () => canGoPrev && void openLesson(allLessons[currentIdx - 1]);
  const goNext = () => canGoNext && void openLesson(allLessons[currentIdx + 1]);

  useEffect(() => {
    if (currentIdx < 0) return;
    const neighbors = [allLessons[currentIdx - 1], allLessons[currentIdx + 1]];
    for (const neighbor of neighbors) {
      if (!neighbor?.slug || hasLessonPayload(neighbor)) continue;
      void queryClient.prefetchQuery({
        queryKey: courseKeys.lesson(slug, neighbor.slug),
        queryFn: () => courseService.getLessonBySlug(slug, neighbor.slug!),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [allLessons, currentIdx, queryClient, slug]);

  useEffect(() => {
    if (!completedCacheKey) return;
    const mem = completedCache.get(completedCacheKey);
    if (mem) {
      setCompletedLessons(new Set(mem));
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(completedCacheKey);
      if (raw) {
        const ids = (JSON.parse(raw) as unknown[]).filter(
          (v): v is number => typeof v === "number"
        );
        completedCache.set(completedCacheKey, ids);
        setCompletedLessons(new Set(ids));
      }
    } catch {}
  }, [completedCacheKey]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCompletedLessons(new Set());
      return;
    }
    lessonProgressService
      .getMine()
      .then((progress) => {
        const ids = progress
          .filter((p) => p.completed)
          .map((p) => p.lessonId)
          .filter((id): id is number => typeof id === "number");
        const s = new Set(ids);
        setCompletedLessons(s);
        persistCache(s);
      })
      .catch(() => {});
  }, [isAuthenticated, persistCache]);

  const handleMarkComplete = async () => {
    if (!selectedLesson) return;
    if (!isAuthenticated) {
      toast.info("សូមចូលប្រើប្រាស់ដើម្បីរក្សាទុកវឌ្ឍនភាព", { duration: 2000 });
      setTimeout(
        () => router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`),
        1500
      );
      return;
    }
    setMarkingComplete(true);
    try {
      await lessonProgressService.markCompleted(selectedLesson.id);
      markLocal(selectedLesson.id);
      toast.success("បានបញ្ចប់មេរៀន!", { description: selectedLesson.title });
      if (canGoNext) setTimeout(goNext, 500);
    } catch {
      markLocal(selectedLesson.id);
      toast.success("បានបញ្ចប់មេរៀន!", {
        description: `${selectedLesson.title} (ក្នុង device)`,
      });
      if (canGoNext) setTimeout(goNext, 500);
    } finally {
      setMarkingComplete(false);
    }
  };

  const completedCount = useMemo(
    () => allLessons.filter((l) => completedLessons.has(l.id)).length,
    [allLessons, completedLessons]
  );
  const progressPct =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const visual = getCourseVisual(course?.title ?? "");
  const prevLesson = canGoPrev ? allLessons[currentIdx - 1] : null;
  const nextLesson = canGoNext ? allLessons[currentIdx + 1] : null;

  const handleLessonClick = useCallback(
    (lesson: LessonResponse, e: React.MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      void openLesson(lesson, { syncUrl: true, history: "push" });
    },
    [openLesson]
  );

  // ─── Guards ───────────────────────────────────────────────────────────────

  if (courseLoading) return <CourseDetailSkeleton />;

  if (!course)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center min-h-screen bg-background">
        <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 bg-muted border border-border">
          <BookOpen className="h-9 w-9 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">រកមិនឃើញវគ្គសិក្សា</h2>
        <p className="mt-2 text-sm text-muted-foreground">វគ្គសិក្សានេះមិនមានក្នុងប្រព័ន្ធទេ</p>
        <Link
          href="/courses"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 bg-muted text-muted-foreground border border-border"
        >
          <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅវគ្គសិក្សា
        </Link>
      </div>
    );

  return (
    <div
      className="course-learning flex"
      style={{
        minHeight: "calc(100vh - 4rem)",
        background: "var(--cl-bg)",
        "--accent": visual.accent,
      } as React.CSSProperties}
    >
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile toggle ── */}
      <button
        className="fixed z-50 lg:hidden flex items-center justify-center rounded-full transition-all hover:scale-110"
        style={{
          top: "5rem",
          left: "0.75rem",
          width: 36,
          height: 36,
          background: "var(--cl-bg-raised)",
          border: `1px solid ${visual.accent}50`,
          color: visual.accent,
        }}
        onClick={() => setSidebarOpen((o) => !o)}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* ══════════════════════ SIDEBAR ══════════════════════ */}
      <aside
        className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed lg:sticky lg:top-0 lg:translate-x-0
          z-40 w-80 xl:w-96
          h-screen lg:h-[100dvh]
          flex flex-col
          transition-transform duration-300 ease-in-out
        `}
        style={{
          background: "var(--cl-bg-card)",
          borderRight: "1px solid var(--cl-border)",
        }}
      >
        <CourseSidebar
          course={course}
          visual={visual}
          sidebarOpen={sidebarOpen}
          chapters={chapters}
          allLessons={allLessons}
          selectedLesson={selectedLesson}
          expandedChapters={expandedChapters}
          completedLessons={completedLessons}
          isLoadingContent={isLoadingContent}
          isAuthenticated={isAuthenticated}
          completedCount={completedCount}
          progressPct={progressPct}
          hasPdf={Boolean(pdfData?.fileUrl)}
          pdfDownloading={pdfDownloading}
          onExpandToggle={(id) =>
            setExpandedChapters((p) =>
              p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
            )
          }
          onLessonClick={handleLessonClick}
          onPdfDownload={handlePdfDownload}
          lessonPathSegment={lessonPathSegment}
          slug={slug}
        />
      </aside>

      {/* ══════════════════════ MAIN CONTENT ══════════════════════ */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {selectedLesson ? (
          <LessonContent
            selectedLesson={selectedLesson}
            loadingLesson={loadingLesson}
            visual={visual}
            currentIdx={currentIdx}
            allLessonsCount={allLessons.length}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            completedLessons={completedLessons}
            markingComplete={markingComplete}
            isAuthenticated={isAuthenticated}
            onGoPrev={goPrev}
            onGoNext={goNext}
            onMarkComplete={handleMarkComplete}
            processContent={processLessonContent}
          />
        ) : (
          <WelcomeScreen
            course={course}
            visual={visual}
            chapters={chapters}
            allLessons={allLessons}
            isAuthenticated={isAuthenticated}
            onStartLearning={() =>
              void openLesson(allLessons[0], { syncUrl: true, history: "replace" })
            }
          />
        )}
      </main>
    </div>
  );
}