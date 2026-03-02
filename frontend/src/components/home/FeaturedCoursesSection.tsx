import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { featuredCourses, levelBadge } from "@/components/constants/home-data";

export function FeaturedCoursesSection() {
  return (
    <section className="container-app py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Badge className="mb-2 border-blue-200/60 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            <BookOpen className="mr-1.5 h-3 w-3" />
            ត្រៀមដើម្បីចាប់ផ្តើម
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
            Courses ដែល{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              ត្រូវការ
            </span>
          </h2>
        </div>
        <Link
          href="/courses"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/15 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          មើលទាំងអស់
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {featuredCourses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </section>
  );
}

type Course = (typeof featuredCourses)[number];

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href="/courses"
      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      {/* Thumbnail */}
      <div
        className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${course.bg} p-6`}
      >
        <span className="text-6xl drop-shadow-lg filter">{course.icon}</span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${levelBadge[course.level]}`}
        >
          {course.level}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <span className="mb-2 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {course.category}
        </span>
        <h3 className="mb-1.5 font-bold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {course.description}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
          <span>ចូចដើម្បីរៀន</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}