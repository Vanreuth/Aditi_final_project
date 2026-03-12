import { get, post, put, del } from '@/lib/api/client'
import type { ChapterResponse, ChapterRequest } from '@/types/chapterType'

// ─────────────────────────────────────────────────────────────
//  CHAPTER SERVICE
// ─────────────────────────────────────────────────────────────

const CHAPTER_PATH = '/api/v1/chapters'

export const chapterService = {
  /** GET /course/:courseId → ChapterResponse[] */
  getByCourse: (courseId: number): Promise<ChapterResponse[]> =>
    get<ChapterResponse[]>(`${CHAPTER_PATH}/course/${courseId}`),

  /** GET /:id */
  getById: (id: number): Promise<ChapterResponse> =>
    get<ChapterResponse>(`${CHAPTER_PATH}/${id}`),

  /** POST / — [ADMIN] */
  create: (payload: ChapterRequest): Promise<ChapterResponse> =>
    post<ChapterResponse>(CHAPTER_PATH, payload),

  /** PUT /:id — [ADMIN] */
  update: (id: number, payload: ChapterRequest): Promise<ChapterResponse> =>
    put<ChapterResponse>(`${CHAPTER_PATH}/${id}`, payload),

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> =>
    del<void>(`${CHAPTER_PATH}/${id}`, { raw: true }),
}
