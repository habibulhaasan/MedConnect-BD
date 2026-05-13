import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Locale } from '@/types'

interface UIState {
  locale: Locale
  sidebarOpen: boolean
  // Actions
  setLocale: (locale: Locale) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        locale: 'bn',
        sidebarOpen: false,

        setLocale: (locale) => set({ locale }, false, 'ui/setLocale'),

        setSidebarOpen: (sidebarOpen) =>
          set({ sidebarOpen }, false, 'ui/setSidebarOpen'),

        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            'ui/toggleSidebar'
          ),
      }),
      {
        name: 'medconnect-ui',
        partialize: (state) => ({ locale: state.locale }),
      }
    ),
    { name: 'UIStore' }
  )
)