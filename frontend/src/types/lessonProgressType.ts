export interface LessonProgressResponse {
  id: number
  userId: number
  username?: string
  lessonId: number
  lessonTitle?: string
  courseId?: number
  courseTitle?: string
  courseTotalLessons?: number
  completed: boolean
  scrollPct?: number
  scrollPosition?: number
  readTimeSeconds?: number      
  pdfDownloaded: boolean
  completedAt?: string
  updatedAt?: string
  createdAt?: string
}

export interface LessonProgressRequest {
  lessonId: number
  scrollPosition?: number
  readTimeSeconds?: number     
  completed?: boolean
  pdfDownloaded?: boolean
  userId?: number                
}
