"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronRight,
  Code,
  Edit,
  Eye,
  FileText,
  Layers,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false },
);

import { useCourses } from "@/hooks/useCourses";
import { useChaptersByCourse } from "@/hooks/useChapter";
import {
  useLessonAdmin,
  useLessonsByChapter,
  useLessonsByCourse,
} from "@/hooks/useLesson";
import { useSnippetAdmin, useSnippetsByLesson } from "@/hooks/useSnippetCode";
import type {
  CodeSnippetRequest,
  CodeSnippetResponse,
} from "@/types/codeSnippetType";
import type { LessonRequest, LessonResponse } from "@/types/lessonType";

type EditableSnippet = {
  clientId: string;
  id?: number;
  title: string;
  language: string;
  code: string;
  explanation: string;
  orderIndex: number;
};

function createSnippetDraft(orderIndex = 0): EditableSnippet {
  return {
    clientId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    language: "javascript",
    code: "",
    explanation: "",
    orderIndex,
  };
}

function toSnippetDraft(
  snippet: CodeSnippetResponse,
  index: number,
): EditableSnippet {
  return {
    clientId: `snippet-${snippet.id}`,
    id: snippet.id,
    title: snippet.title ?? "",
    language: snippet.language ?? "javascript",
    code: snippet.code ?? "",
    explanation: snippet.explanation ?? snippet.description ?? "",
    orderIndex: snippet.orderIndex ?? index,
  };
}

function hasSnippetContent(snippet: EditableSnippet) {
  return Boolean(
    snippet.title.trim() ||
      snippet.language.trim() ||
      snippet.code.trim() ||
      snippet.explanation.trim(),
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LessonsPage() {
  const { resolvedTheme } = useTheme();
  const colorMode = resolvedTheme === "dark" ? "dark" : "light";

  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [selectedChapterId, setSelectedChapterId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formOrder, setFormOrder] = useState(0);
  const [formChapterId, setFormChapterId] = useState<number>(0);
  const [snippetDrafts, setSnippetDrafts] = useState<EditableSnippet[] | null>(null);
  const [deletedSnippetIds, setDeletedSnippetIds] = useState<number[]>([]);

  const { data: coursesData, loading: coursesLoading } = useCourses({ size: 100 });
  const { data: chaptersData, loading: chaptersLoading } =
    useChaptersByCourse(selectedCourseId);
  const {
    data: lessonsByChapter,
    loading: lessonsLoading,
    refetch: refetchChapterLessons,
  } = useLessonsByChapter(selectedChapterId);
  const {
    data: allCourseLessons,
    loading: allLessonsLoading,
    refetch: refetchCourseLessons,
  } = useLessonsByCourse(selectedCourseId);
  const { creating, updating, removing, create, update, remove } =
    useLessonAdmin();
  const {
    data: lessonSnippets,
    loading: snippetsLoading,
    refetch: refetchSnippets,
  } = useSnippetsByLesson(editingLesson?.id ?? 0);
  const {
    creating: creatingSnippet,
    updating: updatingSnippet,
    removing: removingSnippet,
    create: createSnippet,
    update: updateSnippet,
    remove: removeSnippet,
  } = useSnippetAdmin();

  const courses = coursesData?.content ?? [];
  const chapters = chaptersData ?? [];
  const lessons = useMemo(
    () => (selectedChapterId > 0 ? lessonsByChapter ?? [] : allCourseLessons ?? []),
    [allCourseLessons, lessonsByChapter, selectedChapterId],
  );
  const isLoadingLessons =
    selectedChapterId > 0 ? lessonsLoading : allLessonsLoading;
  const isSaving =
    creating || updating || creatingSnippet || updatingSnippet || removingSnippet;
  const resolvedSnippetDrafts = useMemo(() => {
    if (!editingLesson) return [] as EditableSnippet[];

    const source =
      lessonSnippets ?? editingLesson.codeSnippets ?? editingLesson.snippets ?? [];

    return source.map((snippet, index) => toSnippetDraft(snippet, index));
  }, [editingLesson, lessonSnippets]);
  const currentSnippetDrafts = snippetDrafts ?? resolvedSnippetDrafts;

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;
    const query = searchQuery.toLowerCase();
    return lessons.filter((lesson) => lesson.title.toLowerCase().includes(query));
  }, [lessons, searchQuery]);

  const totalLessons = lessons.length;
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId);

  const resetEditorState = () => {
    setEditingLesson(null);
    setFormTitle("");
    setFormDescription("");
    setFormContent("");
    setFormOrder(0);
    setFormChapterId(0);
    setSnippetDrafts(null);
    setDeletedSnippetIds([]);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetEditorState();
    }
  };

  const refreshLessonViews = async () => {
    if (selectedCourseId > 0) {
      await refetchCourseLessons();
    }
    if (selectedChapterId > 0) {
      await refetchChapterLessons();
    }
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(Number(value));
    setSelectedChapterId(0);
    setSearchQuery("");
  };

  const openCreateDialog = () => {
    setEditingLesson(null);
    setFormTitle("");
    setFormDescription("");
    setFormContent("");
    setFormOrder(lessons.length);
    setFormChapterId(selectedChapterId > 0 ? selectedChapterId : (chapters[0]?.id ?? 0));
    setSnippetDrafts([createSnippetDraft(0)]);
    setDeletedSnippetIds([]);
    setDialogOpen(true);
  };

  const openEditDialog = (lesson: LessonResponse) => {
    setEditingLesson(lesson);
    setFormTitle(lesson.title);
    setFormDescription(lesson.description ?? "");
    setFormContent(lesson.content ?? lesson.content_raw ?? "");
    setFormOrder(lesson.orderIndex);
    setFormChapterId(lesson.chapterId);
    setSnippetDrafts(null);
    setDeletedSnippetIds([]);
    setDialogOpen(true);
  };

  const updateSnippetDraft = (
    clientId: string,
    field: keyof Omit<EditableSnippet, "clientId" | "id">,
    value: string | number,
  ) => {
    setSnippetDrafts((current) =>
      (current ?? currentSnippetDrafts).map((snippet) =>
        snippet.clientId === clientId ? { ...snippet, [field]: value } : snippet,
      ),
    );
  };

  const addSnippetDraft = () => {
    setSnippetDrafts((current) => {
      const base = current ?? currentSnippetDrafts;
      return [...base, createSnippetDraft(base.length)];
    });
  };

  const removeSnippetDraft = (clientId: string) => {
    setSnippetDrafts((current) => {
      const base = current ?? currentSnippetDrafts;
      const target = base.find((snippet) => snippet.clientId === clientId);
      if (!target) return base;

      if (target.id) {
        setDeletedSnippetIds((existing) =>
          existing.includes(target.id!) ? existing : [...existing, target.id!],
        );
      }

      return base.filter((snippet) => snippet.clientId !== clientId);
    });
  };

  const syncSnippets = async (lessonId: number, drafts: EditableSnippet[]) => {
    for (const snippetId of deletedSnippetIds) {
      const ok = await removeSnippet(snippetId);
      if (!ok) {
        throw new Error("Failed to delete code snippet");
      }
    }

    for (const [index, snippet] of drafts.entries()) {
      const payload: CodeSnippetRequest = {
        title: snippet.title.trim() || undefined,
        language: snippet.language.trim(),
        code: snippet.code,
        explanation: snippet.explanation.trim() || undefined,
        orderIndex: Number.isFinite(snippet.orderIndex) ? snippet.orderIndex : index,
        lessonId,
      };

      if (snippet.id) {
        await updateSnippet(snippet.id, payload);
      } else {
        await createSnippet(payload);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourseId && !editingLesson?.courseId) {
      toast.error("Please select a course");
      return;
    }

    if (!formTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    if (!formContent.trim()) {
      toast.error("Lesson content is required");
      return;
    }

    if (!formChapterId) {
      toast.error("Please select a chapter");
      return;
    }

    const preparedSnippets = currentSnippetDrafts
      .map((snippet, index) => ({
        ...snippet,
        title: snippet.title.trim(),
        language: snippet.language.trim(),
        explanation: snippet.explanation.trim(),
        orderIndex: Number.isFinite(snippet.orderIndex) ? snippet.orderIndex : index,
      }))
      .filter(hasSnippetContent);

    for (const [index, snippet] of preparedSnippets.entries()) {
      if (!snippet.language) {
        toast.error(`Snippet ${index + 1} needs a language`);
        return;
      }

      if (!snippet.code.trim()) {
        toast.error(`Snippet ${index + 1} needs code content`);
        return;
      }
    }

    const payload: LessonRequest = {
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      content: formContent,
      orderIndex: formOrder,
      chapterId: formChapterId,
      courseId: selectedCourseId || editingLesson?.courseId || 0,
    };

    try {
      const savedLesson = editingLesson
        ? await update(editingLesson.id, payload)
        : await create(payload);

      await syncSnippets(savedLesson.id, preparedSnippets);
      await refreshLessonViews();

      if (editingLesson) {
        await refetchSnippets();
        toast.success("Lesson updated successfully");
      } else {
        toast.success("Lesson created successfully");
      }

      handleDialogChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteLessonId) return;

    const ok = await remove(deleteLessonId);
    if (ok) {
      toast.success("Lesson deleted successfully");
      await refreshLessonViews();
    } else {
      toast.error("Failed to delete lesson");
    }
    setDeleteLessonId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lessons</h2>
          <p className="text-muted-foreground">
            Manage lesson content and attach code snippets in one editor.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          disabled={!selectedCourseId || chapters.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lesson
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[220px] flex-1">
              <Label className="mb-1.5 block text-sm text-muted-foreground">
                Course
              </Label>
              <Select
                value={selectedCourseId ? String(selectedCourseId) : ""}
                onValueChange={handleCourseChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {coursesLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading...
                    </div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          {course.title}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedCourseId > 0 && (
              <>
                <ChevronRight className="mb-2 h-4 w-4 text-muted-foreground" />
                <div className="min-w-[220px] flex-1">
                  <Label className="mb-1.5 block text-sm text-muted-foreground">
                    Chapter (optional)
                  </Label>
                  <Select
                    value={selectedChapterId ? String(selectedChapterId) : "all"}
                    onValueChange={(value) =>
                      setSelectedChapterId(value === "all" ? 0 : Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All chapters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chapters</SelectItem>
                      {chaptersLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                        chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={String(chapter.id)}>
                            <div className="flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                              {chapter.title}
                              <Badge variant="outline" className="ml-1.5 text-[10px]">
                                {chapter.lessonCount || chapter.lessons?.length || 0}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedCourseId > 0 && (
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCourseId > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={FileText}
            label="Total Lessons"
            value={totalLessons}
            color="from-violet-500 to-purple-600"
            loading={isLoadingLessons}
          />
          <StatCard
            icon={Layers}
            label="Chapters"
            value={chapters.length}
            color="from-blue-500 to-cyan-500"
            loading={chaptersLoading}
          />
          <StatCard
            icon={Code}
            label="Course Lessons"
            value={selectedCourse?.totalLessons ?? 0}
            color="from-emerald-500 to-teal-500"
            loading={isLoadingLessons}
          />
        </div>
      )}

      {!selectedCourseId ? (
        <Card>
          <CardContent className="py-16">
            <div className="space-y-3 text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">Select a Course</h3>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                Choose a course from the dropdown above to view and manage its lessons.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedChapter
                    ? `Lessons in "${selectedChapter.title}"`
                    : `All Lessons for "${selectedCourse?.title}"`}
                </CardTitle>
                <CardDescription>
                  {filteredLessons.length} lesson
                  {filteredLessons.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLessons ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-48 flex-1" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No lessons match your search"
                    : 'No lessons yet. Click "Add Lesson" to create one.'}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[70px] text-xs font-semibold">
                        Order
                      </TableHead>
                      <TableHead className="text-xs font-semibold">Title</TableHead>
                      <TableHead className="text-xs font-semibold">Chapter</TableHead>
                      <TableHead className="text-center text-xs font-semibold">
                        Content
                      </TableHead>
                      <TableHead className="text-xs font-semibold">Created</TableHead>
                      <TableHead className="w-[60px] text-right text-xs font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLessons
                      .slice()
                      .sort((left, right) => left.orderIndex - right.orderIndex)
                      .map((lesson) => {
                        const snippetCount =
                          lesson.codeSnippets?.length ?? lesson.snippets?.length ?? 0;

                        return (
                          <TableRow key={lesson.id} className="hover:bg-muted/30">
                            <TableCell>
                              <Badge variant="secondary" className="font-mono text-xs">
                                {lesson.orderIndex}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white">
                                  {lesson.title.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="max-w-[200px] truncate text-sm font-medium">
                                    {lesson.title}
                                  </p>
                                  {lesson.description && (
                                    <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {lesson.chapterTitle ?? `Ch ${lesson.chapterId}`}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {lesson.content ? (
                                  <Badge variant="secondary" className="gap-1 text-xs">
                                    <Eye className="h-3 w-3" />
                                    {lesson.content.length > 100
                                      ? `${Math.round(lesson.content.length / 100) * 100}+`
                                      : lesson.content.length} chars
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                                {snippetCount > 0 && (
                                  <Badge variant="outline" className="gap-1 text-xs">
                                    <Code className="h-3 w-3" />
                                    {snippetCount}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(lesson)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteLessonId(lesson.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "Update the lesson content and keep its code examples in sync."
                : "Create a lesson, write its content, and attach code snippets in one step."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Chapter</Label>
                <Select
                  value={formChapterId ? String(formChapterId) : ""}
                  onValueChange={(value) => setFormChapterId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={String(chapter.id)}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order Index</Label>
                <Input
                  type="number"
                  min={0}
                  value={formOrder}
                  onChange={(event) =>
                    setFormOrder(parseInt(event.target.value, 10) || 0)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g., Introduction to Variables"
                value={formTitle}
                onChange={(event) => setFormTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Short summary of what this lesson covers..."
                value={formDescription}
                onChange={(event) => setFormDescription(event.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <div data-color-mode={colorMode} className="rounded-md overflow-hidden">
                <MDEditor
                  value={formContent}
                  onChange={(val) => setFormContent(val ?? "")}
                  height={340}
                  preview="live"
                  visibleDragbar={false}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formContent.length} characters
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Code Snippets</p>
                    <Badge variant="secondary">{currentSnippetDrafts.length}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add examples, starter code, or exercises for this lesson.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSnippetDraft}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Snippet
                </Button>
              </div>

              {editingLesson && snippetsLoading ? (
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="space-y-3 rounded-xl border bg-background p-4">
                      <Skeleton className="h-5 w-24" />
                      <div className="grid gap-3 md:grid-cols-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ))}
                </div>
              ) : currentSnippetDrafts.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed bg-background/60 px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No snippets added yet.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {currentSnippetDrafts.map((snippet, index) => (
                    <div
                      key={snippet.clientId}
                      className="space-y-4 rounded-xl border bg-background p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Snippet {index + 1}</Badge>
                          <Badge variant="secondary">
                            {snippet.id ? "Saved" : "New"}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => removeSnippetDraft(snippet.clientId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_120px]">
                        <div className="space-y-2">
                          <Label>Snippet Title (optional)</Label>
                          <Input
                            placeholder="e.g., Basic example"
                            value={snippet.title}
                            onChange={(event) =>
                              updateSnippetDraft(snippet.clientId, "title", event.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Input
                            placeholder="javascript"
                            value={snippet.language}
                            onChange={(event) =>
                              updateSnippetDraft(
                                snippet.clientId,
                                "language",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Order</Label>
                          <Input
                            type="number"
                            min={0}
                            value={snippet.orderIndex}
                            onChange={(event) =>
                              updateSnippetDraft(
                                snippet.clientId,
                                "orderIndex",
                                parseInt(event.target.value, 10) || 0,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Explanation (optional)</Label>
                        <Textarea
                          placeholder="Explain what this snippet demonstrates..."
                          value={snippet.explanation}
                          onChange={(event) =>
                            updateSnippetDraft(
                              snippet.clientId,
                              "explanation",
                              event.target.value,
                            )
                          }
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Code</Label>
                        <Textarea
                          placeholder="Write the snippet code here..."
                          value={snippet.code}
                          onChange={(event) =>
                            updateSnippetDraft(snippet.clientId, "code", event.target.value)
                          }
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          {snippet.code.length} characters
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLesson ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteLessonId}
        onOpenChange={(open) => !open && setDeleteLessonId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This will also remove all
              code snippets within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={removing}
            >
              {removing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
