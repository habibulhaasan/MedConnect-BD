'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push(`/${locale}/login`)
      return
    }

    if (!member) return

    if (
      (member.status === 'pending_payment' || member.status === 'pending_approval') &&
      !pathname.includes('/register/pending')
    ) {
      router.push(`/${locale}/register/pending`)
      return
    }

    if (member.status === 'suspended') {
      router.push(`/${locale}/suspended`)
    }
  }, [user, member, isLoading, router, locale, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex flex-col w-60 bg-white border-r border-zinc-100 p-4 gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="space-y-1 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 flex flex-col">
          <Skeleton className="h-14 w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!user || !member || member.status !== 'active') return null

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