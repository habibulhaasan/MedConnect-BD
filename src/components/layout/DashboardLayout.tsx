'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, member, isLoading } = useAuth()
  const pathname = usePathname()

  // No automatic redirects here – authentication handling is done in individual pages.

  // Show a simple loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Skeleton className="h-14 w-48 rounded-xl" />
      </div>
    )
  }

  // If we are on the home page, render only the page content (no sidebar/topbar/nav)
  if (pathname.includes('/home')) {
    return <>{children}</>
  }

  // Default layout with navigation components
  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-60">
        <TopBar />
        <main
          id="main-content"
          className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-auto"
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

