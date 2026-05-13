'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, Globe } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { signOutUser } from '@/lib/firebase/auth'
import { getInitials } from '@/lib/utils/format'

export function TopBar() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { member, clearAuth } = useAuthStore()
  const { setLocale } = useUIStore()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOutUser()
      clearAuth()
      router.push(`/${locale}/login`)
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

  const handleLocaleSwitch = () => {
    const newLocale = locale === 'bn' ? 'en' : 'bn'
    setLocale(newLocale)
    router.push(`/${newLocale}/home`)
  }

  return (
    <>
      <header className="bg-white border-b border-zinc-100 px-4 md:px-6 py-3 flex items-center justify-between">
        {/* App name on mobile */}
        <div className="md:hidden font-semibold text-zinc-900 text-sm">
          MedConnect BD
        </div>

        <div className="hidden md:block" /> {/* Spacer */}

        <div className="flex items-center gap-2">
          {/* Locale switcher */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLocaleSwitch}
            aria-label={`Switch to ${locale === 'bn' ? 'English' : 'Bangla'}`}
            className="text-zinc-500 hover:text-zinc-900 gap-1.5"
          >
            <Globe size={15} />
            <span className="text-xs font-medium">{locale === 'bn' ? 'EN' : 'বাং'}</span>
          </Button>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="User menu"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member?.profilePhotoBase64} alt={member?.fullName} />
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
                    {member?.fullName ? getInitials(member.fullName) : '?'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {member?.fullName}
                </p>
                <p className="text-xs text-zinc-500 truncate">{member?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLogoutDialogOpen(true)}
                className="text-destructive focus:text-destructive gap-2"
              >
                <LogOut size={14} />
                {t('nav.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
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