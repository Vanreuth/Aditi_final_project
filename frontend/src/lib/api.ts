// ─── API Base ─────────────────────────────────────────────────────────────────
// Uses Next.js rewrites proxy (/api/* → backend) in browser,
// and direct URL in server-side / build contexts.

import type {
  ApiResponse,
  PageResponse,
  CategoryDto,
  CourseDto,
  ChapterDto,
  LessonDto,
  CodeSnippetDto,
  UserDto,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateCourseRequest,
  CreateChapterRequest,
  UpdateChapterRequest,
  CreateLessonRequest,
  UpdateLessonRequest,
  CreateSnippetRequest,
  UpdateSnippetRequest,
  LessonProgressDto,
  UpsertProgressRequest,
  CoursePdfExportDto,
  PaginationParams,
  DashboardStats,
} from "./types";

// Re-export types for convenience
export type {
  ApiResponse,
  PageResponse,
  CategoryDto,
  CourseDto,
  ChapterDto,
  LessonDto,
  CodeSnippetDto,
  UserDto,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateCategoryRequest,
  CreateCourseRequest,
  CreateChapterRequest,
  CreateLessonRequest,
  CreateSnippetRequest,
  LessonProgressDto,
  CoursePdfExportDto,
  PaginationParams,
  DashboardStats,
};

const API_BASE =
  typeof window !== "undefined"
    ? "" // browser: use relative path via Next.js rewrite proxy
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080");

// ─── Token Management ─────────────────────────────────────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

// ─── Fetch Helpers ────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: `API error ${res.status}` }));
    throw new Error(error.message || `API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

async function get<T>(path: string, revalidate = 60): Promise<T> {
  const token = getAccessToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    next: { revalidate },
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

async function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

async function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await post<ApiResponse<AuthResponse>>("/api/v1/auth/login", data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<UserDto> {
  const res = await post<ApiResponse<UserDto>>("/api/v1/auth/register", data);
  return res.data;
}

export async function getCurrentUser(): Promise<UserDto> {
  const res = await get<ApiResponse<UserDto>>("/api/v1/auth/me", 0);
  return res.data;
}

export async function getAuthProfile(): Promise<AuthResponse> {
  const res = await get<ApiResponse<AuthResponse>>("/api/v1/auth/me", 0);
  return res.data;
}

export async function refreshToken(): Promise<AuthResponse> {
  const res = await post<ApiResponse<AuthResponse>>("/api/v1/auth/refresh");
  return res.data;
}

export async function logout(): Promise<void> {
  await post("/api/v1/auth/logout");
  setAccessToken(null);
}

export async function fetchOAuthProviders(): Promise<string[]> {
  const res = await get<ApiResponse<string[]>>("/api/v1/auth/oauth2/providers", 0);
  return res.data;
}

export async function getOAuthAuthorizationUrl(provider: string): Promise<string> {
  const normalizedProvider = encodeURIComponent(provider.toLowerCase());
  const res = await get<ApiResponse<string>>(
    `/api/v1/auth/oauth2/authorize/${normalizedProvider}`,
    0
  );
  return res.data;
}

// ─── Category API ─────────────────────────────────────────────────────────────

export async function fetchCategories(
  page = 0,
  size = 50
): Promise<PageResponse<CategoryDto>> {
  const data = await get<ApiResponse<PageResponse<CategoryDto>>>(
    `/api/v1/categories?page=${page}&size=${size}&sortBy=orderIndex&sortDir=asc`
  );
  return data.data;
}

export async function fetchCategoryById(id: number): Promise<CategoryDto> {
  const data = await get<ApiResponse<CategoryDto>>(`/api/v1/categories/${id}`);
  return data.data;
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryDto> {
  const data = await get<ApiResponse<CategoryDto>>(`/api/v1/categories/slug/${slug}`);
  return data.data;
}

export async function createCategory(data: CreateCategoryRequest): Promise<CategoryDto> {
  const res = await post<ApiResponse<CategoryDto>>("/api/v1/categories", data);
  return res.data;
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<CategoryDto> {
  const res = await put<ApiResponse<CategoryDto>>(`/api/v1/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await del(`/api/v1/categories/${id}`);
}

// ─── Course API ───────────────────────────────────────────────────────────────

export async function fetchCourses(
  page = 0,
  size = 20,
  sortBy = "createdAt",
  sortDir: "asc" | "desc" = "desc"
): Promise<PageResponse<CourseDto>> {
  const data = await get<ApiResponse<PageResponse<CourseDto>>>(
    `/api/v1/courses?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
  );
  return data.data;
}

export async function fetchCourseById(id: number): Promise<CourseDto> {
  const data = await get<ApiResponse<CourseDto>>(`/api/v1/courses/${id}`);
  return data.data;
}

export async function fetchCourseBySlug(slug: string): Promise<CourseDto> {
  const data = await get<ApiResponse<CourseDto>>(`/api/v1/courses/slug/${slug}`);
  return data.data;
}

export async function fetchCoursesByCategory(
  categoryId: number,
  page = 0,
  size = 20
): Promise<PageResponse<CourseDto>> {
  const data = await get<ApiResponse<PageResponse<CourseDto>>>(
    `/api/v1/courses/category/${categoryId}?page=${page}&size=${size}`
  );
  return data.data;
}

export async function fetchCoursesByInstructor(
  instructorId: number,
  page = 0,
  size = 20
): Promise<PageResponse<CourseDto>> {
  const data = await get<ApiResponse<PageResponse<CourseDto>>>(
    `/api/v1/courses/instructor/${instructorId}?page=${page}&size=${size}`
  );
  return data.data;
}

export async function createCourse(data: CreateCourseRequest): Promise<CourseDto> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const res = await post<ApiResponse<CourseDto>>("/api/v1/courses", formData);
  return res.data;
}

export async function updateCourse(id: number, data: Partial<CreateCourseRequest>): Promise<CourseDto> {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  const res = await put<ApiResponse<CourseDto>>(`/api/v1/courses/${id}`, formData);
  return res.data;
}

export async function deleteCourse(id: number): Promise<void> {
  await del(`/api/v1/courses/${id}`);
}

// ─── Chapter API ──────────────────────────────────────────────────────────────

export async function fetchChaptersByCourse(courseId: number): Promise<ChapterDto[]> {
  const data = await get<ApiResponse<ChapterDto[]>>(`/api/v1/chapters/course/${courseId}`);
  return data.data;
}

export async function fetchChapterById(id: number): Promise<ChapterDto> {
  const data = await get<ApiResponse<ChapterDto>>(`/api/v1/chapters/${id}`);
  return data.data;
}

export async function createChapter(data: CreateChapterRequest): Promise<ChapterDto> {
  const res = await post<ApiResponse<ChapterDto>>("/api/v1/chapters", data);
  return res.data;
}

export async function updateChapter(id: number, data: UpdateChapterRequest): Promise<ChapterDto> {
  const res = await put<ApiResponse<ChapterDto>>(`/api/v1/chapters/${id}`, data);
  return res.data;
}

export async function deleteChapter(id: number): Promise<void> {
  await del(`/api/v1/chapters/${id}`);
}

// ─── Lesson API ───────────────────────────────────────────────────────────────

export async function fetchLessonsByChapter(chapterId: number): Promise<LessonDto[]> {
  const data = await get<ApiResponse<LessonDto[]>>(`/api/v1/lessons/chapter/${chapterId}`);
  return data.data;
}

export async function fetchLessonsByCourse(courseId: number): Promise<LessonDto[]> {
  const data = await get<ApiResponse<LessonDto[]>>(`/api/v1/lessons/course/${courseId}`);
  return data.data;
}

export async function fetchLessonById(id: number): Promise<LessonDto> {
  const data = await get<ApiResponse<LessonDto>>(`/api/v1/lessons/${id}`);
  return data.data;
}

export async function createLesson(data: CreateLessonRequest): Promise<LessonDto> {
  const res = await post<ApiResponse<LessonDto>>("/api/v1/lessons", data);
  return res.data;
}

export async function updateLesson(id: number, data: UpdateLessonRequest): Promise<LessonDto> {
  const res = await put<ApiResponse<LessonDto>>(`/api/v1/lessons/${id}`, data);
  return res.data;
}

export async function deleteLesson(id: number): Promise<void> {
  await del(`/api/v1/lessons/${id}`);
}

// ─── Code Snippet API ─────────────────────────────────────────────────────────

export async function fetchSnippetsByLesson(lessonId: number): Promise<CodeSnippetDto[]> {
  const data = await get<ApiResponse<CodeSnippetDto[]>>(`/api/v1/snippets/lesson/${lessonId}`);
  return data.data;
}

export async function fetchSnippetById(id: number): Promise<CodeSnippetDto> {
  const data = await get<ApiResponse<CodeSnippetDto>>(`/api/v1/snippets/${id}`);
  return data.data;
}

export async function createSnippet(data: CreateSnippetRequest): Promise<CodeSnippetDto> {
  const res = await post<ApiResponse<CodeSnippetDto>>("/api/v1/snippets", data);
  return res.data;
}

export async function updateSnippet(id: number, data: UpdateSnippetRequest): Promise<CodeSnippetDto> {
  const res = await put<ApiResponse<CodeSnippetDto>>(`/api/v1/snippets/${id}`, data);
  return res.data;
}

export async function deleteSnippet(id: number): Promise<void> {
  await del(`/api/v1/snippets/${id}`);
}

// ─── Lesson Progress API ──────────────────────────────────────────────────────

export async function upsertLessonProgress(data: UpsertProgressRequest): Promise<LessonProgressDto> {
  const res = await post<ApiResponse<LessonProgressDto>>("/api/v1/lesson-progress", data);
  return res.data;
}

export async function markLessonComplete(userId: number, lessonId: number): Promise<LessonProgressDto> {
  const res = await post<ApiResponse<LessonProgressDto>>(
    `/api/v1/lesson-progress/complete?userId=${userId}&lessonId=${lessonId}`
  );
  return res.data;
}

export async function getLessonProgress(userId: number, lessonId: number): Promise<LessonProgressDto | null> {
  try {
    const data = await get<ApiResponse<LessonProgressDto>>(
      `/api/v1/lesson-progress?userId=${userId}&lessonId=${lessonId}`,
      0
    );
    return data.data;
  } catch {
    return null;
  }
}

export async function getUserProgress(userId: number): Promise<LessonProgressDto[]> {
  const data = await get<ApiResponse<LessonProgressDto[]>>(`/api/v1/lesson-progress/user/${userId}`, 0);
  return data.data;
}

export async function getUserCompletedCount(userId: number): Promise<number> {
  const data = await get<ApiResponse<number>>(`/api/v1/lesson-progress/user/${userId}/completed-count`, 0);
  return data.data;
}

export async function getCourseProgress(courseId: number, userId: number): Promise<number> {
  const data = await get<ApiResponse<number>>(
    `/api/v1/lesson-progress/course/${courseId}/user/${userId}/completed-count`,
    0
  );
  return data.data;
}

// ─── Course PDF Export API ────────────────────────────────────────────────────

export async function getCoursePdfExport(courseId: number): Promise<CoursePdfExportDto | null> {
  try {
    const data = await get<ApiResponse<CoursePdfExportDto>>(`/api/v1/course-pdf-exports/course/${courseId}`);
    return data.data;
  } catch {
    return null;
  }
}

export async function incrementPdfDownload(courseId: number): Promise<CoursePdfExportDto> {
  const res = await post<ApiResponse<CoursePdfExportDto>>(`/api/v1/course-pdf-exports/course/${courseId}/download`);
  return res.data;
}

export async function deletePdfExport(courseId: number): Promise<void> {
  await del(`/api/v1/course-pdf-exports/course/${courseId}`);
}

// ─── Users API (Admin) ────────────────────────────────────────────────────────

export async function fetchUsers(page = 0, size = 20): Promise<PageResponse<UserDto>> {
  const data = await get<ApiResponse<PageResponse<UserDto>>>(`/api/v1/users?page=${page}&size=${size}`, 0);
  return data.data;
}

export async function fetchUserById(id: number): Promise<UserDto> {
  const data = await get<ApiResponse<UserDto>>(`/api/v1/users/${id}`, 0);
  return data.data;
}

// ─── Dashboard Stats (computed from various endpoints) ────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const emptyUserPage: PageResponse<UserDto> = {
    content: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  };
  const emptyCoursePage: PageResponse<CourseDto> = {
    content: [],
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  };

  const [usersPage, coursesPage] = await Promise.all([
    fetchUsers(0, 10).catch(() => emptyUserPage),
    fetchCourses(0, 10).catch(() => emptyCoursePage),
  ]);

  return {
    totalUsers: usersPage.totalElements || usersPage.content.length,
    totalCourses: coursesPage.totalElements || coursesPage.content.length,
    totalEnrollments: coursesPage.content.reduce((acc, c) => acc + (c.enrolledCount || 0), 0),
    totalLessons: coursesPage.content.reduce((acc, c) => acc + (c.totalLessons || 0), 0),
    recentUsers: usersPage.content.slice(0, 5),
    popularCourses: coursesPage.content.slice(0, 5),
    userGrowth: [],
    enrollmentTrend: [],
  };
}
