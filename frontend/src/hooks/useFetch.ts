'use client'

/**
 * hooks/useFetch.ts
 *
 * Generic data-fetching hook for Client Components.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(
 *     () => fetchUsers({ page: 0 }),
 *     [page]           // re-fetch when these deps change
 *   )
 */

import { useState, useEffect, useCallback } from 'react'

export interface FetchState<T> {
  data   : T | null
  loading: boolean
  error  : Error | null
  refetch: () => void
}

/**
 * @param fetcher  Async function that returns the data. Re-created when `deps` change.
 * @param deps     Dependencies that trigger a re-fetch (default: run once on mount).
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  deps: unknown[] = []
): FetchState<T> {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error,   setError]   = useState<Error | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  // deps are spread intentionally — callers control when this re-runs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, refetch: run }
}
