'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  Home,
  Users,
  Heart,
  User,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { DesignationBadge } from '@/components/shared/DesignationBadge'
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
  const { member, isAdmin } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

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
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-full flex-col bg-white border-r border-zinc-100 z-30',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-14 border-b border-zinc-100 px-3 flex-shrink-0',
          collapsed ? 'justify-center' : 'gap-2.5 px-4'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-base leading-none">M</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-primary-800 text-sm leading-tight truncate">
              MedConnect BD
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? t(item.key as Parameters<typeof t>[0]) : undefined}
              className={cn(
                'flex items-center rounded-xl transition-all duration-150',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                item.adminOnly && 'border border-dashed border-zinc-200'
              )}
            >
              <Icon
                size={20}
                className={cn(
                  'flex-shrink-0',
                  isActive ? 'text-primary-600' : 'text-zinc-400'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">
                  {t(item.key as Parameters<typeof t>[0])}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Member info footer */}
      {member && !collapsed && (
        <div className="border-t border-zinc-100 p-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <ProfileAvatar
              base64={member.profilePhotoBase64}
              name={member.fullName}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-800 truncate">
                {member.fullName}
              </p>
              <DesignationBadge designation={member.designation} size="sm" />
            </div>
          </div>
        </div>
      )}

      {collapsed && member && (
        <div className="border-t border-zinc-100 p-2 flex justify-center flex-shrink-0">
          <ProfileAvatar
            base64={member.profilePhotoBase64}
            name={member.fullName}
            size="xs"
          />
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'absolute -right-3 top-16 w-6 h-6 rounded-full bg-white border border-zinc-200',
          'flex items-center justify-center shadow-sm',
          'hover:bg-zinc-50 transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-primary-500 focus-visible:ring-offset-1'
        )}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-zinc-500" />
        ) : (
          <ChevronLeft size={12} className="text-zinc-500" />
        )}
      </button>
    </aside>
  )
}