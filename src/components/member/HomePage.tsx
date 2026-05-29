'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  MapPin,
  Stethoscope,
  UserCog,
  Share2,
  Droplets,
  X,
  Megaphone,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import { DesignationBadge } from '@/components/shared/DesignationBadge'
import { useAuthStore } from '@/stores/authStore'
import { useAppConfig } from '@/hooks/useAppConfig'
import { getAllMembers } from '@/lib/firebase/firestore'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { differenceInDays, parseISO } from 'date-fns'
import { toast } from 'sonner'

interface DashboardStats {
  totalActive: number
  inDivision: number
  sameDesignation: number
}

export function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { member } = useAuthStore()
  const { config, isLoading: configLoading } = useAppConfig()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [announcementDismissed, setAnnouncementDismissed] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement-dismissed')
    if (dismissed) setAnnouncementDismissed(true)
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      if (!member) return
      setStatsLoading(true)
      try {
        const all = await getAllMembers('active')
        const inDiv = all.filter((m) => m.division === member.division)
        const sameDesig = all.filter((m) => m.designation === member.designation)
        setStats({
          totalActive: all.length,
          inDivision: inDiv.length,
          sameDesignation: sameDesig.length,
        })
      } catch {
        // Non-fatal — stats just won't show
      } finally {
        setStatsLoading(false)
      }
    }
    loadStats()
  }, [member])

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true)
    sessionStorage.setItem('announcement-dismissed', '1')
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/members`
    const shareData = {
      title: 'MedConnect BD',
      text: member
        ? `${member.fullName} — ${t(`designations.${member.designation}` as Parameters<typeof t>[0])}`
        : 'MedConnect BD',
      url,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success(t('common.copied'))
    }
  }

  const needsBloodDonationReminder = (() => {
    if (!member) return false
    if (!member.lastDonateDate) return true
    try {
      const days = differenceInDays(new Date(), parseISO(member.lastDonateDate))
      return days > 90
    } catch {
      return false
    }
  })()

  const announcementText = locale === 'bn'
    ? config?.announcementTextBn
    : config?.announcementTextEn

  if (!member) return null

  return (
    <div className="space-y-5 pb-4">
      {/* Announcement banner */}
      {!configLoading && config?.announcementEnabled && announcementText && !announcementDismissed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
          <Megaphone size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 flex-1">{announcementText}</p>
          <button
            type="button"
            onClick={dismissAnnouncement}
            aria-label={t('common.close')}
            className="text-amber-400 hover:text-amber-700 flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Welcome banner */}
      <Card className="border-primary-100 bg-gradient-to-r from-primary-600 to-primary-700 text-white overflow-hidden relative">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              base64={member.profilePhotoBase64}
              name={member.fullName}
              size="md"
              className="border-white/40"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold leading-tight truncate">
                  {locale === 'bn'
                    ? `স্বাগতম, ${member.fullNameBn || member.fullName}`
                    : `Welcome, ${member.fullName}`}
                </h1>
                {member.isVerified && (
                  <VerifiedBadge size={18} />
                )}
              </div>
              <div className="mt-1">
                <DesignationBadge designation={member.designation} size="sm" />
              </div>
              <p className="text-white/70 text-xs mt-1.5">
                {t('profile.regNumber')}: {member.regNumber}
              </p>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -right-4 -bottom-10 w-24 h-24 rounded-full bg-white/5" />
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: t('home.totalMembers'),
            value: stats?.totalActive,
            icon: Users,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
          },
          {
            label: t('home.inDivision'),
            value: stats?.inDivision,
            icon: MapPin,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: t('home.sameDesignation'),
            value: stats?.sameDesignation,
            icon: Stethoscope,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-zinc-100">
            <CardContent className="p-3 text-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2',
                  stat.bg
                )}
              >
                <stat.icon size={16} className={stat.color} />
              </div>
              {statsLoading ? (
                <Skeleton className="h-6 w-10 mx-auto mb-1" />
              ) : (
                <p className="text-xl font-bold text-zinc-900">
                  {stat.value ?? '—'}
                </p>
              )}
              <p className="text-xs text-zinc-500 leading-tight">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Blood donation reminder */}
      {needsBloodDonationReminder && (
        <Card className="border-red-100 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Droplets size={18} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                {locale === 'bn'
                  ? 'আপনি কি রক্ত দিতে পারবেন?'
                  : 'Are you available to donate blood?'}
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {member.lastDonateDate
                  ? `${t('profile.lastDonate')}: ${formatDate(member.lastDonateDate, locale as 'en' | 'bn')}`
                  : t('profile.neverDonated')}
              </p>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-100 flex-shrink-0 text-xs"
            >
              <Link href={`/${locale}/profile`}>
                {t('home.updateDonation')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-600 mb-3 uppercase tracking-wide">
          {t('home.quickActions')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: t('home.browseMembers'),
              href: `/${locale}/members`,
              icon: Users,
              color: 'text-primary-600',
              bg: 'bg-primary-50',
              border: 'border-primary-100',
            },
            {
              label: t('home.updateProfile'),
              href: `/${locale}/profile`,
              icon: UserCog,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-100',
            },
            {
              label: t('home.shareProfile'),
              onClick: handleShare,
              icon: Share2,
              color: 'text-green-600',
              bg: 'bg-green-50',
              border: 'border-green-100',
            },
          ].map((action) => {
            const content = (
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    action.bg
                  )}
                >
                  <action.icon size={20} className={action.color} />
                </div>
                <span className="text-sm font-medium text-zinc-700">
                  {action.label}
                </span>
                <ArrowRight size={14} className="text-zinc-300 ml-auto" />
              </CardContent>
            )

            return action.href ? (
              <Link key={action.label} href={action.href}>
                <Card
                  className={cn(
                    'border cursor-pointer hover:shadow-sm transition-shadow',
                    action.border
                  )}
                >
                  {content}
                </Card>
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="w-full text-left"
              >
                <Card
                  className={cn(
                    'border cursor-pointer hover:shadow-sm transition-shadow',
                    action.border
                  )}
                >
                  {content}
                </Card>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}