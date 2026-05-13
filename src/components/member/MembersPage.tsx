'use client'

import { useTranslations } from 'next-intl'

export function MembersPage() {
  const t = useTranslations()
  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-2xl font-semibold text-zinc-900">{t('members.title')}</h1>
    </div>
  )
}