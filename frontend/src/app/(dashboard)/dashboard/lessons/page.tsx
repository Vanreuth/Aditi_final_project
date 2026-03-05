"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Hash,
  Calendar,
  MoreHorizontal,
  Loader2,
  Code,
  Layers,
  X,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCourses } from "@/hooks/useCourses";
import { useChaptersByCourse } from "@/hooks/useChapter";
import { useLessonsByChapter, useLessonsByCourse, useLessonAdmin } from "@/hooks/useLesson";
import type { LessonResponse, LessonRequest } from "@/types/lessonType";

// ─── Stat Card ────────────────────────────────────────────────────────────────

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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LessonsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [selectedChapterId, setSelectedChapterId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formOrder, setFormOrder] = useState(0);
  const [formChapterId, setFormChapterId] = useState<number>(0);

  // Hooks
  const { data: coursesData, loading: coursesLoading } = useCourses({ size: 100 });
  const { data: chaptersData, loading: chaptersLoading } = useChaptersByCourse(selectedCourseId);
  const { data: lessonsByChapter, loading: lessonsLoading, refetch } = useLessonsByChapter(selectedChapterId);
  const { data: allCourseLessons, loading: allLessonsLoading } = useLessonsByCourse(selectedCourseId);
  const { creating, updating, removing, create, update, remove } = useLessonAdmin();

  const courses = coursesData?.content ?? [];
  const chapters = chaptersData ?? [];
  
  // If a specific chapter is selected, show those lessons. Otherwise show all course lessons.
  const lessons = selectedChapterId > 0 ? (lessonsByChapter ?? []) : (allCourseLessons ?? []);
  const isLoadingLessons = selectedChapterId > 0 ? lessonsLoading : allLessonsLoading;

  // Filtered
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;
    const q = searchQuery.toLowerCase();
    return lessons.filter(l => l.title.toLowerCase().includes(q));
  }, [lessons, searchQuery]);

  const totalLessons = lessons.length;

  // Reset chapter when course changes
  const handleCourseChange = (val: string) => {
    setSelectedCourseId(Number(val));
    setSelectedChapterId(0);
  };

  // ── Dialog handlers ─────────────────────────────────────────

  const openCreateDialog = () => {
    setEditingLesson(null);
    setFormTitle("");
    setFormDescription("");
    setFormContent("");
    setFormOrder(lessons.length);
    setFormChapterId(selectedChapterId > 0 ? selectedChapterId : (chapters[0]?.id ?? 0));
    setDialogOpen(true);
  };

  const openEditDialog = (lesson: LessonResponse) => {
    setEditingLesson(lesson);
    setFormTitle(lesson.title);
    setFormDescription(lesson.description ?? "");
    setFormContent(lesson.content ?? "");
    setFormOrder(lesson.orderIndex);
    setFormChapterId(lesson.chapterId);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
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

    const payload: LessonRequest = {
      title: formTitle.trim(),
      content: formContent,
      orderIndex: formOrder,
      chapterId: formChapterId,
    };

    try {
      if (editingLesson) {
        await update(editingLesson.id, payload);
        toast.success("Lesson updated successfully");
      } else {
        await create(payload);
        toast.success("Lesson created successfully");
      }
      setDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteLessonId) return;
    const ok = await remove(deleteLessonId);
    if (ok) {
      toast.success("Lesson deleted successfully");
      refetch();
    } else {
      toast.error("Failed to delete lesson");
    }
    setDeleteLessonId(null);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const selectedChapter = chapters.find(ch => ch.id === selectedChapterId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lessons</h2>
          <p className="text-muted-foreground">
            Manage course lessons and their content.
          </p>
        </div>
        <Button onClick={openCreateDialog} disabled={!selectedCourseId || chapters.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Cascading Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-4 flex-wrap">
            {/* Course Selector */}
            <div className="flex-1 min-w-[220px]">
              <Label className="text-sm text-muted-foreground mb-1.5 block">Course</Label>
              <Select
                value={selectedCourseId ? String(selectedCourseId) : ""}
                onValueChange={handleCourseChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {coursesLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                  ) : (
                    courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.title}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Filter */}
            {selectedCourseId > 0 && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground mb-2" />
                <div className="flex-1 min-w-[220px]">
                  <Label className="text-sm text-muted-foreground mb-1.5 block">Chapter (optional)</Label>
                  <Select
                    value={selectedChapterId ? String(selectedChapterId) : "all"}
                    onValueChange={(val) => setSelectedChapterId(val === "all" ? 0 : Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All chapters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chapters</SelectItem>
                      {chaptersLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                      ) : (
                        chapters.map((ch) => (
                          <SelectItem key={ch.id} value={String(ch.id)}>
                            <div className="flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                              {ch.title}
                              <Badge variant="outline" className="ml-1.5 text-[10px]">
                                {ch.lessonCount || ch.lessons?.length || 0}
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

            {/* Search */}
            {selectedCourseId > 0 && (
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
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

      {/* Lessons Table */}
      {!selectedCourseId ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-3">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <h3 className="text-lg font-medium">Select a Course</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
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
                  {filteredLessons.length} lesson{filteredLessons.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingLessons ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
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
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No lessons match your search"
                    : "No lessons yet. Click \"Add Lesson\" to create one."}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-[70px] font-semibold text-xs">Order</TableHead>
                      <TableHead className="font-semibold text-xs">Title</TableHead>
                      <TableHead className="font-semibold text-xs">Chapter</TableHead>
                      <TableHead className="font-semibold text-xs text-center">Content</TableHead>
                      <TableHead className="font-semibold text-xs">Created</TableHead>
                      <TableHead className="w-[60px] font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLessons
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((lesson) => (
                        <TableRow key={lesson.id} className="hover:bg-muted/30">
                          <TableCell>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {lesson.orderIndex}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                {lesson.title.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate max-w-[200px]">{lesson.title}</p>
                                {lesson.description && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
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
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Eye className="h-3 w-3" />
                                  {lesson.content.length > 100 ? `${Math.round(lesson.content.length / 100) * 100}+` : lesson.content.length} chars
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                              {((lesson as any).codeSnippets?.length ?? 0) > 0 && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Code className="h-3 w-3" />
                                  {(lesson as any).codeSnippets.length}
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
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteLessonId(lesson.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Create / Edit Dialog ──────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "Update the lesson details below."
                : "Fill in the details to create a new lesson."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Chapter Selector */}
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select
                value={formChapterId ? String(formChapterId) : ""}
                onValueChange={(val) => setFormChapterId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter..." />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((ch) => (
                    <SelectItem key={ch.id} value={String(ch.id)}>
                      {ch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g., Introduction to Variables"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of the lesson..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Write the lesson content here... (supports markdown)"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {formContent.length} characters
              </p>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label>Order Index</Label>
              <Input
                type="number"
                min={0}
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={creating || updating}>
              {(creating || updating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLesson ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ───────────────────────────────── */}
      <AlertDialog open={!!deleteLessonId} onOpenChange={(o) => !o && setDeleteLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This will also remove all code snippets within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
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
