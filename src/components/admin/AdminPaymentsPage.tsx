'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { VerifyPaymentModal } from './VerifyPaymentModal'
import { PaymentRow } from './PaymentRow'
import { subscribeAllPayments, getPaymentForMember } from '@/lib/firebase/admin-firestore'
import { getMember } from '@/lib/firebase/firestore'
import { useAppConfig } from '@/hooks/useAppConfig'
import type { PaymentSubmission, Member } from '@/types'

type TabValue = 'all' | 'submitted' | 'verified' | 'rejected'

export function AdminPaymentsPage() {
  const t = useTranslations()
  const { config } = useAppConfig()
  const [payments, setPayments] = useState<PaymentSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabValue>('submitted')
  const [search, setSearch] = useState('')
  const [verifyTarget, setVerifyTarget] = useState<{
    member: Member
    payment: PaymentSubmission
  } | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const unsub = subscribeAllPayments('all', (p) => {
      setPayments(p)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    let result = activeTab === 'all'
      ? payments
      : payments.filter((p) => p.status === activeTab)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.memberName.toLowerCase().includes(q) ||
          p.bkashTrxId.toLowerCase().includes(q) ||
          p.mobile.includes(q) ||
          p.bkashSenderNumber.includes(q)
      )
    }
    return result
  }, [payments, activeTab, search])

  const counts = useMemo(() => ({
    all: payments.length,
    submitted: payments.filter((p) => p.status === 'submitted').length,
    verified: payments.filter((p) => p.status === 'verified').length,
    rejected: payments.filter((p) => p.status === 'rejected').length,
  }), [payments])

  const handleVerifyClick = async (payment: PaymentSubmission) => {
    try {
      const member = await getMember(payment.uid)
      if (member) setVerifyTarget({ member, payment })
    } catch {
      // silently fail — rare
    }
  }

  const handleVerifyDone = () => setVerifyTarget(null)

  const tabItems: { value: TabValue; labelKey: string }[] = [
    { value: 'submitted', labelKey: 'payment.status.submitted' },
    { value: 'verified', labelKey: 'payment.status.verified' },
    { value: 'rejected', labelKey: 'payment.status.rejected' },
    { value: 'all', labelKey: 'admin.all' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t('admin.payments')}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{t('admin.paymentsSubtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList className="bg-zinc-100">
            {tabItems.map(({ value, labelKey }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5 text-xs sm:text-sm">
                {t(labelKey as Parameters<typeof t>[0])}
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs min-w-[18px] h-[18px] px-1 flex items-center justify-center',
                    value === 'submitted' && counts.submitted > 0 && 'bg-amber-100 text-amber-700',
                    value === 'verified' && 'bg-green-100 text-green-700',
                    value === 'rejected' && 'bg-red-100 text-red-700'
                  )}
                >
                  {counts[value]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.searchPayments')}
              className="pl-8 h-9 text-sm w-[220px]"
            />
          </div>
        </div>

        {(['all', 'submitted', 'verified', 'rejected'] as TabValue[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                {t('admin.noPayments')}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((payment) => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onVerify={() => handleVerifyClick(payment)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <VerifyPaymentModal
        open={!!verifyTarget}
        member={verifyTarget?.member ?? null}
        payment={verifyTarget?.payment ?? null}
        registrationFee={config?.registrationFee ?? 500}
        onClose={handleVerifyDone}
        onApproved={handleVerifyDone}
        onRejected={handleVerifyDone}
      />
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}