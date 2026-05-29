'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Settings,
  ChevronLeft,
  LogOut,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { signOutUser } from '@/lib/firebase/auth'
import { subscribePendingApprovals } from '@/lib/firebase/admin-firestore'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface NavItem {
  key: string
  href: string
  icon: React.ElementType
  badgeCount?: number
}

export function AdminSidebar() {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { member, clearAuth } = useAuthStore()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const unsub = subscribePendingApprovals((members) => {
      setPendingCount(members.length)
    })
    return () => unsub()
  }, [])

  const navItems: NavItem[] = [
    { key: 'admin.dashboard', href: `/${locale}/admin/dashboard`, icon: LayoutDashboard },
    {
      key: 'admin.payments',
      href: `/${locale}/admin/payments`,
      icon: CreditCard,
      badgeCount: pendingCount,
    },
    { key: 'admin.members', href: `/${locale}/admin/members`, icon: Users },
    { key: 'admin.settings', href: `/${locale}/admin/settings`, icon: Settings },
  ]

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
    <aside
      className="fixed left-0 top-0 h-full w-60 bg-zinc-900 text-white flex flex-col z-30"
      aria-label="Admin navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">MedConnect BD</p>
          <p className="text-xs text-white/50">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">
                {t(item.key as Parameters<typeof t>[0])}
              </span>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs font-bold px-1">
                  {item.badgeCount > 99 ? '99+' : item.badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Member footer */}
      {member && (
        <div className="border-t border-white/10 p-3 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2.5">
            <ProfileAvatar
              base64={member.profilePhotoBase64}
              name={member.fullName}
              size="xs"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{member.fullName}</p>
              <p className="text-xs text-white/40">{t('admin.adminRole')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={14} />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </aside>
  )
}