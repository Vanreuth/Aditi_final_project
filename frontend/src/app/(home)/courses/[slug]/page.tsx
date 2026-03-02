"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hook";
import { fetchLessonBySlug, markLessonComplete, getUserProgress } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Users,
  Loader2,
  FileText,
  Menu,
  X,
  Copy,
  CheckCheck,
  Code2,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCourseWithChaptersBySlug } from "@/hooks/use-api";
import type { LessonDto, CodeSnippetDto } from "@/lib/types";

// ─── Language colors for code snippets ────────────────────────────────────────

const languageColors: Record<string, { bg: string; text: string; label: string }> = {
  javascript: { bg: "bg-yellow-500", text: "text-black", label: "JavaScript" },
  js: { bg: "bg-yellow-500", text: "text-black", label: "JavaScript" },
  typescript: { bg: "bg-blue-600", text: "text-white", label: "TypeScript" },
  ts: { bg: "bg-blue-600", text: "text-white", label: "TypeScript" },
  jsx: { bg: "bg-cyan-500", text: "text-black", label: "JSX" },
  tsx: { bg: "bg-blue-500", text: "text-white", label: "TSX" },
  html: { bg: "bg-orange-500", text: "text-white", label: "HTML" },
  css: { bg: "bg-blue-400", text: "text-white", label: "CSS" },
  java: { bg: "bg-red-600", text: "text-white", label: "Java" },
  python: { bg: "bg-green-600", text: "text-white", label: "Python" },
  bash: { bg: "bg-gray-700", text: "text-white", label: "Bash" },
  shell: { bg: "bg-gray-700", text: "text-white", label: "Shell" },
  json: { bg: "bg-gray-600", text: "text-white", label: "JSON" },
  sql: { bg: "bg-indigo-600", text: "text-white", label: "SQL" },
  default: { bg: "bg-slate-600", text: "text-white", label: "Code" },
};

// ─── Visual helper ────────────────────────────────────────────────────────────

function getCourseVisual(title: string): { gradient: string; icon: string } {
  const t = title.toLowerCase();
  if (t.includes("html")) return { gradient: "from-orange-500 via-red-400 to-pink-500", icon: "🌐" };
  if (t.includes("css")) return { gradient: "from-blue-500 via-cyan-400 to-teal-400", icon: "🎨" };
  if (t.includes("javascript") || t.includes("js")) return { gradient: "from-yellow-400 via-amber-400 to-orange-400", icon: "⚡" };
  if (t.includes("next")) return { gradient: "from-slate-700 via-slate-600 to-slate-500", icon: "▲" };
  if (t.includes("react")) return { gradient: "from-sky-500 via-blue-400 to-indigo-500", icon: "⚛️" };
  if (t.includes("spring") || t.includes("java")) return { gradient: "from-green-500 via-emerald-400 to-teal-500", icon: "🍃" };
  if (t.includes("docker") || t.includes("devops")) return { gradient: "from-blue-600 via-blue-500 to-cyan-500", icon: "🐳" };
  if (t.includes("python")) return { gradient: "from-yellow-500 via-blue-500 to-blue-600", icon: "🐍" };
  return { gradient: "from-violet-500 via-purple-400 to-indigo-500", icon: "📚" };
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function CourseDetailSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="w-80 border-r p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex-1 p-8 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ─── Code Block Component ─────────────────────────────────────────────────────

function CodeBlock({ snippet }: { snippet: CodeSnippetDto }) {
  const [copied, setCopied] = useState(false);
  const lang = (snippet.language || "").toLowerCase();
  const langStyle = languageColors[lang] || languageColors.default;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          {snippet.title && (
            <span className="text-sm text-slate-400 font-medium">{snippet.title}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${langStyle.bg} ${langStyle.text}`}>
            {langStyle.label}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {copied ? (
              <CheckCheck className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code className="text-slate-100 font-mono whitespace-pre">{snippet.code}</code>
        </pre>
      </div>
      {/* Explanation */}
      {snippet.explanation && (
        <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-700">
          <p className="text-sm text-slate-400 flex items-start gap-2">
            <Code2 className="h-4 w-4 mt-0.5 shrink-0 text-violet-400" />
            {snippet.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Auth state
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const { data: course, loading: courseLoading } = useCourseWithChaptersBySlug(slug);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonDto | null>(null);
  const [loadingSelectedLesson, setLoadingSelectedLesson] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [markingComplete, setMarkingComplete] = useState(false);
  const lessonRequestRef = useRef(0);

  const chapters = useMemo(
    () =>
      (course?.chapters || [])
        .map((chapter) => ({
          ...chapter,
          lessons: [...(chapter.lessons || [])].sort((a, b) => a.orderIndex - b.orderIndex),
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [course?.chapters]
  );

  const selectLesson = useCallback(
    async (lesson: LessonDto) => {
      setSelectedLesson(lesson);

      if (!lesson.slug) return;

      const requestId = lessonRequestRef.current + 1;
      lessonRequestRef.current = requestId;
      setLoadingSelectedLesson(true);
      try {
        const fullLesson = await fetchLessonBySlug(slug, lesson.slug);
        if (lessonRequestRef.current === requestId) {
          setSelectedLesson(fullLesson);
        }
      } catch (error) {
        console.error("Failed to load lesson by slug:", error);
      } finally {
        if (lessonRequestRef.current === requestId) {
          setLoadingSelectedLesson(false);
        }
      }
    },
    [slug]
  );

  useEffect(() => {
    lessonRequestRef.current += 1;
    setExpandedChapters([]);
    setSelectedLesson(null);
    setLoadingSelectedLesson(false);
  }, [slug]);

  // Auto-expand first chapter and auto-select the first lesson
  useEffect(() => {
    if (chapters.length === 0) return;

    if (expandedChapters.length === 0) {
      setExpandedChapters([chapters[0].id]);
    }

    if (!selectedLesson) {
      const firstLesson = chapters[0].lessons?.[0];
      if (firstLesson) {
        selectLesson(firstLesson);
      }
    }
  }, [chapters, expandedChapters.length, selectedLesson, selectLesson]);

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // Get all lessons flat for navigation
  const allLessons = useMemo(
    () => chapters.flatMap((chapter) => chapter.lessons || []),
    [chapters]
  );
  const currentLessonIndex = selectedLesson
    ? allLessons.findIndex((l) => l.id === selectedLesson.id)
    : -1;

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      void selectLesson(allLessons[currentLessonIndex - 1]);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      void selectLesson(allLessons[currentLessonIndex + 1]);
    }
  };

  // Load user's progress when authenticated
  // Note: Progress tracking requires backend session auth - silently skip if unavailable
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getUserProgress(Number(user.id))
        .then((progress) => {
          const completed = new Set(
            progress.filter((p) => p.completed).map((p) => p.lessonId)
          );
          setCompletedLessons(completed);
        })
        .catch(() => {
          // Silently ignore - progress tracking not available without backend session
        });
    }
  }, [isAuthenticated, user?.id]);

  // Handle mark lesson complete
  const handleMarkComplete = async () => {
    if (!selectedLesson) return;

    // Check if authenticated - redirect to login if not
    if (!isAuthenticated) {
      toast.info("សូមចូលប្រើប្រាស់ដើម្បីរក្សាទុកវឌ្ឍនភាព", {
        description: "កំពុងបញ្ជូនទៅទំព័រចូលប្រើប្រាស់...",
        duration: 2000,
      });
      // Save current URL to redirect back after login
      const returnUrl = encodeURIComponent(window.location.pathname);
      setTimeout(() => {
        router.push(`/login?returnUrl=${returnUrl}`);
      }, 1500);
      return;
    }

    setMarkingComplete(true);
    try {
      await markLessonComplete(Number(user!.id), selectedLesson.id);
      setCompletedLessons((prev) => new Set([...prev, selectedLesson.id]));
      toast.success("បានបញ្ចប់មេរៀន!", {
        description: selectedLesson.title,
      });
      // Auto-advance to next lesson
      if (currentLessonIndex < allLessons.length - 1) {
        setTimeout(() => goToNextLesson(), 500);
      }
    } catch {
      // Mark locally even if backend fails (session auth issue)
      setCompletedLessons((prev) => new Set([...prev, selectedLesson.id]));
      toast.success("បានបញ្ចប់មេរៀន!", {
        description: `${selectedLesson.title} (ស្ថានភាពមិនបានរក្សាទុក)`,
      });
      // Auto-advance to next lesson
      if (currentLessonIndex < allLessons.length - 1) {
        setTimeout(() => goToNextLesson(), 500);
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = allLessons.length > 0
    ? Math.round((completedLessons.size / allLessons.length) * 100)
    : 0;

  if (courseLoading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <BookOpen className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">រកមិនឃើញវគ្គសិក្សា</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">វគ្គសិក្សានេះមិនមានក្នុងប្រព័ន្ធទេ</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ត្រឡប់ទៅវគ្គសិក្សា
          </Link>
        </Button>
      </div>
    );
  }

  const { gradient, icon } = getCourseVisual(course.title);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] -mx-4 -mt-7 -mb-12 sm:-mx-6 lg:-mx-8 bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Toggle for Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-24 left-4 z-50 lg:hidden bg-white dark:bg-slate-800 shadow-lg rounded-full"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-40 w-80 h-[calc(100vh-8rem)] lg:h-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 rounded-l-2xl lg:rounded-2xl shadow-xl lg:shadow-none`}
      >
        {/* Course Header */}
        <div className={`bg-gradient-to-br ${gradient} p-4 text-white`}>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            វគ្គសិក្សាទាំងអស់
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">{course.title}</h1>
              <p className="text-xs text-white/70 mt-1">{chapters.length} ជំពូក · {course.totalLessons || 0} មេរៀន</p>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chapters.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              មិនមានជំពូកសម្រាប់វគ្គនេះទេ
            </div>
          ) : (
            chapters.map((chapter) => {
              const isExpanded = expandedChapters.includes(chapter.id);
              const chapterLessons = chapter.lessons || [];

              return (
                <Collapsible key={chapter.id} open={isExpanded} onOpenChange={() => toggleChapter(chapter.id)}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {chapter.orderIndex}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">
                          {chapter.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {chapterLessons.length} មេរៀន
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-5 pl-4 border-l-2 border-violet-200 dark:border-violet-800 space-y-1 py-1">
                      {chapterLessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => void selectLesson(lesson)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition ${
                            selectedLesson?.id === lesson.id
                              ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {completedLessons.has(lesson.id) ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          ) : (
                            <FileText className="h-4 w-4 shrink-0" />
                          )}
                          <span className="text-sm line-clamp-1">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>

        {/* Progress Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>វឌ្ឍនភាព</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {!isAuthenticated && (
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <LogIn className="h-3 w-3" />
              ចូលប្រើដើម្បីរក្សាទុកវឌ្ឍនភាព
            </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white/50 dark:bg-slate-900/50 lg:rounded-2xl lg:ml-4 lg:shadow-xl">
        {selectedLesson ? (
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            {/* Lesson Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-medium">
                  {selectedLesson.chapterTitle}
                </span>
                <span>·</span>
                <span>មេរៀនទី {selectedLesson.orderIndex}</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                {selectedLesson.title}
              </h1>
              {selectedLesson.description && (
                <p className="mt-3 text-slate-600 dark:text-slate-400">{selectedLesson.description}</p>
              )}
              {loadingSelectedLesson && (
                <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  កំពុងផ្ទុកមាតិកាមេរៀន...
                </p>
              )}
            </div>

            {/* Lesson Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
              {selectedLesson.content ? (
                <div 
                  className="text-slate-700 dark:text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />
              ) : (
                <p className="text-slate-500 italic">មេរៀននេះមិនមានមាតិកាទេ។</p>
              )}
            </div>

            {/* Code Snippets */}
            {selectedLesson.codeSnippets && selectedLesson.codeSnippets.length > 0 && (
              <div className="space-y-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-violet-500" />
                  កូដឧទាហរណ៍
                </h2>
                {selectedLesson.codeSnippets
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((snippet) => (
                    <CodeBlock key={snippet.id} snippet={snippet} />
                  ))}
              </div>
            )}

            {/* Mark Complete & Navigation */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              {/* Mark Complete Button */}
              {selectedLesson && (
                <div className="flex justify-center">
                  {completedLessons.has(selectedLesson.id) ? (
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">បានបញ្ចប់មេរៀននេះ</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={markingComplete}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 h-auto"
                    >
                      {markingComplete ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                      {isAuthenticated ? "សម្គាល់ជាបានបញ្ចប់" : "ចូល & សម្គាល់ជាបានបញ្ចប់"}
                    </Button>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousLesson}
                  disabled={currentLessonIndex <= 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  មុន
                </Button>
                <span className="text-sm text-slate-500">
                  {currentLessonIndex + 1} / {allLessons.length}
                </span>
                <Button
                  onClick={goToNextLesson}
                  disabled={currentLessonIndex >= allLessons.length - 1}
                  className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  បន្ទាប់
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Welcome Screen */
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-5xl mb-6`}>
                {icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                សូមស្វាគមន៍មកកាន់ {course.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {course.description}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {chapters.length} ជំពូក
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {course.totalLessons || 0} មេរៀន
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {(course.enrolledCount || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                ↼ ជ្រើសរើសមេរៀនពីម៉ឺនុយខាងឆ្វេង ដើម្បីចាប់ផ្តើមរៀន
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
