import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

interface QueueItem {
  resolve: (value: void) => void
  reject : (error: unknown) => void
}

let isRefreshing  = false
let failedQueue: QueueItem[] = []

function processQueue(error: unknown): void {
  failedQueue.forEach((item) => error ? item.reject(error) : item.resolve())
  failedQueue = []
}

const AUTH_PATHS = ['/login', '/register', '/forgot-password']
function isOnAuthPage(): boolean {
  if (typeof window === 'undefined') return false
  return AUTH_PATHS.some((p) => window.location.pathname.startsWith(p))
}

const httpClient: AxiosInstance = axios.create({
  baseURL        : '',
  withCredentials: true,
  headers        : { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
)

httpClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || original._retry || isOnAuthPage()) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<void>((resolve, reject) =>
        failedQueue.push({ resolve, reject })
      ).then(() => {
        // Mark as retried so a second 401 on this request doesn't trigger
        // another refresh cycle
        original._retry = true
        return httpClient(original)
      })
    }

    original._retry = true
    isRefreshing    = true

    try {
      // ✅ relative URL → Next.js proxy → localhost:8080 → SameSite=Lax works
      await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
      processQueue(null)
      return httpClient(original)
    } catch (refreshError) {
      processQueue(refreshError)
      // Do NOT do window.location.href here — it causes hard-reload races with
      // the AuthContext redirect logic and triggers the middleware canRefresh loop.
      // AuthContext / page-level guards handle navigation after auth failure.
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default httpClient