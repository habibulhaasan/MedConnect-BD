'use client'

import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/stores/authStore'

export function HomePage() {
  const t = useTranslations()
  const { member } = useAuthStore()

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {t('nav.home')}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">{t('common.tagline')}</p>
      </div>
      {/* Phase 2 will fill this */}
    </div>
  )
}