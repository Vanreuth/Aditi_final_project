"use client";

import Link from "next/link";
import { BookOpen, FileText, Lock, PlayCircle, Users } from "lucide-react";
import type { LessonResponse } from "@/types/lessonType";
import type { ChapterResponse } from "@/types/chapterType";

interface Visual {
  accent: string;
  accentMuted: string;
  accentRing: string;
  icon: string;
  tag: string;
}

interface CourseInfo {
  title: string;
  description?: string;
  totalLessons?: number;
  enrolledCount?: number;
}

interface WelcomeScreenProps {
  course: CourseInfo;
  visual: Visual;
  chapters: ChapterResponse[];
  allLessons: LessonResponse[];
  isAuthenticated: boolean;
  onStartLearning: () => void;
}

export function WelcomeScreen({
  course,
  visual,
  chapters,
  allLessons,
  isAuthenticated,
  onStartLearning,
}: WelcomeScreenProps) {
  return (
    <div
      className="flex items-center justify-center min-h-full p-8"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      <div className="text-center max-w-2xl w-full">
        {/* Hero icon with glow */}
        <div className="relative mx-auto mb-8 inline-flex">
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
            style={{ background: visual.accent, transform: "scale(1.3)" }}
          />
          <div
            className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: visual.accentMuted,
              border: `1px solid ${visual.accentRing}`,
              fontSize: "3rem",
            }}
          >
            {visual.icon}
          </div>
        </div>

        {/* Tag */}
        <div
          className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-widest"
          style={{
            background: visual.accentMuted,
            color: visual.accent,
            border: `1px solid ${visual.accentRing}`,
          }}
        >
          {visual.tag}
        </div>

        <h2
          className="text-2xl lg:text-3xl mb-3 leading-tight"
          style={{
            color: "var(--cl-text-hi)",
            fontFamily: "'DM Serif Display', Georgia, serif",
            letterSpacing: "-0.03em",
          }}
        >
          {course.title}
        </h2>

        {course.description && (
          <p
            className="text-sm leading-relaxed mb-8 max-w-md mx-auto"
            style={{ color: "var(--cl-text)" }}
          >
            {course.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
          {[
            { icon: <BookOpen className="h-3.5 w-3.5" />, label: `${chapters.length} Chapters` },
            { icon: <FileText className="h-3.5 w-3.5" />, label: `${course.totalLessons || 0} Lessons` },
            {
              icon: <Users className="h-3.5 w-3.5" />,
              label: `${(course.enrolledCount || 0).toLocaleString()} Students`,
            },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium"
              style={{
                background: "#0f0f17",
                border: "1px solid #1a1a2e",
                color: "#64748b",
              }}
            >
              <span style={{ color: visual.accent }}>{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        {allLessons.length > 0 && (
          <button
            onClick={onStartLearning}
            className="complete-btn inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-semibold"
            style={{
              background: visual.accent,
              color: "var(--cl-bg)",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 8px 24px ${visual.accent}40`,
            }}
          >
            <PlayCircle className="h-5 w-5" />
            Start Learning
          </button>
        )}

        {!isAuthenticated && (
          <p
            className="mt-5 flex items-center justify-center gap-1.5 text-xs"
            style={{ color: "var(--cl-text-ghost)" }}
          >
            <Lock className="h-3 w-3" />
            <Link
              href="/login"
              className="underline underline-offset-2 transition-colors hover:opacity-70"
              style={{ color: "var(--cl-text)" }}
            >
              Sign in
            </Link>{" "}
            to save your progress
          </p>
        )}
      </div>
    </div>
  );
}
