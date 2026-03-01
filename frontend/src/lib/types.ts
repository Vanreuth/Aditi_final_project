// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  roles: string[];
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "USER" | "INSTRUCTOR";
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

// ─── Category Types ───────────────────────────────────────────────────────────

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  orderIndex: number;
  courseCount: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  orderIndex?: number;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

// ─── Course Types ─────────────────────────────────────────────────────────────

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CourseDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  level: CourseLevel;
  language: string;
  status: CourseStatus;
  isFeatured: boolean;
  isFree: boolean;
  requirements: string | null;
  totalLessons: number;
  totalChapters: number;
  enrolledCount: number;
  avgRating: number;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  instructorId: number;
  instructorName: string;
  categoryId: number;
  categoryName: string;
}

export interface CreateCourseRequest {
  title: string;
  slug: string;
  description: string;
  requirements?: string;
  level: CourseLevel;
  language: string;
  status: CourseStatus;
  isFeatured?: boolean;
  isFree?: boolean;
  categoryId: number;
  instructorId: number;
  thumbnail?: File;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

// ─── Chapter Types ────────────────────────────────────────────────────────────

export interface ChapterDto {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
  courseId: number;
  courseTitle: string;
  lessonCount: number;
}

export interface CreateChapterRequest {
  title: string;
  description?: string;
  orderIndex: number;
  courseId: number;
}

export interface UpdateChapterRequest extends Partial<CreateChapterRequest> {}

// ─── Lesson Types ─────────────────────────────────────────────────────────────

export interface LessonDto {
  id: number;
  title: string;
  description: string | null;
  content: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string | null;
  chapterId: number;
  chapterTitle: string;
  courseId: number;
  courseTitle: string;
  codeSnippets?: CodeSnippetDto[];
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  content: string;
  orderIndex: number;
  chapterId: number;
  courseId: number;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

// ─── Code Snippet Types ───────────────────────────────────────────────────────

export interface CodeSnippetDto {
  id: number;
  title: string;
  code: string;
  language: string;
  explanation: string | null;
  orderIndex: number;
  createdAt: string;
  lessonId: number;
}

export interface CreateSnippetRequest {
  title: string;
  code: string;
  language: string;
  explanation?: string;
  orderIndex: number;
  lessonId: number;
}

export interface UpdateSnippetRequest extends Partial<CreateSnippetRequest> {}

// ─── Lesson Progress Types ────────────────────────────────────────────────────

export interface LessonProgressDto {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  scrollPct: number;
  readTimeSeconds: number;
  pdfDownloaded: boolean;
  completedAt: string | null;
  lastAccessedAt: string;
}

export interface UpsertProgressRequest {
  userId: number;
  lessonId: number;
  completed?: boolean;
  scrollPct?: number;
  readTimeSeconds?: number;
  pdfDownloaded?: boolean;
}

// ─── Course PDF Export Types ──────────────────────────────────────────────────

export interface CoursePdfExportDto {
  id: number;
  courseId: number;
  courseTitle: string;
  pdfUrl: string;
  downloadCount: number;
  generatedAt: string;
}

// ─── Dashboard Stats Types ────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  recentUsers: UserDto[];
  popularCourses: CourseDto[];
  userGrowth: { date: string; count: number }[];
  enrollmentTrend: { date: string; count: number }[];
}

// ─── Table/Query Types ────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
  query?: string;
  categoryId?: number;
  level?: CourseLevel;
  status?: CourseStatus;
}
