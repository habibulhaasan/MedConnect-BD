'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2, XCircle, CreditCard, UserPlus, Loader2 } from 'lucide-react'
import { subscribeRecentActivity } from '@/lib/firebase/admin-firestore'
import { formatDateTime } from '@/lib/utils/format'
import type { PaymentSubmission } from '@/types'
import { cn } from '@/lib/utils/cn'

const STATUS_CONFIG = {
  submitted: {
    icon: CreditCard,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    labelKey: 'admin.activityPaymentSubmitted',
  },
  verified: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bg: 'bg-green-50',
    labelKey: 'admin.activityPaymentVerified',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    labelKey: 'admin.activityPaymentRejected',
  },
} as const

export function ActivityFeed() {
  const t = useTranslations()
  const locale = useLocale()
  const [activities, setActivities] = useState<PaymentSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeRecentActivity((payments) => {
      setActivities(payments)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {t('admin.noActivity')}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {activities.map((act) => {
        const cfg = STATUS_CONFIG[act.status]
        const Icon = cfg.icon
        return (
          <div
            key={act.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', cfg.bg)}>
              <Icon size={15} className={cfg.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 truncate">
                {act.memberName}
              </p>
              <p className="text-xs text-zinc-500">
                {t(cfg.labelKey as Parameters<typeof t>[0])} — TrxID:{' '}
                <span className="font-mono font-semibold">{act.bkashTrxId}</span>
              </p>
            </div>
            <span className="text-xs text-zinc-400 flex-shrink-0 mt-0.5">
              {formatDateTime(act.submittedAt, locale as 'en' | 'bn')}
            </span>
          </div>
        )
      })}
    </div>
  )
}