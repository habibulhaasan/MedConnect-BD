'use client'

import { useTranslations } from 'next-intl'

export function AdminDashboardPage() {
  const t = useTranslations('admin')
  return <h1 className="text-2xl font-semibold text-zinc-900">{t('dashboard')}</h1>
}