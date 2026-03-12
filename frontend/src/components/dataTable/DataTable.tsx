"use client";

import { useState, useMemo } from "react";
import {
  Search, AlertTriangle, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, MoreHorizontal, ArrowUp,
  ArrowDown, X, SlidersHorizontal, Filter, ChevronDown,
  RefreshCw, Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Import your defined types
import { ApiResponse, PageResponse, PaginationParams } from '@/types/api';

type DataRow = { id?: number | string };

interface DataTableProps<T extends DataRow> {
  title: string;
  description?: string;
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
  }[];
  useDataHook: (params: any) => {
    data: ApiResponse<PageResponse<T>> | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
    refetch?: () => void;
  };
  filters?: {
    key: string;
    label: string;
    type: 'select' | 'text';
    options?: { label: string; value: any }[];
    placeholder?: string;
    allLabel?: string;
    value?: any;
    onChange?: (value: any) => void;
  }[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  headerActions?: React.ReactNode;
  defaultShowFilters?: boolean;
  actionLabels?: {
    view?: string;
    edit?: string;
    delete?: string;
  };
}

export function DataTable<T extends DataRow>({
  title,
  description,
  columns,
  useDataHook,
  filters: filterConfig,
  onView,
  onEdit,
  onDelete,
  headerActions,
  defaultShowFilters = false,
  actionLabels,
}: DataTableProps<T>) {
  // --- States ---
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0); // Spring Boot zero-based
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>("asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(defaultShowFilters);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => { initial[col.key] = true; });
    return initial;
  });

  const resolvedFilters = useMemo(() => {
    if (!filterConfig) return activeFilters;

    return filterConfig.reduce<Record<string, any>>((accumulator, filter) => {
      const rawValue = filter.value !== undefined ? filter.value : activeFilters[filter.key];

      if (
        rawValue !== undefined &&
        rawValue !== null &&
        rawValue !== "" &&
        rawValue !== "ALL"
      ) {
        accumulator[filter.key] = rawValue;
      }

      return accumulator;
    }, {});
  }, [activeFilters, filterConfig]);

  // --- API Sync ---
  const queryParams = useMemo(() => ({
    page,
    size,
    sortBy,
    sortDir,
    search: search || undefined,
    ...resolvedFilters
  }), [page, resolvedFilters, search, size, sortBy, sortDir]);

  const { data, isLoading, isError, error, refetch } = useDataHook(queryParams);

  // Mapping Spring Data keys
  const items = data?.data?.content || [];
  const totalElements = data?.data?.totalElements || 0;
  const totalPages = data?.data?.totalPages || 0;

  // --- Logic Handlers ---
  const handleSort = (key: string) => {
    if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("asc"); }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          <Button variant="outline" size="icon" onClick={() => refetch?.()} className="hidden sm:flex">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 2. Toolbar Panel */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search everything..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-10 h-10 border-muted-foreground/20 focus-visible:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              className="h-10"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {Object.keys(resolvedFilters).length > 0 && (
                <Badge variant="default" className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full">
                  {Object.keys(resolvedFilters).length}
                </Badge>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {columns.map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={columnVisibility[col.key]}
                    onCheckedChange={(val) => setColumnVisibility(p => ({ ...p, [col.key]: val }))}
                  >
                    {col.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showFilters && filterConfig && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t animate-in slide-in-from-top-2">
            {filterConfig.map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{f.label}</label>
                <Select
                  value={String(f.value ?? activeFilters[f.key] ?? "ALL")}
                  onValueChange={(v) => {
                    const nextValue = v === "ALL" ? undefined : v;
                    if (f.onChange) {
                      f.onChange(nextValue);
                    } else {
                      setActiveFilters(p => ({ ...p, [f.key]: nextValue }));
                    }
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={f.placeholder ?? "All"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{f.allLabel ?? `All ${f.label}`}</SelectItem>
                    {f.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Table Container */}
      <div className="rounded-sm border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                {columns.filter(c => columnVisibility[c.key]).map(col => (
                  <TableHead 
                    key={col.key} 
                    className="cursor-pointer py-4 font-semibold text-foreground"
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2 group">
                      {col.label}
                      {col.sortable && (
                        <div className={`transition-opacity ${sortBy === col.key ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                          {sortBy === col.key && sortDir === "desc" ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: size > 5 ? 6 : size }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.filter(c => columnVisibility[c.key]).map(col => (
                      <TableCell key={col.key} className="py-4">
                        <Skeleton className={`h-4 ${col.key === columns[0]?.key ? "w-40" : "w-20"} rounded`} />
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={99} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-8">
                      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-6 w-6 opacity-40" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-sm">No records found</p>
                        <p className="text-xs">Try adjusting your search or filters.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, idx) => (
                  <TableRow key={item.id || idx} className="hover:bg-muted/40 transition-colors border-muted/50">
                    {columns.filter(c => columnVisibility[c.key]).map(col => (
                      <TableCell key={col.key} className="py-4">
                        {col.render ? col.render(item[col.key as keyof T], item) : String(item[col.key as keyof T] || "-")}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)}>
                              {actionLabels?.view ?? "View"}
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              {actionLabels?.edit ?? "Edit"}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (onView || onEdit) && <DropdownMenuSeparator />}
                          {onDelete && (
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => onDelete(item)}>
                              {actionLabels?.delete ?? "Delete"}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 4. Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
         <div className="text-sm text-muted-foreground">
           Showing <span className="font-medium text-foreground">{totalElements === 0 ? 0 : page * size + 1}</span> to <span className="font-medium text-foreground">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-medium text-foreground">{totalElements}</span> results
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="text-sm text-muted-foreground">Rows per page</span>
               <Select value={String(size)} onValueChange={(v) => { setSize(Number(v)); setPage(0); }}>
                 <SelectTrigger className="h-8 w-16">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {[10, 20, 50].map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
            <div className="flex items-center gap-1">
               <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(0)} disabled={page === 0}><ChevronsLeft className="h-4 w-4" /></Button>
               <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => p - 1)} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
               <div className="px-4 text-sm font-medium">Page {page + 1} of {totalPages || 1}</div>
               <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
               <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}><ChevronsRight className="h-4 w-4" /></Button>
            </div>
         </div>
      </div>
    </div>
  );
}