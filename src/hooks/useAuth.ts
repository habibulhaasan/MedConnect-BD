'use client'

import { useEffect } from 'react'
import { onAuthStateChange } from '@/lib/firebase/auth'
import { getMember } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { user, member, isLoading, isAdmin, setUser, setMember, setIsLoading, setIsAdmin, clearAuth } =
    useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (!firebaseUser) {
        clearAuth()
        return
      }

      setUser(firebaseUser)
      setIsLoading(true)

      try {
        // Check admin claim from ID token
        const idTokenResult = await firebaseUser.getIdTokenResult()
        setIsAdmin(!!idTokenResult.claims.admin)

        // Fetch member profile
        const memberData = await getMember(firebaseUser.uid)
        setMember(memberData)
      } catch {
        setMember(null)
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, member, isLoading, isAdmin }
}