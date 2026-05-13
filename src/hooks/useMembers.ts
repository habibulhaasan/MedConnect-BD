'use client'

import { useState, useCallback } from 'react'
import { getActiveMembers } from '@/lib/firebase/firestore'
import type { Member, MemberFilters, PaginationCursor } from '@/types'

const PAGE_SIZE = 20

const DEFAULT_CURSOR: PaginationCursor = {
  lastDoc: null,
  hasMore: true,
  pageSize: PAGE_SIZE,
}

interface UseMembersReturn {
  members: Member[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  filters: MemberFilters
  setFilters: (filters: MemberFilters) => void
  loadMore: () => Promise<void>
  reset: () => void
}

export function useMembers(): UseMembersReturn {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<PaginationCursor>(DEFAULT_CURSOR)
  const [filters, setFiltersState] = useState<MemberFilters>({})

  const fetchMembers = useCallback(
    async (activeFilters: MemberFilters, activeCursor: PaginationCursor, append: boolean) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getActiveMembers(activeFilters, activeCursor)
        setMembers((prev) => (append ? [...prev, ...result.data] : result.data))
        setCursor(result.cursor)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'errors.networkError')
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const setFilters = useCallback(
    (newFilters: MemberFilters) => {
      setFiltersState(newFilters)
      const freshCursor = { ...DEFAULT_CURSOR }
      fetchMembers(newFilters, freshCursor, false)
    },
    [fetchMembers]
  )

  const loadMore = useCallback(async () => {
    if (!cursor.hasMore || isLoading) return
    await fetchMembers(filters, cursor, true)
  }, [cursor, isLoading, filters, fetchMembers])

  const reset = useCallback(() => {
    setMembers([])
    setCursor(DEFAULT_CURSOR)
    setFiltersState({})
    fetchMembers({}, DEFAULT_CURSOR, false)
  }, [fetchMembers])

  return { members, isLoading, error, hasMore: cursor.hasMore, filters, setFilters, loadMore, reset }
}