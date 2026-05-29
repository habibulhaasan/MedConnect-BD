'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAppConfig } from '@/lib/firebase/firestore'
import type { AppConfig } from '@/types'

interface UseAppConfigReturn {
  config: AppConfig | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Module-level cache — shared across all hook instances
let cachedConfig: AppConfig | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function useAppConfig(): UseAppConfigReturn {
  const [config, setConfig] = useState<AppConfig | null>(cachedConfig)
  const [isLoading, setIsLoading] = useState(!cachedConfig)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && cachedConfig && now - cacheTimestamp < CACHE_TTL_MS) {
      setConfig(cachedConfig)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await getAppConfig()
      cachedConfig = data
      cacheTimestamp = Date.now()
      setConfig(data)
    } catch {
      setError('errors.networkError')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { config, isLoading, error, refetch: () => fetch(true) }
}