"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Loader2,
  LogIn,
  PlayCircle,
  Trophy,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ChapterResponse } from "@/types/chapterType";
import type { LessonResponse } from "@/types/lessonType";

interface Visual {
  accent: string;
  accentMuted: string;
  accentRing: string;
  icon: string;
  tag: string;
}

interface CourseInfo {
  title: string;
  totalLessons?: number;
}

interface CourseSidebarProps {
  course: CourseInfo;
  visual: Visual;
  sidebarOpen: boolean;
  chapters: ChapterResponse[];
  allLessons: LessonResponse[];
  selectedLesson: LessonResponse | null;
  expandedChapters: number[];
  completedLessons: Set<number>;
  isLoadingContent: boolean;
  isAuthenticated: boolean;
  completedCount: number;
  progressPct: number;
  hasPdf: boolean;
  pdfDownloading: boolean;
  onExpandToggle: (chapterId: number) => void;
  onLessonClick: (lesson: LessonResponse, e: React.MouseEvent) => void;
  onPdfDownload: () => void;
  lessonPathSegment: (slug?: string | null, title?: string | null) => string;
  slug: string;
}

export function CourseSidebar({
  course,
  visual,
  chapters,
  allLessons,
  selectedLesson,
  expandedChapters,
  completedLessons,
  isLoadingContent,
  isAuthenticated,
  completedCount,
  progressPct,
  hasPdf,
  pdfDownloading,
  onExpandToggle,
  onLessonClick,
  onPdfDownload,
  lessonPathSegment,
  slug,
}: CourseSidebarProps) {
  return (
    <>
      {/* ── Course header ── */}
      <div
        className="shrink-0 p-5"
        style={{
          background: "var(--cl-bg-card)",
          borderBottom: "1px solid var(--cl-border)",
        }}
      >
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs mb-4 transition-opacity hover:opacity-70"
          style={{ color: "var(--cl-text)" }}
        >
          <ArrowLeft className="h-3 w-3" />
          <span>All Courses</span>
        </Link>

        {/* Course identity row */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
            style={{
              background: visual.accentMuted,
              border: `1px solid ${visual.accentRing}`,
              fontSize: "1.3rem",
            }}
          >
            {visual.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mb-1.5 uppercase tracking-widest"
              style={{
                background: visual.accentMuted,
                color: visual.accent,
                border: `1px solid ${visual.accentRing}`,
              }}
            >
              {visual.tag}
            </div>
            <h1
              className="font-semibold leading-snug line-clamp-2 text-sm"
              style={{ color: "var(--cl-text-hi)" }}
            >
              {course.title}
            </h1>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex items-center gap-4 text-[11px] mb-4"
          style={{ color: "var(--cl-text)" }}
        >
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {chapters.length} Chapters
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.totalLessons || 0} Lessons
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div
            className="flex justify-between text-[10px] mb-1.5"
            style={{ color: "var(--cl-text)" }}
          >
            <span>
              {completedCount}/{allLessons.length} complete
            </span>
            <span style={{ color: visual.accent, fontFamily: "'DM Mono', monospace" }}>
              {progressPct}%
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "var(--cl-bg-raised)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${visual.accent}cc, ${visual.accent})`,
                boxShadow: `0 0 8px ${visual.accent}60`,
              }}
            />
          </div>
        </div>

        {/* PDF download */}
        {hasPdf && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--cl-border)" }}>
            <button
              onClick={onPdfDownload}
              disabled={pdfDownloading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50 border border-border bg-card text-foreground"
            >
              {pdfDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              ទាញយក PDF
            </button>
          </div>
        )}
      </div>

      {/* ── Chapter / lesson list ── */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoadingContent ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="pulse-dot h-2 w-2 rounded-full" style={{ background: visual.accent }} />
            <p className="text-[11px]" style={{ color: "var(--cl-text)" }}>
              Loading content…
            </p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="h-7 w-7 mx-auto mb-2" style={{ color: "var(--cl-border-hi)" }} />
            <p className="text-xs" style={{ color: "var(--cl-text)" }}>
              No chapters found
            </p>
          </div>
        ) : (
          chapters.map((chapter) => {
            const isExp = expandedChapters.includes(chapter.id);
            const cLessons = chapter.lessons || [];
            const doneInChapter = cLessons.filter((l) => completedLessons.has(l.id)).length;
            const chapterAllDone = cLessons.length > 0 && doneInChapter === cLessons.length;
            const chapterPct = cLessons.length > 0 ? (doneInChapter / cLessons.length) * 100 : 0;

            return (
              <Collapsible
                key={chapter.id}
                open={isExp}
                onOpenChange={() => onExpandToggle(chapter.id)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={`chapter-trigger ${isExp ? "chapter-open" : ""} w-full flex items-center gap-3 px-4 py-3 text-left`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        background: chapterAllDone ? "#16a34a20" : visual.accentMuted,
                        border: `1px solid ${chapterAllDone ? "#16a34a50" : visual.accentRing}`,
                        color: chapterAllDone ? "#4ade80" : visual.accent,
                      }}
                    >
                      {chapterAllDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        chapter.orderIndex
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[11px] font-semibold line-clamp-1 leading-tight"
                        style={{ color: isExp ? "var(--cl-text-hi)" : "var(--cl-text-lo)" }}
                      >
                        {chapter.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="flex-1 h-0.5 rounded-full overflow-hidden"
                          style={{ background: "var(--cl-bg-raised)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${chapterPct}%`, background: visual.accent }}
                          />
                        </div>
                        <span
                          className="text-[9px] shrink-0"
                          style={{ color: "var(--cl-text-ghost)", fontFamily: "'DM Mono', monospace" }}
                        >
                          {doneInChapter}/{cLessons.length}
                        </span>
                      </div>
                    </div>

                    <ChevronDown
                      className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
                      style={{
                        color: "var(--cl-text-ghost)",
                        transform: isExp ? "rotate(0deg)" : "rotate(-90deg)",
                      }}
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="pb-1">
                    {cLessons.map((lesson, lIdx) => {
                      const isActive = selectedLesson?.id === lesson.id;
                      const isDone = completedLessons.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${slug}/${lessonPathSegment(lesson.slug, lesson.title)}`}
                          onClick={(e) => onLessonClick(lesson, e)}
                          className={`sidebar-lesson-item lesson-link ${isActive ? "lesson-active" : ""} flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-0.5`}
                          style={{
                            background: isActive ? `${visual.accent}18` : "transparent",
                            border: isActive
                              ? `1px solid ${visual.accentRing}`
                              : "1px solid transparent",
                            textDecoration: "none",
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{
                              background: isActive
                                ? visual.accent
                                : isDone
                                ? "#16a34a20"
                                : "var(--cl-bg-raised)",
                              border: isActive
                                ? "none"
                                : isDone
                                ? "1px solid #16a34a40"
                                : `1px solid var(--cl-border-hi)`,
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2
                                className="h-3 w-3"
                                style={{ color: isActive ? "var(--cl-bg)" : "#4ade80" }}
                              />
                            ) : isActive ? (
                              <PlayCircle
                                className="h-3 w-3"
                                style={{ color: "var(--cl-bg)" }}
                              />
                            ) : (
                              <span
                                style={{
                                  color: "var(--cl-text-ghost)",
                                  fontSize: "8px",
                                  fontFamily: "'DM Mono', monospace",
                                  fontWeight: 600,
                                }}
                              >
                                {lIdx + 1}
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[11px] leading-tight line-clamp-2 flex-1"
                            style={{
                              color: isActive ? visual.accent : isDone ? "#4ade80" : "var(--cl-text)",
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {lesson.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </div>

      {/* ── Sidebar footer ── */}
      <div
        className="shrink-0 px-4 py-3"
        style={{
          borderTop: "1px solid var(--cl-border)",
          background: "var(--cl-bg)",
        }}
      >
        {progressPct === 100 ? (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold"
            style={{ background: "#16a34a15", border: "1px solid #16a34a30", color: "#4ade80" }}
          >
            <Trophy className="h-4 w-4" />
            Course Completed! 🎉
          </div>
        ) : !isAuthenticated ? (
          <Link
            href={`/login?returnUrl=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.pathname : ""
            )}`}
            className="flex items-center gap-2 text-[11px] transition-opacity hover:opacity-70"
            style={{ color: "var(--cl-text)" }}
          >
            <LogIn className="h-3 w-3" />
            Sign in to save progress
          </Link>
        ) : null}
      </div>
    </>
  );
}
