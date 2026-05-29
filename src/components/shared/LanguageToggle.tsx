'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { updateMember } from '@/lib/firebase/firestore'
import { cn } from '@/lib/utils/cn'

interface LanguageToggleProps {
  variant?: 'pill' | 'button'
}

export function LanguageToggle({ variant = 'pill' }: LanguageToggleProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { setLocale } = useUIStore()

  const switchLocale = async (newLocale: 'en' | 'bn') => {
    if (newLocale === locale) return

    setLocale(newLocale)

    // Persist to Firestore if logged in
    if (user?.uid) {
      try {
        await updateMember(user.uid, { preferredLocale: newLocale } as never)
      } catch {
        // Non-blocking — locale already saved to localStorage via Zustand persist
      }
    }

    // Navigate to same path with new locale
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  if (variant === 'pill') {
    return (
      <div
        role="group"
        aria-label="Language selection"
        className="flex items-center rounded-full border border-zinc-200 bg-zinc-50 p-0.5"
      >
        {(['en', 'bn'] as const).map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            aria-pressed={locale === loc}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold transition-all',
              locale === loc
                ? 'bg-white text-primary-700 shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:text-zinc-700'
            )}
          >
            {loc === 'en' ? 'EN' : 'বাং'}
          </button>
        ))}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => switchLocale(locale === 'bn' ? 'en' : 'bn')}
      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
    >
      {locale === 'bn' ? 'English' : 'বাংলা'}
    </button>
  )
}