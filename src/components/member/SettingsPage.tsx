'use client'

import { useTranslations } from 'next-intl'

export function SettingsPage() {
  const t = useTranslations()
  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-2xl font-semibold text-zinc-900">{t('nav.settings')}</h1>
    </div>
  )
}