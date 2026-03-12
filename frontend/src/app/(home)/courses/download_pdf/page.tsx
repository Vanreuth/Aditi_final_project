"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { CoursePdfExportResponse } from "@/types/coursePDFType";
import { pdfService } from "@/lib/api/pdfService";
import { toast } from "sonner";
import { PdfCourseCard, type BusyAction, type LevelOption, normalizeLevel } from "@/components/course/PdfCourseCard";
import { PdfFilterBar } from "@/components/course/PdfFilterBar";

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function CourseDownloadPdfPage() {
  const [rows, setRows] = useState<CoursePdfExportResponse[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelOption>("All");
  const [busyByCourse, setBusyByCourse] = useState<Record<number, BusyAction | undefined>>({});

  const mergeRow = useCallback((row: CoursePdfExportResponse) => {
    setRows((prev) => prev.map((item) => (item.courseId === row.courseId ? { ...item, ...row } : item)));
  }, []);

  const ensurePdf = useCallback(async (courseId: number) => {
    const existing = rows.find((item) => item.courseId === courseId);
    if (existing?.pdfUrl ?? existing?.fileUrl) return existing;
    const generated = await pdfService.generate(courseId);
    mergeRow(generated);
    return generated;
  }, [rows, mergeRow]);

  const loadRows = useCallback(async () => {
    setLoadingRows(true);
    try {
      const data = await pdfService.getAll();
      setRows(data);
    } catch (error) {
      toast.error(toErrorMessage(error, "មិនអាចផ្ទុកបញ្ជី Course PDF"));
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }, []);

  useEffect(() => { void loadRows(); }, [loadRows]);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((row) => {
      const level = normalizeLevel(row.level);
      const matchesLevel = selectedLevel === "All" || level === selectedLevel;
      const matchesQuery = keyword.length === 0 || row.courseTitle.toLowerCase().includes(keyword);
      return matchesLevel && matchesQuery;
    });
  }, [rows, query, selectedLevel]);

  const setBusy = useCallback((courseId: number, action?: BusyAction) => {
    setBusyByCourse((prev) => {
      const next = { ...prev };
      if (!action) { delete next[courseId]; return next; }
      next[courseId] = action;
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async (courseId: number) => {
    setBusy(courseId, "generating");
    try {
      const generated = await pdfService.generate(courseId);
      mergeRow(generated);
      toast.success("បានបង្កើត PDF ជោគជ័យ");
    } catch (error) {
      toast.error(toErrorMessage(error, "បរាជ័យក្នុងការបង្កើត PDF"));
    } finally {
      setBusy(courseId);
    }
  }, [setBusy, mergeRow]);

  const handleDownload = useCallback(async (row: CoursePdfExportResponse) => {
    const courseId = row.courseId;
    setBusy(courseId, "downloading");
    try {
      const current = await ensurePdf(courseId);
      const downloadUrl = current?.pdfUrl ?? current?.fileUrl;
      if (!downloadUrl) { toast.error("មិនមាន URL សម្រាប់ទាញយក PDF"); return; }
      if (!(row.pdfUrl ?? row.fileUrl)) toast.success("បានបង្កើត PDF រួចរាល់, កំពុងទាញយក...");
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      try {
        const updated = await pdfService.incrementDownload(courseId);
        mergeRow(updated);
      } catch { /* Download already opened. */ }
    } catch (error) {
      toast.error(toErrorMessage(error, `មិនអាចទាញយក PDF សម្រាប់ ${row.courseTitle}`));
    } finally {
      setBusy(courseId);
    }
  }, [setBusy, ensurePdf, mergeRow]);

  const handleView = useCallback(async (row: CoursePdfExportResponse) => {
    const courseId = row.courseId;
    setBusy(courseId, "viewing");
    try {
      const current = await ensurePdf(courseId);
      const viewUrl = current?.pdfUrl ?? current?.fileUrl;
      if (!viewUrl) { toast.error("មិនមាន URL សម្រាប់មើល PDF"); return; }
      window.open(viewUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(toErrorMessage(error, `មិនអាចមើល PDF សម្រាប់ ${row.courseTitle}`));
    } finally {
      setBusy(courseId);
    }
  }, [setBusy, ensurePdf]);

  return (
    <div className="space-y-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      {/* ── Hero ── */}
      <div className="mx-auto max-w-4xl text-center">
				<div className="mx-auto mb-4 h-1 w-28 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" />
				<h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
					 ទាញយកសៀវភៅមេរៀន<span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">PDFរបស់យើង</span>
				</h2>
				<p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-400 md:text-base">
				 ទាញយកសៀវភៅមេរៀនសម្រាប់វគ្គសិក្សានីមួយៗ ជាមួយប៊ូតុងតែម្តង។ ប្រសិនបើមិនទាន់មាន PDF ប្រព័ន្ធនឹងបង្កើតអោយស្វ័យប្រវត្តិ។
				</p>
			</div>

      {/* ── Filters ── */}
      <PdfFilterBar
        query={query}
        onQueryChange={setQuery}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        totalCount={filteredRows.length}
      />
      {/* ── Grid ── */}
      {loadingRows ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">កំពុងផ្ទុកវគ្គសិក្សា...</span>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          មិនមានវគ្គសិក្សាត្រូវនឹងការស្វែងរកទេ។
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => (
            <PdfCourseCard
              key={row.courseId}
              row={row}
              busyAction={busyByCourse[row.courseId]}
              onDownload={handleDownload}
              onView={handleView}
              onGenerate={handleGenerate}
            />
          ))}
        </section>
      )}
    </div>
  );
}


