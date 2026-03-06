"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  Loader2,
} from "lucide-react";
import { CodeSnippetTabs } from "@/components/course/CodeBlock";
import type { LessonResponse } from "@/types/lessonType";

interface Visual {
  accent: string;
  accentMuted: string;
  accentRing: string;
}

interface LessonContentProps {
  selectedLesson: LessonResponse;
  loadingLesson: boolean;
  visual: Visual;
  currentIdx: number;
  allLessonsCount: number;
  prevLesson: LessonResponse | null;
  nextLesson: LessonResponse | null;
  canGoPrev: boolean;
  canGoNext: boolean;
  completedLessons: Set<number>;
  markingComplete: boolean;
  isAuthenticated: boolean;
  onGoPrev: () => void;
  onGoNext: () => void;
  onMarkComplete: () => void;
  processContent: (raw?: string | null) => string;
}

function LessonSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-5">
      <div className="h-5 w-36 rounded-full animate-pulse bg-muted" />
      <div className="h-8 w-3/4 rounded-xl animate-pulse bg-muted" />
      <div className="space-y-3 pt-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded animate-pulse bg-muted/60"
            style={{ width: i % 3 === 2 ? "60%" : "100%" }}
          />
        ))}
      </div>
    </div>
  );
}

export function LessonContent({
  selectedLesson,
  loadingLesson,
  visual,
  currentIdx,
  allLessonsCount,
  prevLesson,
  nextLesson,
  canGoPrev,
  canGoNext,
  completedLessons,
  markingComplete,
  isAuthenticated,
  onGoPrev,
  onGoNext,
  onMarkComplete,
  processContent,
}: LessonContentProps) {
  return (
    <>
      {/* ── Sticky topbar ── */}
      <div
        className="sticky top-0 z-20 px-6 py-3 flex items-center gap-3"
        style={{
          background: "var(--cl-bg)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--cl-border)",
        }}
      >
        <div
          className="h-5 w-1 rounded-full shrink-0"
          style={{ background: visual.accent, boxShadow: `0 0 8px ${visual.accent}80` }}
        />
        <div className="flex items-center gap-2 text-xs min-w-0 flex-1">
          <span
            className="hidden sm:inline truncate"
            style={{ color: "var(--cl-text)", fontWeight: 500 }}
          >
            {selectedLesson.chapterTitle}
          </span>
          <ChevronRight className="h-3 w-3 shrink-0 hidden sm:block" style={{ color: "var(--cl-border-hi)" }} />
          <span className="truncate font-semibold" style={{ color: "var(--cl-text-hi)" }}>
            {selectedLesson.title}
          </span>
        </div>

        {loadingLesson && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Loader2 className="h-3 w-3 animate-spin" style={{ color: visual.accent }} />
            <span className="text-[10px]" style={{ color: "var(--cl-text)" }}>Loading…</span>
          </div>
        )}

        <div
          className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
          style={{
            background: "var(--cl-bg-raised)",
            color: "var(--cl-text)",
            fontFamily: "'DM Mono', monospace",
            border: "1px solid var(--cl-border-hi)",
          }}
        >
          {currentIdx >= 0 ? currentIdx + 1 : 0} / {allLessonsCount}
        </div>
      </div>

      {/* ── Lesson body ── */}
      {loadingLesson ? (
        <LessonSkeleton />
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-5 py-8 pb-16">
          {/* Lesson header */}
          <div
            className="rounded-2xl p-6 mb-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${visual.accentMuted}, rgba(255,255,255,0.02))`,
              border: `1px solid ${visual.accentRing}`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl"
              style={{ background: visual.accent, transform: "translate(30%, -30%)" }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: visual.accentMuted,
                    color: visual.accent,
                    border: `1px solid ${visual.accentRing}`,
                  }}
                >
                  {selectedLesson.chapterTitle}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: "var(--cl-text-ghost)", fontFamily: "'DM Mono', monospace" }}
                >
                  Lesson {selectedLesson.orderIndex}
                </span>
              </div>
              <h1
                className="text-xl lg:text-2xl leading-tight mb-1"
                style={{
                  color: "var(--cl-text-hi)",
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  letterSpacing: "-0.025em",
                }}
              >
                {selectedLesson.title}
              </h1>
              {selectedLesson.description && (
                <p
                  className="text-sm leading-relaxed mt-2 line-clamp-2"
                  style={{ color: "var(--cl-text)" }}
                >
                  {selectedLesson.description}
                </p>
              )}
            </div>
          </div>

          {/* Lesson content */}
          <div className="content-prose mb-10">
            {selectedLesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: processContent(selectedLesson.content) }} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "var(--cl-bg-raised)", border: "1px solid var(--cl-border-hi)" }}
                >
                  <FileText className="h-7 w-7" style={{ color: "var(--cl-text-ghost)" }} />
                </div>
                <p className="text-sm italic" style={{ color: "var(--cl-text-ghost)" }}>
                  No content for this lesson yet.
                </p>
              </div>
            )}
          </div>

          {/* Code snippets */}
          {selectedLesson.codeSnippets && selectedLesson.codeSnippets.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: visual.accentMuted,
                    border: `1px solid ${visual.accentRing}`,
                    color: visual.accent,
                  }}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Code Examples
                </div>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--cl-text-ghost)", fontFamily: "'DM Mono', monospace" }}
                >
                  {selectedLesson.codeSnippets.length} snippet
                  {selectedLesson.codeSnippets.length > 1 ? "s" : ""}
                </span>
              </div>
              <CodeSnippetTabs
                snippets={selectedLesson.codeSnippets.sort((a, b) => a.orderIndex - b.orderIndex)}
              />
            </div>
          )}

          {/* ── Bottom action bar ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--cl-bg-card)", border: "1px solid var(--cl-border)" }}
          >
            {/* Mark complete */}
            <div
              className="px-5 py-4 flex items-center justify-between gap-4"
              style={{ borderBottom: "1px solid var(--cl-border)" }}
            >
              {completedLessons.has(selectedLesson.id) ? (
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#16a34a20", border: "1px solid #16a34a40" }}
                  >
                    <CheckCircle2 className="h-4 w-4" style={{ color: "#4ade80" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                      Lesson completed
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--cl-text-ghost)" }}>
                      Great work! Keep going.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--cl-text)" }}>
                    Understood this lesson?
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--cl-text-ghost)" }}>
                    Mark it complete and continue
                  </p>
                </div>
              )}
              {!completedLessons.has(selectedLesson.id) && (
                <button
                  onClick={onMarkComplete}
                  disabled={markingComplete}
                  className="complete-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0"
                  style={{
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    cursor: markingComplete ? "not-allowed" : "pointer",
                    opacity: markingComplete ? 0.7 : 1,
                    boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                  }}
                >
                  {markingComplete ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {isAuthenticated ? "Mark Complete" : "Sign in & Mark"}
                </button>
              )}
            </div>

            {/* Prev / Next navigation */}
            <div className="grid grid-cols-2">
              <button
                onClick={onGoPrev}
                disabled={!canGoPrev}
                className="nav-btn flex items-center gap-3 px-5 py-4 text-left"
                style={{
                  background: "transparent",
                  border: "none",
                  borderRight: "1px solid var(--cl-border)",
                  cursor: canGoPrev ? "pointer" : "not-allowed",
                }}
              >
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--cl-bg-raised)", border: "1px solid var(--cl-border-hi)" }}
                >
                  <ChevronLeft className="h-4 w-4" style={{ color: "var(--cl-text)" }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[9px] uppercase tracking-widest mb-0.5"
                    style={{ color: "var(--cl-text-ghost)", fontFamily: "'DM Mono', monospace" }}
                  >
                    Previous
                  </p>
                  <p className="text-xs font-medium line-clamp-1" style={{ color: "var(--cl-text)" }}>
                    {prevLesson?.title ?? "—"}
                  </p>
                </div>
              </button>

              <button
                onClick={onGoNext}
                disabled={!canGoNext}
                className="nav-btn flex items-center gap-3 px-5 py-4 text-right justify-end"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: canGoNext ? "pointer" : "not-allowed",
                }}
              >
                <div className="min-w-0">
                  <p
                    className="text-[9px] uppercase tracking-widest mb-0.5"
                    style={{ color: "var(--cl-text-ghost)", fontFamily: "'DM Mono', monospace" }}
                  >
                    Next
                  </p>
                  <p
                    className="text-xs font-medium line-clamp-1"
                    style={{ color: canGoNext ? "var(--cl-text-lo)" : "var(--cl-text-ghost)" }}
                  >
                    {nextLesson?.title ?? "—"}
                  </p>
                </div>
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: canGoNext ? visual.accent : "var(--cl-bg-raised)",
                    boxShadow: canGoNext ? `0 0 12px ${visual.accent}50` : "none",
                  }}
                >
                  <ChevronRight
                    className="h-4 w-4"
                    style={{ color: canGoNext ? "var(--cl-bg)" : "var(--cl-text-ghost)" }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
