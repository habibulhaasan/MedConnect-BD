'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Home, Users, Heart, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { key: 'home', icon: Home },
  { key: 'members', icon: Users },
  { key: 'favorites', icon: Heart },
  { key: 'profile', icon: User },
  { key: 'settings', icon: Settings },
] as const

export function BottomNav() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 safe-area-pb"
      aria-label="Mobile navigation"
    >
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const href = `/${locale}/${item.key}`
          const isActive = pathname.startsWith(href)
          const Icon = item.icon

          return (
            <Link
              key={item.key}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]',
                'text-xs font-medium transition-colors',
                isActive ? 'text-primary-600' : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn(
                  'transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span className={cn('leading-none', isActive && 'font-semibold')}>
                {t(item.key as Parameters<typeof t>[0])}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}