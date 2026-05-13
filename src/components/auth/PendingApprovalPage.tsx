'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, ShieldCheck, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import { getPaymentSubmission } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { signOutUser } from '@/lib/firebase/auth'

// ── Visual status stepper ──────────────────────────────────────────────────
interface PendingStep {
  key: string
  labelEn: string
  labelBn: string
  icon: React.ElementType
  done: boolean
  current: boolean
}

function StatusStepper({ steps }: { steps: PendingStep[] }) {
  return (
    <div className="flex items-start justify-between w-full">
      {steps.map((step, i) => {
        const Icon = step.icon
        const isLast = i === steps.length - 1
        return (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Left connector */}
              {i > 0 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 transition-colors',
                    steps[i - 1].done ? 'bg-primary-500' : 'bg-zinc-200'
                  )}
                />
              )}

              {/* Circle */}
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all',
                  step.done
                    ? 'bg-primary-600 text-white ring-2 ring-primary-200'
                    : step.current
                    ? 'bg-amber-400 text-white ring-2 ring-amber-100'
                    : 'bg-zinc-100 text-zinc-400'
                )}
              >
                {step.done ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Icon size={16} />
                )}
              </div>

              {/* Right connector */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 transition-colors',
                    step.done ? 'bg-primary-500' : 'bg-zinc-200'
                  )}
                />
              )}
            </div>

            {/* Label */}
            <div className="mt-2 text-center px-1">
              <p
                className={cn(
                  'text-xs font-medium leading-tight',
                  step.done
                    ? 'text-primary-700'
                    : step.current
                    ? 'text-amber-700'
                    : 'text-zinc-400'
                )}
              >
                <span className="block">{step.labelEn}</span>
                <span className="block font-bangla">{step.labelBn}</span>
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export function PendingApprovalPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { user, member, clearAuth } = useAuthStore()

  const [trxId, setTrxId] = useState<string | null>(null)
  const [loadingTrx, setLoadingTrx] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setLoadingTrx(false)
      return
    }
    getPaymentSubmission(user.uid)
      .then((p) => setTrxId(p?.bkashTrxId ?? null))
      .catch(() => setTrxId(null))
      .finally(() => setLoadingTrx(false))
  }, [user?.uid])

  const handleLogout = async () => {
    await signOutUser()
    clearAuth()
    router.push(`/${locale}/login`)
  }

  // Determine current status stage
  const isPaymentSubmitted = !!member && member.status !== 'pending_payment'
  const isUnderReview = !!member && member.status === 'pending_approval'

  const steps: PendingStep[] = [
    {
      key: 'registered',
      labelEn: 'Registered',
      labelBn: 'নিবন্ধিত',
      icon: CheckCircle2,
      done: true,
      current: false,
    },
    {
      key: 'payment',
      labelEn: 'Payment Sent',
      labelBn: 'পেমেন্ট',
      icon: CheckCircle2,
      done: isPaymentSubmitted,
      current: !isPaymentSubmitted,
    },
    {
      key: 'review',
      labelEn: 'Under Review',
      labelBn: 'যাচাই',
      icon: Clock,
      done: false,
      current: isUnderReview,
    },
    {
      key: 'approved',
      labelEn: 'Approved',
      labelBn: 'অনুমোদিত',
      icon: ShieldCheck,
      done: false,
      current: false,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Status card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock size={22} className="text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base text-amber-900">
                {t('registration.pendingTitle')}
              </CardTitle>
              <p className="font-bangla text-sm text-amber-700 mt-0.5">
                আপনার পেমেন্ট যাচাই করা হচ্ছে
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-amber-800">
            {t('registration.pendingDesc')}
          </p>
          <p className="text-xs text-amber-600 font-medium">
            ⏱ {t('registration.pendingEta')} —{' '}
            <span className="font-bangla">সাধারণত ২৪ ঘন্টার মধ্যে</span>
          </p>
        </CardContent>
      </Card>

      {/* Status stepper */}
      <Card className="border-zinc-100 shadow-sm">
        <CardContent className="pt-6 pb-5 px-4">
          <StatusStepper steps={steps} />
        </CardContent>
      </Card>

      {/* Submitted TrxID */}
      <Card className="border-zinc-100 shadow-sm">
        <CardContent className="pt-5 pb-5 space-y-3">
          <p className="text-sm font-medium text-zinc-700">
            {t('payment.trxIdLabel')}
          </p>
          {loadingTrx ? (
            <Skeleton className="h-8 w-40" />
          ) : trxId ? (
            <p className="font-mono text-lg font-bold text-zinc-900 tracking-wider bg-zinc-50 rounded-lg px-3 py-2 inline-block">
              {trxId}
            </p>
          ) : (
            <p className="text-sm text-zinc-400">{t('payment.noTrxFound')}</p>
          )}

          <p className="text-xs text-zinc-500">
            {t('registration.pendingMessage')}
          </p>
        </CardContent>
      </Card>

      {/* Support & logout */}
      <div className="flex flex-col gap-2">
        
          href="mailto:support@medconnectbd.com"
          className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:underline"
        >
          <MessageSquare size={14} />
          {t('registration.contactSupport')}
        </a>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-zinc-400 hover:text-zinc-600 text-xs"
        >
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  )
}