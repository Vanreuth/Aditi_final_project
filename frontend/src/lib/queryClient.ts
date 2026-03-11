import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime          : 1000 * 60 * 5, // 5 min — data stays fresh
      // Never auto-retry 401s — auth errors are handled by AuthContext/interceptor.
      // Retrying a 401 re-triggers the refresh cycle and contributes to the loop.
      retry: (failureCount, error) => {
        if ((error as { response?: { status?: number } })?.response?.status === 401) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
  },
})
