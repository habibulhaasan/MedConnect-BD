'use client'

import { useState, useCallback } from 'react'
import { getMember, updateMember } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import type { Member } from '@/types'

interface UseMemberReturn {
  member: Member | null
  isLoading: boolean
  error: string | null
  refreshMember: () => Promise<void>
  updateProfile: (data: Partial<Member>) => Promise<void>
}

export function useMember(): UseMemberReturn {
  const { user, member, setMember } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshMember = useCallback(async () => {
    if (!user?.uid) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMember(user.uid)
      setMember(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'errors.networkError')
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid, setMember])

  const updateProfile = useCallback(
    async (data: Partial<Member>) => {
      if (!user?.uid) throw new Error('errors.unauthorized')
      setIsLoading(true)
      setError(null)
      try {
        await updateMember(user.uid, data)
        await refreshMember()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'errors.networkError'
        setError(message)
        throw new Error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [user?.uid, refreshMember]
  )

  return { member, isLoading, error, refreshMember, updateProfile }
}