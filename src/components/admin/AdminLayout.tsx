'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { signOutUser } from '@/lib/firebase/auth'
import { AdminSidebar } from './AdminSidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth()
  const { clearAuth } = useAuthStore()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const [logoutOpen, setLogoutOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user || !isAdmin) {
      router.push(`/${locale}/home`)
    }
  }, [user, isAdmin, isLoading, router, locale])

  const handleLogout = async () => {
    try {
      await signOutUser()
      clearAuth()
      router.push(`/${locale}/login`)
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

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
    <>
      <div className="min-h-screen bg-zinc-50 flex">
        <AdminSidebar />
        <div className="flex-1 ml-60 flex flex-col">
          <div className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div />
            <button
              onClick={() => setLogoutOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut size={16} />
              {t('nav.logout')}
            </button>
          </div>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('nav.logout')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('auth.logoutConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {t('nav.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}