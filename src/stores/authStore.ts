import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from 'firebase/auth'
import type { Member } from '@/types'

interface AuthState {
  user: User | null
  member: Member | null
  isLoading: boolean
  isAdmin: boolean
  // Actions
  setUser: (user: User | null) => void
  setMember: (member: Member | null) => void
  setIsLoading: (loading: boolean) => void
  setIsAdmin: (isAdmin: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      member: null,
      isLoading: true,
      isAdmin: false,

      setUser: (user) => set({ user }, false, 'auth/setUser'),

      setMember: (member) => set({ member }, false, 'auth/setMember'),

      setIsLoading: (isLoading) =>
        set({ isLoading }, false, 'auth/setIsLoading'),

      setIsAdmin: (isAdmin) => set({ isAdmin }, false, 'auth/setIsAdmin'),

      clearAuth: () =>
        set(
          { user: null, member: null, isAdmin: false, isLoading: false },
          false,
          'auth/clearAuth'
        ),
    }),
    { name: 'AuthStore' }
  )
)