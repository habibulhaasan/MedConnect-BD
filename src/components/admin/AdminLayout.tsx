'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { AdminSidebar } from './AdminSidebar'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    if (isLoading) return
    if (!user || !isAdmin) {
      router.push(`/${locale}/home`)
    }
  }, [user, isAdmin, isLoading, router, locale])

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <div className="w-60 bg-zinc-900 flex-shrink-0" />
        <div className="flex-1 p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <AdminSidebar />
      <main className="flex-1 ml-60 p-6 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}