'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Home, Users, Heart, User, Settings, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  key: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
}

export function Sidebar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const { isAdmin } = useAuthStore()
  const { sidebarOpen } = useUIStore()

  const navItems: NavItem[] = [
    { key: 'home', href: `/${locale}/home`, icon: Home },
    { key: 'members', href: `/${locale}/members`, icon: Users },
    { key: 'favorites', href: `/${locale}/favorites`, icon: Heart },
    { key: 'profile', href: `/${locale}/profile`, icon: User },
    { key: 'settings', href: `/${locale}/settings`, icon: Settings },
    ...(isAdmin
      ? [{ key: 'admin', href: `/${locale}/admin/dashboard`, icon: ShieldCheck, adminOnly: true }]
      : []),
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 bg-white border-r border-zinc-100 py-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="px-4 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-zinc-900 text-sm leading-tight">
              MedConnect BD
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                  item.adminOnly && 'border border-dashed border-zinc-200'
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    isActive ? 'text-primary-600' : 'text-zinc-400'
                  )}
                />
                {t(item.key as Parameters<typeof t>[0])}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 flex z-50"
        aria-label="Mobile navigation"
      >
        {navItems.filter((i) => !i.adminOnly).map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary-600' : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <Icon size={20} />
              <span>{t(item.key as Parameters<typeof t>[0])}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}