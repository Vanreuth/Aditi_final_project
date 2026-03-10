
export type SortOrder = "asc" | "desc";
export type FilterType = "select" | "text" | "number" | "daterange";

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  defaultValue?: string | number | null;
  placeholder?: string;
  dependsOn?: string;
}

export interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface DataTableConfig<T> {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  columns: ColumnConfig<T>[];
  filters?: FilterConfig[];
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortOrder?: SortOrder;
  forcedParams?: Record<string, unknown>;
}

export interface ApiParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: SortOrder;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  [key: string]: unknown;
}

export type DataRow = { id?: number | string };

export interface DataTableProps<T extends DataRow> {
  config: DataTableConfig<T>;
  useDataHook: (params: ApiParams) => {
    data: unknown;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch?: () => void | Promise<unknown>;
  };
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  canEdit?: (item: T) => boolean;
  canDelete?: (item: T) => boolean;
  headerActions?: React.ReactNode;
  onFilterChange?: (filterKey: string, value: string) => void;
  onRowClick?: (item: T) => void;
  isRowClickable?: (item: T) => boolean;
  rowClassName?: (item: T) => string;
  customRowActions?: (item: T) => React.ReactNode;
}