"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	FileText,
	Download,
	RefreshCw,
	BookOpen,
	HardDrive,
} from "lucide-react";
import { DataTable } from "@/components/dataTable/DataTable";
import { StatCard } from "@/components/StatCard";
import { useAllCoursePdfs, useCoursePdfAdmin } from "@/hooks/useCoursesPdf";
import { pdfService } from "@/services/pdfService";
import type { ApiResponse, PageResponse } from "@/types/apiType";
import type { CoursePdfExportResponse } from "@/types/coursePDFType";

type PdfTableRow = Omit<CoursePdfExportResponse, "id"> & { id?: number };

// ─── helpers ──────────────────────────────────────────────────

function formatBytes(kb?: number): string {
	if (kb == null) return "—";
	if (kb < 1024) return `${kb} KB`;
	return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDate(iso?: string): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

// ─── level badge colour ────────────────────────────────────────

const levelVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	BEGINNER: "secondary",
	INTERMEDIATE: "default",
	ADVANCED: "destructive",
};

export default function DocumentsPage() {
	const { data: pdfs, loading, error, refetch } = useAllCoursePdfs();
	const { generating, removing, generate, remove } = useCoursePdfAdmin();

	const [actionCourseId, setActionCourseId] = useState<number | null>(null);

	// stats
	const totalDownloads = pdfs?.reduce((s, p) => s + (p.downloadCount ?? 0), 0) ?? 0;
	const totalSize = pdfs?.reduce((s, p) => s + (p.pdfSizeKb ?? 0), 0) ?? 0;
	const totalPages = pdfs?.reduce((s, p) => s + (p.totalPages ?? 0), 0) ?? 0;

	const pdfColumns = useMemo(
		() => [
			{
				key: "pdfName",
				label: "PDF",
				sortable: true,
				render: (value: string | undefined, pdf: PdfTableRow) => (
					<div className="flex items-center gap-3 min-w-0">
						<div className="shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
							<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div className="min-w-0">
							<p className="truncate font-medium">{value ?? `${pdf.courseTitle}.pdf`}</p>
							<p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
								<BookOpen className="h-3.5 w-3.5" />
								{pdf.courseTitle}
							</p>
						</div>
					</div>
				),
			},
			{
				key: "level",
				label: "Level",
				render: (value: string | null | undefined) => {
					const level = value?.toUpperCase() ?? "";
					return level ? <Badge variant={levelVariant[level] ?? "outline"}>{level}</Badge> : <span className="text-muted-foreground">-</span>;
				},
			},
			{
				key: "pdfSizeKb",
				label: "Size",
				sortable: true,
				render: (value: number | undefined) => formatBytes(value),
			},
			{
				key: "downloadCount",
				label: "Downloads",
				sortable: true,
				render: (value: number | undefined) => value ?? 0,
			},
			{
				key: "generatedAt",
				label: "Generated",
				sortable: true,
					render: (_value: string | undefined, pdf: PdfTableRow) =>
					formatDate(pdf.generatedAt ?? pdf.createdAt),
			},
		],
		[]
	);

	const usePdfTable = (params: {
		page?: number;
		size?: number;
		sortBy?: string;
		sortDir?: "asc" | "desc";
		search?: string;
	}) => {
		const { page = 0, size = 10, sortBy = "generatedAt", sortDir = "desc", search } = params;
		const normalizedSearch = search?.trim().toLowerCase() ?? "";
		const filtered = normalizedSearch
			? (pdfs ?? []).filter(
					(pdf) =>
						pdf.courseTitle.toLowerCase().includes(normalizedSearch) ||
						(pdf.pdfName ?? "").toLowerCase().includes(normalizedSearch)
				)
			: [...(pdfs ?? [])];

		filtered.sort((left, right) => {
			const multiplier = sortDir === "desc" ? -1 : 1;
			if (sortBy === "pdfName") return (left.pdfName ?? "").localeCompare(right.pdfName ?? "") * multiplier;
			if (sortBy === "pdfSizeKb") return ((left.pdfSizeKb ?? 0) - (right.pdfSizeKb ?? 0)) * multiplier;
			if (sortBy === "downloadCount") return ((left.downloadCount ?? 0) - (right.downloadCount ?? 0)) * multiplier;
			return (
				(new Date(left.generatedAt ?? left.createdAt ?? 0).getTime() -
					new Date(right.generatedAt ?? right.createdAt ?? 0).getTime()) * multiplier
			);
		});

		const totalElements = filtered.length;
		const computedTotalPages = Math.max(1, Math.ceil(totalElements / size));
		const startIndex = page * size;

		return {
			data: {
				success: true as const,
				message: "",
				data: {
					content: filtered.slice(startIndex, startIndex + size).map((pdf) => ({
						...pdf,
						id: pdf.id ?? pdf.courseId,
					})),
					totalElements,
					totalPages: computedTotalPages,
					pageNumber: page,
					pageSize: size,
				},
			} as ApiResponse<PageResponse<PdfTableRow>>,
			isLoading: loading,
			isError: Boolean(error),
			error,
			refetch,
		};
	};

	async function handleDownload(pdf: PdfTableRow) {
		const fileUrl = pdf.fileUrl ?? pdf.pdfUrl;
		if (!fileUrl) return;
		// increment counter then open
		await pdfService.incrementDownload(pdf.courseId).catch(() => null);
		window.open(fileUrl, "_blank", "noopener,noreferrer");
	}

	async function handleRegenerate(courseId: number) {
		setActionCourseId(courseId);
		try {
			await generate(courseId);
		} finally {
			setActionCourseId(null);
		}
	}

	async function handleDelete(courseId: number) {
		setActionCourseId(courseId);
		try {
			await remove(courseId);
		} finally {
			setActionCourseId(null);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Course PDFs</h1>
					<p className="text-muted-foreground mt-1">
						View, download, regenerate, and manage exported course PDFs.
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
					<RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
					Refresh
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<StatCard icon={FileText} label="Total PDFs" value={pdfs?.length ?? 0} color="#8b5cf6" loading={loading} />
				<StatCard icon={Download} label="Total Downloads" value={totalDownloads} color="#3b82f6" loading={loading} />
				<StatCard icon={HardDrive} label="Storage Used" value={formatBytes(totalSize)} color="#10b981" loading={loading} />
			</div>

			<DataTable<PdfTableRow>
				title="PDF Management"
				description={`Browse ${pdfs?.length ?? 0} generated PDFs with ${totalPages} total pages.`}
				columns={pdfColumns}
				useDataHook={usePdfTable}
				onView={handleDownload}
				onEdit={(pdf) => handleRegenerate(pdf.courseId)}
				onDelete={(pdf) => handleDelete(pdf.courseId)}
				actionLabels={{ view: "Download", edit: "Regenerate", delete: "Delete" }}
				headerActions={
					actionCourseId !== null ? (
						<Badge variant="secondary">
							{generating ? "Regenerating..." : removing ? "Deleting..." : "Working..."}
						</Badge>
					) : undefined
				}
			/>
		</div>
	);
}
