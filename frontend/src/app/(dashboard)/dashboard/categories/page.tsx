"use client";

import { useState, useMemo } from "react";
import { Layers, Eye, BookOpen, Plus, Check, X } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable } from "@/components/dataTable/DataTable";
import { CategoryDialog } from "@/components/dialog/CategoryDialog";
import { DeleteConfirmDialog } from "@/components/dialog/DeleteConfirmDialog";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useCategories, useCategoryAdmin, categoryKeys } from "@/hooks/useCategories";
import { categoryService } from "@/services/categoryService";
import type { CategoryResponse, CategoryRequest } from "@/types/category";

// ─── Gradient palette for category avatars ────────────────────────────────────
const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
];

// ─── Adapter: wraps useQuery to match DataTable's expected hook signature ─────
function useCategoriesTable(params: any) {
  const { page = 0, size = 10, sortBy = "orderIndex", sortDir = "asc", search, status, hasCourses } = params;
  const filterParams = { page, size, sortBy, sortDir, search, status, hasCourses };
  const query = useQuery({
    queryKey: categoryKeys.list(filterParams),
    queryFn : () => categoryService.getAll(filterParams),
    placeholderData: keepPreviousData,
  });
  return {
    data    : query.data ? { success: true as const, message: "", data: query.data } : undefined,
    isLoading: query.isPending,
    isError  : query.isError,
    error    : query.error,
    refetch  : query.refetch,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mode: "view" | "add" | "edit";
    data: CategoryResponse | null;
  }>({ isOpen: false, mode: "add", data: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    data: CategoryResponse | null;
  }>({ isOpen: false, data: null });

  // ─── Data & Mutations ─────────────────────────────────────────────────────
  const { create, update, remove, creating, updating, removing } = useCategoryAdmin();
  const { data: statsData, loading: statsLoading } = useCategories({ page: 0, size: 1000 });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenModal = (mode: "view" | "add" | "edit", data: CategoryResponse | null = null) =>
    setModal({ isOpen: true, mode, data });

  const handleFormSubmit = async (formData: CategoryRequest) => {
    try {
      if (modal.mode === "add") {
        await create(formData);
        toast.success("Category created successfully");
      } else if (modal.mode === "edit" && modal.data) {
        await update(modal.data.id, formData);
        toast.success("Category updated successfully");
      }
      setModal((prev) => ({ ...prev, isOpen: false }));
    } catch {
      toast.error("Operation failed. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.data) return;
    try {
      await remove(deleteDialog.data.id);
      toast.success("Category deleted permanently");
      setDeleteDialog({ isOpen: false, data: null });
    } catch {
      toast.error("Failed to delete category");
    }
  };

  // ─── Column Definitions ───────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      key     : "name",
      label   : "Category",
      sortable: true,
      render  : (_: any, item: CategoryResponse) => (
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-lg bg-gradient-to-br ${GRADIENTS[item.id % GRADIENTS.length]}
              flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
          >
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate leading-tight">{item.name}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key   : "slug",
      label : "Slug",
      render: (val: string) => (
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{val}</code>
      ),
    },
    {
      key   : "courseCount",
      label : "Courses",
      render: (val: number) => (
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-sm">{val ?? 0}</span>
        </div>
      ),
    },
    {
      key   : "isActive",
      label : "Status",
      render: (val: boolean) =>
        val ? (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 gap-1 text-xs font-medium">
            <Check className="h-3 w-3" /> Active
          </Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0 gap-1 text-xs font-medium">
            <X className="h-3 w-3" /> Inactive
          </Badge>
        ),
    },
  ], []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Layers} label="Total Categories"
          value={statsData?.totalElements || 0}
          color="#8b5cf6" loading={statsLoading}
        />
        <StatCard
          icon={Eye} label="Active"
          value={statsData?.content?.filter(c => c.isActive).length || 0}
          color="#10b981" loading={statsLoading}
        />
        <StatCard
          icon={BookOpen} label="Total Courses"
          value={statsData?.content?.reduce((a, b) => a + (b.courseCount || 0), 0) || 0}
          color="#3b82f6" loading={statsLoading}
        />
      </div>

      {/* Table */}
      <DataTable<CategoryResponse>
        title="Category Management"
        description="Organize courses by managing categories and slugs."
        useDataHook={useCategoriesTable}
        columns={columns}
        filters={[
          {
            key    : "status",
            label  : "Status",
            type   : "select",
            options: [
              { label: "Active",   value: "active"   },
              { label: "Inactive", value: "inactive" },
            ],
          },
          {
            key    : "hasCourses",
            label  : "Courses",
            type   : "select",
            options: [
              { label: "Has Courses", value: "true"  },
              { label: "No Courses",  value: "false" },
            ],
          },
        ]}
        onView={(item) => handleOpenModal("view", item)}
        onEdit={(item) => handleOpenModal("edit", item)}
        onDelete={(item) => setDeleteDialog({ isOpen: true, data: item })}
        headerActions={
          <Button onClick={() => handleOpenModal("add")} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      {/* Add / Edit / View Dialog */}
      <CategoryDialog
        isOpen={modal.isOpen}
        onOpenChange={(open) => setModal((prev) => ({ ...prev, isOpen: open }))}
        mode={modal.mode}
        category={modal.data}
        onSubmit={handleFormSubmit}
        isSubmitting={creating || updating}
        onSwitchToEdit={(cat) => handleOpenModal("edit", cat)}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, isOpen: open }))}
        onConfirm={handleConfirmDelete}
        itemName={deleteDialog.data?.name}
        isLoading={removing}
      />
    </div>
  );
}