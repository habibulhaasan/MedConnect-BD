'use client'

import { useLocale, useTranslations } from 'next-intl'
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Building2,
  Droplets,
  Calendar,
  Star,
  Share2,
  Map,
  Copy,
  Lock,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import { DesignationBadge } from '@/components/shared/DesignationBadge'
import { BloodGroupBadge } from '@/components/shared/BloodGroupBadge'
import { CopyButton } from '@/components/shared/CopyButton'
import {
  makeCallLink,
  makeWhatsAppLink,
  makeEmailLink,
  makeMapsLink,
} from '@/lib/utils/contact'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import type { Member } from '@/types'

interface MemberDetailModalProps {
  member: Member | null
  open: boolean
  isFavorite: boolean
  onClose: () => void
  onFavoriteToggle: (uid: string) => void
}

export function MemberDetailModal({
  member,
  open,
  isFavorite,
  onClose,
  onFavoriteToggle,
}: MemberDetailModalProps) {
  const t = useTranslations()
  const locale = useLocale()

  if (!member) return null

  const displayName =
    locale === 'bn' && member.fullNameBn ? member.fullNameBn : member.fullName

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/members`
    const shareData = {
      title: member.fullName,
      text: `${member.fullName} — ${t(`designations.${member.designation}` as Parameters<typeof t>[0])} | MedConnect BD`,
      url,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success(t('common.copied'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto p-0">
        {/* Header / identity */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6">
          <DialogHeader>
            <DialogTitle className="sr-only">{member.fullName}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <ProfileAvatar
                base64={member.profilePhotoBase64}
                name={member.fullName}
                size="xl"
              />
              {member.isVerified && (
                <div className="absolute -top-1 -right-1">
                  <VerifiedBadge size={20} />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900">{displayName}</h2>
              {locale === 'bn' && member.fullName !== member.fullNameBn && (
                <p className="text-sm text-zinc-600">{member.fullName}</p>
              )}
              <DesignationBadge designation={member.designation} />
            </div>

            {/* Reg number */}
            <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-1.5">
              <Lock size={12} className="text-zinc-400" />
              <span className="text-xs font-mono text-zinc-700">{member.regNumber}</span>
              <CopyButton text={member.regNumber} size={12} />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Contact actions — large tappable */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={makeCallLink(member.mobile)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Phone size={18} className="text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-700">
                {t('members.callNow')}
              </span>
            </a>

            <a
              href={makeWhatsAppLink(
                member.whatsapp ?? member.mobile,
                member.fullName,
                locale
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <MessageCircle size={18} className="text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-700">
                {t('members.whatsapp')}
              </span>
            </a>

            {member.email ? (
              <a
                href={makeEmailLink(member.email)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-700 truncate w-full text-center">
                  Email
                </span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-50 opacity-40 cursor-not-allowed">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Mail size={18} className="text-zinc-400" />
                </div>
                <span className="text-xs font-medium text-zinc-400">Email</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              {t('profile.locationInfo')}
            </h3>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-zinc-400 flex-shrink-0" />
              <span className="text-sm text-zinc-700">
                {t(`divisions.${member.division}` as Parameters<typeof t>[0])}
                {' › '}{member.district}
                {' › '}{member.upazila}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Building2 size={14} className="text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-zinc-700">{member.institution}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  {member.officeAddress}
                </p>
              </div>
            </div>

            {/* Google Maps */}
            <a
              href={makeMapsLink(`${member.institution}, ${member.officeAddress}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:underline mt-1"
            >
              <Map size={12} />
              {t('members.viewOnMap')}
            </a>
          </div>

          <Separator />

          {/* Medical info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              {t('profile.professionalInfo')}
            </h3>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Droplets size={14} className="text-zinc-400" />
                <BloodGroupBadge bloodGroup={member.bloodGroup} size="sm" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-zinc-400" />
                <span className="text-xs text-zinc-600">
                  {member.lastDonateDate
                    ? formatDate(member.lastDonateDate, locale as 'en' | 'bn')
                    : t('profile.neverDonated')}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <p className="text-xs text-zinc-400">
            {t('profile.memberSince')}{' '}
            {formatDate(member.joinedAt, locale as 'en' | 'bn')}
          </p>

          {/* Footer actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'flex-1 gap-1.5',
                isFavorite
                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                  : 'hover:border-amber-200 hover:text-amber-600'
              )}
              onClick={() => onFavoriteToggle(member.uid)}
            >
              <Star
                size={14}
                className={cn(isFavorite && 'fill-amber-500 text-amber-500')}
              />
              {isFavorite ? t('members.removeFavorite') : t('members.addFavorite')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleShare}
            >
              <Share2 size={14} />
              {t('home.shareProfile')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}