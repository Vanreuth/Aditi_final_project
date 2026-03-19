import { get, post, put, del } from '@/lib/api/client'
import type { CodeSnippetResponse, CodeSnippetRequest } from '@/types/codeSnippetType'

const SNIPPET_PATH = '/api/v1/snippets'

export const snippetService = {
  /** GET /lesson/:lessonId → CodeSnippetResponse[] */
  getByLesson: (lessonId: number): Promise<CodeSnippetResponse[]> =>
    get<CodeSnippetResponse[]>(`${SNIPPET_PATH}/lesson/${lessonId}`),

  /** GET /:id */
  getById: (id: number): Promise<CodeSnippetResponse> =>
    get<CodeSnippetResponse>(`${SNIPPET_PATH}/${id}`),

  /** POST / — [ADMIN] */
  create: (payload: CodeSnippetRequest): Promise<CodeSnippetResponse> =>
    post<CodeSnippetResponse>(SNIPPET_PATH, payload),

  /** PUT /:id — [ADMIN] */
  update: (id: number, payload: CodeSnippetRequest): Promise<CodeSnippetResponse> =>
    put<CodeSnippetResponse>(`${SNIPPET_PATH}/${id}`, payload),

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> =>
    del<void>(`${SNIPPET_PATH}/${id}`, { raw: true }),
}
