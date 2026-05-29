'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

export function LocaleSwitcherButton() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { setLocale } = useUIStore()

  const handleSwitch = () => {
    const newLocale = locale === 'bn' ? 'en' : 'bn'
    setLocale(newLocale)

    // Replace locale segment in current path
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      aria-label={locale === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200 bg-white/80 text-primary-700 text-sm font-medium hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <Globe size={14} />
      {locale === 'bn' ? 'EN' : 'বাং'}
    </button>
  )
}