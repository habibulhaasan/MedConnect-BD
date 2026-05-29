'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/authStore'
import { getPaymentSubmission } from '@/lib/firebase/firestore'
import type { PaymentSubmission } from '@/types'
import { cn } from '@/lib/utils/cn'
import { formatDateTime } from '@/lib/utils/format'

type PendingStep = {
  id: string
  labelKey: string
  icon: React.ElementType
  statusKey: 'done' | 'active' | 'upcoming'
}

export function PendingPage() {
  const t = useTranslations()
  const locale = useLocale()
  const { user, member } = useAuthStore()
  const [payment, setPayment] = useState<PaymentSubmission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      setIsLoading(true)
      setLoadError(false)
      try {
        const p = await getPaymentSubmission(user.uid)
        setPayment(p)
      } catch {
        setLoadError(true)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.uid])

  const progressSteps: PendingStep[] = [
    {
      id: 'registered',
      labelKey: 'pending.stepRegistered',
      icon: CheckCircle2,
      statusKey: 'done',
    },
    {
      id: 'payment_submitted',
      labelKey: 'pending.stepPaymentSubmitted',
      icon: CheckCircle2,
      statusKey: payment ? 'done' : 'active',
    },
    {
      id: 'under_review',
      labelKey: 'pending.stepUnderReview',
      icon: Clock,
      statusKey: payment ? 'active' : 'upcoming',
    },
    {
      id: 'approved',
      labelKey: 'pending.stepApproved',
      icon: UserCheck,
      statusKey: 'upcoming',
    },
  ]

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Clock className="text-amber-600" size={32} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {t('pending.title')}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {t('pending.subtitle')}
          </p>
        </div>
      </div>

      {/* Status progress */}
      <Card className="border-zinc-100">
        <CardContent className="p-5">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-zinc-100" />

            <div className="space-y-5">
              {progressSteps.map((step) => {
                const Icon = step.icon
                const isDone = step.statusKey === 'done'
                const isActive = step.statusKey === 'active'

                return (
                  <div key={step.id} className="flex items-start gap-4 relative">
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                        isDone && 'bg-green-100',
                        isActive && 'bg-amber-100',
                        !isDone && !isActive && 'bg-zinc-100'
                      )}
                    >
                      {isActive ? (
                        <Loader2
                          size={16}
                          className="text-amber-600 animate-spin"
                        />
                      ) : (
                        <Icon
                          size={16}
                          className={cn(
                            isDone && 'text-green-600',
                            !isDone && !isActive && 'text-zinc-300'
                          )}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="pt-1">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isDone && 'text-green-700',
                          isActive && 'text-amber-700',
                          !isDone && !isActive && 'text-zinc-400'
                        )}
                      >
                        {t(step.labelKey as Parameters<typeof t>[0])}
                      </p>
                      {isActive && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {t('pending.processingTime')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment details */}
      <Card className="border-zinc-100">
        <CardContent className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-700">
            {t('pending.paymentDetails')}
          </h2>

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {loadError && !isLoading && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <AlertCircle size={14} />
              {t('errors.networkError')}
            </div>
          )}

          {!isLoading && payment && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">{t('admin.trxId')}</span>
                <span className="font-mono font-semibold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded text-xs">
                  {payment.bkashTrxId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">{t('payment.senderNumberLabel')}</span>
                <span className="font-medium text-zinc-700">{payment.bkashSenderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">{t('payment.amount')}</span>
                <span className="font-bold text-bkash">৳{payment.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">{t('admin.submittedAt')}</span>
                <span className="text-zinc-600 text-xs">
                  {formatDateTime(payment.submittedAt, locale as 'en' | 'bn')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">{t('common.status')}</span>
                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                  {t('payment.status.submitted')}
                </Badge>
              </div>
            </div>
          )}

          {!isLoading && !payment && !loadError && (
            <div className="text-sm text-zinc-500">{t('pending.noPaymentYet')}</div>
          )}
        </CardContent>
      </Card>

      {/* Info box */}
      <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 space-y-1">
        <p className="text-sm font-medium text-primary-800">{t('pending.whatNext')}</p>
        <p className="text-xs text-primary-600">{t('pending.whatNextDesc')}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          asChild
          variant="outline"
          className="w-full"
        >
          <Link href={`/${locale}/login`}>
            {t('auth.backToLogin')}
          </Link>
        </Button>

        <div className="text-center">
          <p className="text-xs text-zinc-500">
            {t('pending.needHelp')}{' '}
            <a
              href="mailto:support@medconnect.bd"
              className="text-primary-600 hover:underline inline-flex items-center gap-0.5"
            >
              {t('pending.contactSupport')}
              <ExternalLink size={10} />
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}