import { get, post, put, del } from '@/lib/api/client'
import type { LessonResponse, LessonRequest } from '@/types/lessonType'

// ─────────────────────────────────────────────────────────────
//  LESSON SERVICE
// ─────────────────────────────────────────────────────────────

const LESSON_PATH = '/api/v1/lessons'

export const lessonService = {
  /** GET /chapter/:chapterId → LessonResponse[] */
  getByChapter: (chapterId: number): Promise<LessonResponse[]> =>
    get<LessonResponse[]>(`${LESSON_PATH}/chapter/${chapterId}`),

  /** GET /course/:courseId → LessonResponse[] */
  getByCourse: (courseId: number): Promise<LessonResponse[]> =>
    get<LessonResponse[]>(`${LESSON_PATH}/course/${courseId}`),

  /** GET /:id */
  getById: (id: number): Promise<LessonResponse> =>
    get<LessonResponse>(`${LESSON_PATH}/${id}`),

  /** POST / — [ADMIN] */
  create: (payload: LessonRequest): Promise<LessonResponse> =>
    post<LessonResponse>(LESSON_PATH, payload),

  /** PUT /:id — [ADMIN] */
  update: (id: number, payload: LessonRequest): Promise<LessonResponse> =>
    put<LessonResponse>(`${LESSON_PATH}/${id}`, payload),

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> =>
    del<void>(`${LESSON_PATH}/${id}`, { raw: true }),
}
