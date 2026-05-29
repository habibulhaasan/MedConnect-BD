'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MembersEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export function MembersEmptyState({
  hasFilters,
  onClearFilters,
}: MembersEmptyStateProps) {
  const t = useTranslations('members')

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center">
        <Users size={36} className="text-zinc-300" />
      </div>
      <div className="space-y-1 max-w-xs">
        <p className="font-semibold text-zinc-700">{t('noMembers')}</p>
        <p className="text-sm text-zinc-500">{t('noMembersHint')}</p>
      </div>
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="mt-2"
        >
          {t('clearFilters')}
        </Button>
      )}
    </div>
  )
}