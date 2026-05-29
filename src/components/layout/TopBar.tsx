'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
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
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { useAuthStore } from '@/stores/authStore'
import { signOutUser } from '@/lib/firebase/auth'
import Link from 'next/link'

export function TopBar() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { member, clearAuth } = useAuthStore()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOutUser()
      clearAuth()
      router.push(`/${locale}/login`)
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 h-14 bg-white border-b border-zinc-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        {/* Mobile: app name */}
        <div className="md:hidden">
          <span className="font-bold text-primary-800 text-sm">MedConnect BD</span>
        </div>

        {/* Desktop: spacer (sidebar handles logo) */}
        <div className="hidden md:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageToggle variant="pill" />

          {member && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="User menu"
                  className="flex items-center gap-2 rounded-full pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <ProfileAvatar
                    base64={member.profilePhotoBase64}
                    name={member.fullName}
                    size="xs"
                  />
                  <span className="hidden sm:block text-sm font-medium text-zinc-700 max-w-[120px] truncate">
                    {member.fullName}
                  </span>
                  <ChevronDown size={14} className="text-zinc-400 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-2 border-b border-zinc-100 mb-1">
                  <p className="text-sm font-semibold text-zinc-900 truncate">
                    {member.fullName}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{member.mobile}</p>
                </div>

                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/profile`} className="gap-2 cursor-pointer">
                    <UserIcon size={14} />
                    {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setLogoutOpen(true)}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut size={14} />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

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