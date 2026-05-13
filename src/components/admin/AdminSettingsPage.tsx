'use client'

import { useTranslations } from 'next-intl'

export function AdminSettingsPage() {
  const t = useTranslations('admin')
  return <h1 className="text-2xl font-semibold text-zinc-900">{t('settings')}</h1>
}