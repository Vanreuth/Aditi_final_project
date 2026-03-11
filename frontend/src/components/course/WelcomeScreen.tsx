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
      style={{ minHeight: "calc(100vh - 4rem)", background: "var(--cl-bg)" }}
    >
      <div className="text-center max-w-2xl w-full">

        {/* Hero icon */}
        <div className="relative mx-auto mb-6 inline-flex">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold"
            style={{
              background: "#2f8d46",
              boxShadow: "0 8px 28px rgba(47,141,70,0.28)",
              fontSize: "2.5rem",
            }}
          >
            {visual.icon}
          </div>
        </div>

        {/* Tag */}
        <div
          className="inline-block text-[10px] font-bold px-3 py-1 rounded tracking-widest uppercase mb-4"
          style={{
            background: "rgba(47,141,70,0.10)",
            color: "#2f8d46",
            border: "1px solid rgba(47,141,70,0.22)",
          }}
        >
          {visual.tag}
        </div>

        {/* Title */}
        <h2
          className="text-2xl lg:text-3xl font-bold mb-3 leading-tight"
          style={{
            color: "var(--cl-text-hi)",
            fontFamily: "'Outfit', var(--font-khmer), 'Noto Sans Khmer', sans-serif",
            letterSpacing: "-0.02em",
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium"
              style={{
                background: "var(--cl-bg-card)",
                border: "1px solid var(--cl-border)",
                color: "var(--cl-text)",
              }}
            >
              <span style={{ color: "#2f8d46" }}>{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        {allLessons.length > 0 && (
          <button
            onClick={onStartLearning}
            className="complete-btn inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "#2f8d46",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(47,141,70,0.30)",
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
