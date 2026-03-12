import { get, post, put, del } from '@/lib/api/client'
import type { PageResponse, CategoryFilterParams } from '@/types/api'
import type { CategoryResponse, CategoryRequest } from '@/types/category'

// ─────────────────────────────────────────────────────────────
//  CATEGORY SERVICE
// ─────────────────────────────────────────────────────────────

const CATEGORY_PATH = '/api/v1/categories'

export const categoryService = {
  /** GET / — paginated list of categories */
  getAll: (params: CategoryFilterParams = {}): Promise<PageResponse<CategoryResponse>> => {
    const { page = 0, size = 10, sortBy = 'orderIndex', sortDir = 'asc', search, status, hasCourses } = params
    const query: Record<string, unknown> = { page, size, sortBy, sortDir }
    if (search)                              query.search     = search
    if (status !== undefined)                query.status     = status
    if (hasCourses !== undefined && hasCourses !== null) query.hasCourses = hasCourses
    return get<PageResponse<CategoryResponse>>(CATEGORY_PATH, { params: query })
  },

  /** GET /:id */
  getById: (id: number): Promise<CategoryResponse> =>
    get<CategoryResponse>(`${CATEGORY_PATH}/${id}`),

  /** GET /slug/:slug */
  getBySlug: (slug: string): Promise<CategoryResponse> =>
    get<CategoryResponse>(`${CATEGORY_PATH}/slug/${slug}`),

  /** POST / — [ADMIN] */
  create: (payload: CategoryRequest): Promise<CategoryResponse> =>
    post<CategoryResponse>(CATEGORY_PATH, payload),

  /** PUT /:id — [ADMIN] */
  update: (id: number, payload: CategoryRequest): Promise<CategoryResponse> =>
    put<CategoryResponse>(`${CATEGORY_PATH}/${id}`, payload),

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> =>
    del<void>(`${CATEGORY_PATH}/${id}`, { raw: true }),
}
