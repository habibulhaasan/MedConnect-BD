'use client'

import { BadgeCheck } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslations } from 'next-intl'

interface VerifiedBadgeProps {
  size?: number
}

export function VerifiedBadge({ size = 18 }: VerifiedBadgeProps) {
  const t = useTranslations('common')

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="img"
            aria-label={t('verified')}
            className="inline-flex items-center cursor-default"
          >
            <BadgeCheck
              size={size}
              className="text-green-500 fill-green-100"
              strokeWidth={1.5}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {t('verifiedMember')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}