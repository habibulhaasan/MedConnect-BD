'use client'

import React, { useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { MapPin, Star, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { DesignationBadge } from '@/components/shared/DesignationBadge'
import { BloodGroupBadge } from '@/components/shared/BloodGroupBadge'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import { makeCallLink, makeWhatsAppLink } from '@/lib/utils/contact'
import { cn } from '@/lib/utils/cn'
import type { Member } from '@/types'

interface MemberCardProps {
  member: Member
  isFavorite: boolean
  onFavoriteToggle: (uid: string) => void
  onViewDetail: (member: Member) => void
}

export const MemberCard = React.memo(function MemberCard({
  member,
  isFavorite,
  onFavoriteToggle,
  onViewDetail,
}: MemberCardProps) {
  const t = useTranslations()
  const locale = useLocale()

  const displayName =
    locale === 'bn' && member.fullNameBn ? member.fullNameBn : member.fullName

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onFavoriteToggle(member.uid)
    },
    [member.uid, onFavoriteToggle]
  )

  const handleView = useCallback(
    () => onViewDetail(member),
    [member, onViewDetail]
  )

  return (
    <Card
      className={cn(
        'border border-zinc-100 bg-white transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-zinc-200 active:scale-[0.99]'
      )}
      onClick={handleView}
    >
      <CardContent className="p-4 space-y-3">
        {/* Top: avatar + info */}
        <div className="flex gap-3">
          {/* Avatar with badges */}
          <div className="relative flex-shrink-0">
            <ProfileAvatar
              base64={member.profilePhotoBase64}
              name={member.fullName}
              size="md"
            />
            {/* Designation badge — bottom right of avatar */}
            <div className="absolute -bottom-1 -right-1">
              <span
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full border-2 border-white text-white text-[8px] font-bold',
                  member.designation === 'pharmacist'
                    ? 'bg-purple-500'
                    : 'bg-primary-500'
                )}
                title={t(`designations.${member.designation}` as Parameters<typeof t>[0])}
              >
                {member.designation === 'pharmacist' ? 'Ph' : 'MT'}
              </span>
            </div>
            {/* Verified badge — top right */}
            {member.isVerified && (
              <div className="absolute -top-1 -right-1">
                <VerifiedBadge size={15} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="font-semibold text-sm text-zinc-900 truncate leading-snug">
              {displayName}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {t(`designations.${member.designation}` as Parameters<typeof t>[0])}
            </p>
            <p className="text-xs text-zinc-400 truncate">{member.institution}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-zinc-400 flex-shrink-0" />
              <span className="text-xs text-zinc-400 truncate">
                {member.district},{' '}
                {t(`divisions.${member.division}` as Parameters<typeof t>[0])}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: blood group + actions */}
        <div className="flex items-center justify-between gap-2">
          <BloodGroupBadge bloodGroup={member.bloodGroup} size="sm" />

          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Call */}
            <a
              href={makeCallLink(member.mobile)}
              aria-label={`${t('members.callNow')} ${member.fullName}`}
              className="w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.4 10.7 19.79 19.79 0 01.32 2.12 2 2 0 012.3 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={makeWhatsAppLink(
                member.whatsapp ?? member.mobile,
                member.fullName,
                locale
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${member.fullName}`}
              className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>

            {/* Favorite */}
            <button
              type="button"
              onClick={handleFavorite}
              aria-label={
                isFavorite
                  ? t('members.removeFavorite')
                  : t('members.addFavorite')
              }
              aria-pressed={isFavorite}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                isFavorite
                  ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                  : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-amber-400'
              )}
            >
              <Star
                size={14}
                className={cn(isFavorite && 'fill-amber-500')}
              />
            </button>

            {/* View detail */}
            <button
              type="button"
              onClick={handleView}
              aria-label={`${t('members.viewProfile')} ${member.fullName}`}
              className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
},
// Custom comparison — only re-render if uid, isFavorite, or key fields changed
(prev, next) =>
  prev.member.uid === next.member.uid &&
  prev.isFavorite === next.isFavorite &&
  prev.member.profilePhotoBase64 === next.member.profilePhotoBase64 &&
  prev.member.fullName === next.member.fullName
)