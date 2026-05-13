'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
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

    if (member.status === 'pending_payment' || member.status === 'pending_approval') {
      if (!pathname.includes('/register/pending')) {
        router.push(`/${locale}/register/pending`)
      }
      return
    }

    if (member.status === 'suspended') {
      router.push(`/${locale}/suspended`)
    }
  }, [user, member, isLoading, router, locale, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex">
        <div className="w-64 bg-white border-r border-zinc-100 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!user || !member || member.status !== 'active') return null

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 overflow-auto" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}