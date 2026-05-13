'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
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
      <div className="min-h-screen p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}