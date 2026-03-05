"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Layers,
  GripVertical,
  Calendar,
  MoreHorizontal,
  Loader2,
  FileText,
  X,
  ChevronDown,
  ChevronRight,
  Code,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCourses } from "@/hooks/useCourses";
import { useChaptersByCourse, useChapterAdmin } from "@/hooks/useChapter";
import { useLessonsByChapter } from "@/hooks/useLesson";
import type { ChapterResponse, ChapterRequest } from "@/types/chapterType";
import type { LessonResponse } from "@/types/lessonType";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: typeof Layers;
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

// ─── Inline Lessons List for a chapter ────────────────────────────────────────

function ChapterLessons({ chapterId }: { chapterId: number }) {
  const { data, loading, error } = useLessonsByChapter(chapterId);
  const lessons: LessonResponse[] = data ?? [];

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">Failed to load lessons</div>;
  }

  if (lessons.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No lessons in this chapter yet</p>
        <Button variant="outline" size="sm" className="mt-2" asChild>
          <Link href="/dashboard/lessons">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Lesson
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      <div className="rounded-lg border bg-muted/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold h-8">#</TableHead>
              <TableHead className="text-[11px] font-semibold h-8">Lesson</TableHead>
              <TableHead className="text-[11px] font-semibold h-8 text-center">Content</TableHead>
              <TableHead className="text-[11px] font-semibold h-8">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((lesson) => (
                <TableRow key={lesson.id} className="hover:bg-muted/30">
                  <TableCell className="py-2">
                    <Badge variant="secondary" className="font-mono text-[10px] h-5">
                      {lesson.orderIndex}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-[10px]">
                        {lesson.title.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[200px]">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {lesson.content ? (
                        <Badge variant="outline" className="text-[10px] gap-1 h-5">
                          <Eye className="h-2.5 w-2.5" />
                          {lesson.content.length} chars
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                      {((lesson as any).codeSnippets?.length ?? 0) > 0 && (
                        <Badge variant="outline" className="text-[10px] gap-1 h-5">
                          <Code className="h-2.5 w-2.5" />
                          {(lesson as any).codeSnippets.length}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 flex justify-end">
        <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
          <Link href="/dashboard/lessons">
            Manage All Lessons
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChaptersPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterResponse | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<number | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formOrder, setFormOrder] = useState(0);

  // Hooks
  const { data: coursesData, loading: coursesLoading } = useCourses({ size: 100 });
  const { data: chaptersData, loading: chaptersLoading, refetch } = useChaptersByCourse(selectedCourseId);
  const { creating, updating, removing, create, update, remove } = useChapterAdmin();

  const courses = coursesData?.content ?? [];
  const chapters = chaptersData ?? [];

  // Filtered chapters
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase();
    return chapters.filter(ch => ch.title.toLowerCase().includes(q));
  }, [chapters, searchQuery]);

  // Stats
  const totalChapters = chapters.length;
  const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessonCount ?? ch.lessons?.length ?? 0), 0);

  // Toggle expand
  const toggleExpand = (chapterId: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  // ── Dialog handlers ─────────────────────────────────────────

  const openCreateDialog = () => {
    setEditingChapter(null);
    setFormTitle("");
    setFormOrder(chapters.length);
    setDialogOpen(true);
  };

  const openEditDialog = (chapter: ChapterResponse) => {
    setEditingChapter(chapter);
    setFormTitle(chapter.title);
    setFormOrder(chapter.orderIndex);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toast.error("Chapter title is required");
      return;
    }
    const payload: ChapterRequest = {
      title: formTitle.trim(),
      orderIndex: formOrder,
      courseId: selectedCourseId,
    };
    try {
      if (editingChapter) {
        await update(editingChapter.id, payload);
        toast.success("Chapter updated successfully");
      } else {
        await create(payload);
        toast.success("Chapter created successfully");
      }
      setDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteChapterId) return;
    const ok = await remove(deleteChapterId);
    if (ok) {
      toast.success("Chapter deleted successfully");
      refetch();
    } else {
      toast.error("Failed to delete chapter");
    }
    setDeleteChapterId(null);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chapters</h2>
          <p className="text-muted-foreground">
            Manage course chapters and view lessons within each chapter.
          </p>
        </div>
        <Button onClick={openCreateDialog} disabled={!selectedCourseId}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      {/* Course Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <Label className="text-sm text-muted-foreground mb-1.5 block">Select a Course</Label>
              <Select
                value={selectedCourseId ? String(selectedCourseId) : ""}
                onValueChange={(val) => {
                  setSelectedCourseId(Number(val));
                  setExpandedChapters(new Set());
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a course to manage chapters..." />
                </SelectTrigger>
                <SelectContent>
                  {coursesLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading courses...</div>
                  ) : courses.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No courses found</div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{course.title}</span>
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            {course.totalChapters ?? 0} ch
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedCourseId > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search chapters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[220px]"
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {selectedCourseId > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Layers} label="Total Chapters" value={totalChapters} color="from-violet-500 to-purple-600" loading={chaptersLoading} />
          <StatCard icon={FileText} label="Total Lessons" value={totalLessons} color="from-blue-500 to-cyan-500" loading={chaptersLoading} />
          <StatCard icon={BookOpen} label="Course Lessons" value={selectedCourse?.totalLessons ?? 0} color="from-emerald-500 to-teal-500" loading={chaptersLoading} />
        </div>
      )}

      {/* Chapters List */}
      {!selectedCourseId ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-3">
              <Layers className="h-16 w-16 mx-auto text-muted-foreground/30" />
              <h3 className="text-lg font-medium">Select a Course</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Choose a course from the dropdown above to view and manage its chapters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : chaptersLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-5 w-48 flex-1" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredChapters.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No chapters match your search" : "No chapters yet. Click \"Add Chapter\" to create one."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredChapters
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((chapter) => {
              const isExpanded = expandedChapters.has(chapter.id);
              return (
                <Collapsible key={chapter.id} open={isExpanded} onOpenChange={() => toggleExpand(chapter.id)}>
                  <Card className={`transition-all ${isExpanded ? "ring-1 ring-primary/20 shadow-md" : ""}`}>
                    {/* Chapter Header Row */}
                    <div className="flex items-center justify-between p-4">
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                            <Badge variant="secondary" className="font-mono text-xs">
                              {chapter.orderIndex}
                            </Badge>
                          </div>
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {chapter.title.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">{chapter.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {chapter.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {chapter.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs gap-1.5 mr-2">
                            <FileText className="h-3 w-3" />
                            {chapter.lessonCount || chapter.lessons?.length || 0} lesson{(chapter.lessonCount || chapter.lessons?.length || 0) !== 1 ? "s" : ""}
                          </Badge>
                          <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
                            {new Date(chapter.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(chapter)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteChapterId(chapter.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Expandable Lessons List */}
                    <CollapsibleContent>
                      <div className="border-t">
                        <ChapterLessons chapterId={chapter.id} />
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
        </div>
      )}

      {/* ─── Create / Edit Dialog ──────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingChapter ? "Edit Chapter" : "Add New Chapter"}
            </DialogTitle>
            <DialogDescription>
              {editingChapter
                ? "Update the chapter details below."
                : "Fill in the details to create a new chapter."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g., Getting Started"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Order Index</Label>
              <Input
                type="number"
                min={0}
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the course.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={creating || updating}>
              {(creating || updating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingChapter ? "Save Changes" : "Create Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ───────────────────────────────── */}
      <AlertDialog open={!!deleteChapterId} onOpenChange={(o) => !o && setDeleteChapterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chapter? This will also remove all lessons within it. This action cannot be undone.
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
