'use client'

import { useEffect, useCallback, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Heart, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { MemberCard } from './MemberCard'
import { MemberDetailModal } from './MemberDetailModal'
import { useFavorites } from '@/hooks/useFavorites'
import type { Member } from '@/types'

function FavoritesEmptyState() {
  const t = useTranslations('favorites')
  const locale = useLocale()

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
        <Heart size={36} className="text-amber-300" />
      </div>
      <div className="space-y-1 max-w-xs">
        <p className="font-semibold text-zinc-700">{t('empty')}</p>
        <p className="text-sm text-zinc-500">{t('emptyHint')}</p>
      </div>
      <Button asChild variant="outline" size="sm" className="gap-2 mt-2">
        <Link href={`/${locale}/members`}>
          <Users size={14} />
          {t('browseMembers')}
        </Link>
      </Button>
    </div>
  )
}

function FavoriteSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-zinc-100 p-4 space-y-3">
          <div className="flex gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-10 rounded-full" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="w-8 h-8 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function FavoritesPage() {
  const t = useTranslations()
  const {
    favoriteMembers,
    isLoadingFavorites,
    fetchFavoriteMembers,
    isFavorite,
    toggle,
    favoriteUids,
  } = useFavorites()

  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchFavoriteMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteUids.length])

  const handleViewDetail = useCallback((member: Member) => {
    setSelectedMember(member)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setTimeout(() => setSelectedMember(null), 300)
  }, [])

  const handleFavoriteToggle = useCallback(
    (uid: string) => { toggle(uid) },
    [toggle]
  )

  return (
    <div className="space-y-5 pb-4">
      <PageHeader
        title={t('favorites.title')}
        subtitle={
          !isLoadingFavorites && favoriteMembers.length > 0
            ? `${favoriteMembers.length} ${t('favorites.memberCount')}`
            : undefined
        }
      />

      {isLoadingFavorites ? (
        <FavoriteSkeleton />
      ) : favoriteMembers.length === 0 ? (
        <FavoritesEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {favoriteMembers.map((member) => (
            <MemberCard
              key={member.uid}
              member={member}
              isFavorite={isFavorite(member.uid)}
              onFavoriteToggle={handleFavoriteToggle}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      )}

      <MemberDetailModal
        member={selectedMember}
        open={modalOpen}
        isFavorite={selectedMember ? isFavorite(selectedMember.uid) : false}
        onClose={handleCloseModal}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </div>
  )
}