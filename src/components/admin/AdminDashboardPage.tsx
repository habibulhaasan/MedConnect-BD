'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Users,
  CreditCard,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from './StatsCard'
import { ActivityFeed } from './ActivityFeed'
import { VerifyPaymentModal } from './VerifyPaymentModal'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { DesignationBadge } from '@/components/shared/DesignationBadge'
import { Badge } from '@/components/ui/badge'
import {
  subscribeAdminStats,
  subscribeRevenueStats,
  subscribePendingApprovals,
  getPaymentForMember,
  type AdminStats,
} from '@/lib/firebase/admin-firestore'
import { useAppConfig } from '@/hooks/useAppConfig'
import { formatDateTime } from '@/lib/utils/format'
import type { Member, PaymentSubmission } from '@/types'
import { cn } from '@/lib/utils/cn'

export function AdminDashboardPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { config } = useAppConfig()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [revenue, setRevenue] = useState(0)
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
  const [verifyTarget, setVerifyTarget] = useState<{
    member: Member
    payment: PaymentSubmission | null
  } | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const unsub1 = subscribeAdminStats((s) => {
      setStats(s)
      setStatsLoading(false)
    })
    const unsub2 = subscribeRevenueStats(
      config?.registrationFee ?? 500,
      setRevenue
    )
    const unsub3 = subscribePendingApprovals(setPendingMembers)
    return () => { unsub1(); unsub2(); unsub3() }
  }, [config?.registrationFee])

  const handleVerifyClick = async (member: Member) => {
    setIsLoadingPayment(true)
    try {
      const payment = await getPaymentForMember(member.uid)
      setVerifyTarget({ member, payment })
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const handleVerifyDone = () => {
    setVerifyTarget(null)
  }

  const designationKeys = [
    'mt_laboratory', 'mt_dental', 'mt_radiology',
    'mt_radiotherapy', 'mt_physiotherapy', 'pharmacist',
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t('admin.dashboard')}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{t('admin.dashboardSubtitle')}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          label={t('admin.activeMembers')}
          value={stats?.totalActive ?? 0}
          icon={Users}
          iconColor="text-primary-600"
          iconBg="bg-primary-50"
          isLoading={statsLoading}
        />
        <StatsCard
          label={t('admin.pendingPayments')}
          value={stats?.pendingApproval ?? 0}
          icon={CreditCard}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          badge={stats?.pendingApproval}
          badgeColor="bg-amber-500"
          isLoading={statsLoading}
          onClick={() => router.push(`/${locale}/admin/payments`)}
        />
        <StatsCard
          label={t('admin.pendingApprovals')}
          value={pendingMembers.length}
          icon={Clock}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          badge={pendingMembers.length}
          isLoading={statsLoading}
        />
        <StatsCard
          label={t('admin.totalRevenue')}
          value={`৳${revenue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          isLoading={statsLoading}
        />
        <StatsCard
          label={t('admin.newThisWeek')}
          value={stats?.newThisWeek ?? 0}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend="up"
          trendLabel={t('admin.thisWeek')}
          isLoading={statsLoading}
        />
        <StatsCard
          label={t('admin.verified')}
          value={stats?.totalActive ?? 0}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Urgent action queue */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">{t('admin.urgentQueue')}</h2>
            {pendingMembers.length > 0 && (
              <Badge className="bg-red-100 text-red-700 border-0">
                {pendingMembers.length} {t('admin.pending')}
              </Badge>
            )}
          </div>

          {pendingMembers.length === 0 ? (
            <Card className="border-zinc-100">
              <CardContent className="py-12 text-center">
                <CheckCircle2 size={32} className="text-green-300 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">{t('admin.noUrgentItems')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {pendingMembers.map((member) => (
                <Card key={member.uid} className="border-amber-100 bg-amber-50/40">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        base64={member.profilePhotoBase64}
                        name={member.fullName}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">
                          {member.fullName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <DesignationBadge designation={member.designation} size="sm" />
                          <span className="text-xs text-zinc-400">
                            {t(`divisions.${member.division}` as Parameters<typeof t>[0])}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {t('admin.submittedAt')}: {formatDateTime(member.updatedAt, locale as 'en' | 'bn')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVerifyClick(member)}
                        disabled={isLoadingPayment}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                          'bg-green-600 hover:bg-green-700 text-white',
                          'disabled:opacity-60 disabled:cursor-not-allowed'
                        )}
                      >
                        <CheckCircle2 size={13} />
                        {t('admin.verify')}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Designation breakdown */}
          <Card className="border-zinc-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t('admin.byDesignation')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {designationKeys.map((key) => {
                const count = stats?.byDesignation[key] ?? 0
                const total = stats?.totalActive ?? 1
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 truncate">
                        {t(`designations.${key}` as Parameters<typeof t>[0])}
                      </span>
                      <span className="font-semibold text-zinc-800 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Activity feed */}
          <Card className="border-zinc-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">{t('admin.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3">
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verify modal */}
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