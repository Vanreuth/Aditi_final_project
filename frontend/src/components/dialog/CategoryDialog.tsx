"use client";

import { useEffect, useState } from "react";
import { Loader2, Eye, Edit3, PlusCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CategoryResponse, CategoryRequest } from "@/types/category";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const MODE_CONFIG = {
  view : { Icon: Eye,        accent: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-950/40",    label: "View Category",  hint: "Viewing category details." },
  edit : { Icon: Edit3,      accent: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-950/40",  label: "Edit Category",  hint: "Update the fields below, then save." },
  add  : { Icon: PlusCircle, accent: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", label: "New Category", hint: "Fill in the details to create a new category." },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "add" | "edit";
  category: CategoryResponse | null;
  onSubmit: (data: CategoryRequest) => Promise<void>;
  isSubmitting?: boolean;
  onSwitchToEdit?: (category: CategoryResponse) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CategoryDialog({
  isOpen,
  onOpenChange,
  mode,
  category,
  onSubmit,
  isSubmitting = false,
  onSwitchToEdit,
}: CategoryDialogProps) {
  const [formData, setFormData] = useState<CategoryRequest>({
    name: "", slug: "", description: "", isActive: true, orderIndex: 0,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryRequest, string>>>({});

  const isReadOnly = mode === "view";
  const { Icon, accent, bg, label, hint } = MODE_CONFIG[mode];

  // Sync on open
  useEffect(() => {
    if (!isOpen) return;
    if (category && mode !== "add") {
      setFormData({
        name       : category.name,
        slug       : category.slug ?? "",
        description: category.description ?? "",
        isActive   : category.isActive ?? true,
        orderIndex : category.orderIndex ?? 0,
      });
    } else {
      setFormData({ name: "", slug: "", description: "", isActive: true, orderIndex: 0 });
    }
    setSlugTouched(false);
    setErrors({});
  }, [isOpen, mode, category]);

  // Auto-slug when name changes (only mode=add, slug not manually set)
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !slugTouched ? generateSlug(name) : prev.slug,
    }));
    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
  };

  const handleSlugChange = (raw: string) => {
    setSlugTouched(true);
    setFormData((prev) => ({ ...prev, slug: raw.toLowerCase().replace(/\s+/g, "-") }));
    if (errors.slug) setErrors((e) => ({ ...e, slug: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!formData.name.trim()) next.name = "Category name is required.";
    const slug = formData.slug ?? "";
    if (!slug.trim()) {
      next.slug = "Slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      next.slug = "Only lowercase letters, numbers, and hyphens (e.g. web-dev).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !validate()) return;
    await onSubmit({ ...formData, name: formData.name.trim(), slug: (formData.slug ?? "").trim() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">

        {/* ── Colored Header ── */}
        <div className={cn("px-6 pt-6 pb-5 border-b", bg)}>
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className={cn("p-1.5 rounded-lg bg-background/80 border shadow-sm", accent)}>
                <Icon className={cn("h-4 w-4", accent)} />
              </div>
              <DialogTitle className="text-base font-semibold">{label}</DialogTitle>
            </div>
            <DialogDescription className="text-sm">{hint}</DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className={cn("text-sm font-medium", errors.name && "text-destructive")}>
                Category Name {!isReadOnly && <span className="text-destructive">*</span>}
              </Label>
              {isReadOnly ? (
                <p className="text-sm font-semibold py-1.5">{formData.name}</p>
              ) : (
                <>
                  <Input
                    id="name"
                    placeholder="e.g., Web Development"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={isSubmitting}
                    className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
                    autoFocus
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="slug" className={cn("text-sm font-medium", errors.slug && "text-destructive")}>
                URL Slug {!isReadOnly && <span className="text-destructive">*</span>}
              </Label>
              {isReadOnly ? (
                <code className="block text-sm bg-muted px-3 py-2 rounded-md font-mono">{formData.slug}</code>
              ) : (
                <>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono select-none">
                      /category/
                    </span>
                    <Input
                      id="slug"
                      placeholder="web-development"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      disabled={isSubmitting}
                      className={cn(
                        "pl-[5.75rem] font-mono text-sm",
                        errors.slug && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
                </>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Description{" "}
                <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              {isReadOnly ? (
                <p className="text-sm text-muted-foreground py-1 min-h-[2rem]">
                  {formData.description || <span className="italic">No description</span>}
                </p>
              ) : (
                <Textarea
                  id="description"
                  placeholder="Brief description of this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                  rows={3}
                  className="resize-none"
                />
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Order + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="orderIndex" className="text-sm font-medium">Display Order</Label>
                {isReadOnly ? (
                  <p className="text-sm font-semibold py-1.5">{formData.orderIndex}</p>
                ) : (
                  <Input
                    id="orderIndex"
                    type="number"
                    min="0"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                    disabled={isSubmitting}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Status</Label>
                {isReadOnly ? (
                  <div className="py-1.5">
                    {formData.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 gap-1">
                        <Check className="h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-0 gap-1">
                        <X className="h-3 w-3" /> Inactive
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 h-10">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                      disabled={isSubmitting}
                    />
                    <span className={cn("text-sm font-medium", formData.isActive ? "text-emerald-600" : "text-muted-foreground")}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Extra info in view mode */}
            {isReadOnly && category && (
              <>
                <div className="h-px bg-border" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Courses</p>
                    <p className="font-semibold">{category.courseCount ?? 0}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Order</p>
                    <p className="font-semibold">{category.orderIndex}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Created</p>
                    <p className="text-muted-foreground">{new Date(category.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Updated</p>
                    <p className="text-muted-foreground">{new Date(category.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/20">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {isReadOnly ? (
              <Button
                type="button"
                onClick={() => { onOpenChange(false); category && onSwitchToEdit?.(category); }}
              >
                <Edit3 className="mr-2 h-4 w-4" /> Edit Category
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="min-w-[130px]">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "add" ? "Create Category" : "Save Changes"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}