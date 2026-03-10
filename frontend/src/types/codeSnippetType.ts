
export interface CodeSnippetResponse {
  id: number
  title?: string
  language: string
  code: string
  explanation?: string
  description?: string
  orderIndex: number
  lessonId: number
  lessonTitle?: string
  createdAt?: string
}

export interface CodeSnippetRequest {
  title?: string
  language: string
  code: string
  explanation?: string
  description?: string
  orderIndex?: number
  lessonId: number
}
