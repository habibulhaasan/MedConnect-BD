import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import type { Designation } from '@/types'
import { MT_DESIGNATIONS } from '@/types'

interface DesignationBadgeProps {
  designation: Designation
  size?: 'sm' | 'md'
}

export function DesignationBadge({
  designation,
  size = 'md',
}: DesignationBadgeProps) {
  const t = useTranslations('designations')
  const isMT = MT_DESIGNATIONS.includes(designation)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        isMT
          ? 'bg-primary-50 text-primary-700 border-primary-200'
          : 'bg-purple-50 text-purple-700 border-purple-200'
      )}
    >
      {t(designation as Parameters<typeof t>[0])}
    </span>
  )
}