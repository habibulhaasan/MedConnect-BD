'use client'

import { useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberCard } from './MemberCard'
import { MemberCardSkeleton } from './MemberCardSkeleton'
import { MembersEmptyState } from './MembersEmptyState'
import type { Member } from '@/types'
import { cn } from '@/lib/utils/cn'

interface MembersGridProps {
  members: Member[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  hasFilters: boolean
  favoriteUids: string[]
  onFavoriteToggle: (uid: string) => void
  onViewDetail: (member: Member) => void
  onLoadMore: () => void
  onClearFilters: () => void
}

// Breakpoint: 768px → 1 col, 1024px → 2 col, 1280px → 3 col
// We'll use CSS grid and let each card render naturally (not virtualised rows)
// Virtualisation kicks in only for lists > 50 in single-column mode via scroll container

const VIRTUAL_THRESHOLD = 50

export function MembersGrid({
  members,
  isLoading,
  isLoadingMore,
  hasMore,
  hasFilters,
  favoriteUids,
  onFavoriteToggle,
  onViewDetail,
  onLoadMore,
  onClearFilters,
}: MembersGridProps) {
  const t = useTranslations('members')
  const parentRef = useRef<HTMLDivElement>(null)

  const useVirtual = members.length > VIRTUAL_THRESHOLD

  // Virtualizer for large lists (mobile single-col)
  const rowVirtualizer = useVirtualizer({
    count: members.length,
    getScrollElement: () => (useVirtual ? parentRef.current : null),
    estimateSize: () => 140,
    overscan: 5,
    enabled: useVirtual,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MemberCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!isLoading && members.length === 0) {
    return (
      <MembersEmptyState
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Grid */}
      {useVirtual ? (
        /* Virtualised (mobile, large lists) */
        <div
          ref={parentRef}
          className="md:hidden overflow-auto"
          style={{ height: '70vh' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((vItem) => {
              const member = members[vItem.index]!
              return (
                <div
                  key={member.uid}
                  data-index={vItem.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${vItem.start}px)`,
                    paddingBottom: '1rem',
                  }}
                >
                  <MemberCard
                    member={member}
                    isFavorite={favoriteUids.includes(member.uid)}
                    onFavoriteToggle={onFavoriteToggle}
                    onViewDetail={onViewDetail}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Standard grid (desktop always, mobile when < threshold) */}
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4',
          useVirtual && 'hidden md:grid'
        )}
      >
        {members.map((member) => (
          <MemberCard
            key={member.uid}
            member={member}
            isFavorite={favoriteUids.includes(member.uid)}
            onFavoriteToggle={onFavoriteToggle}
            onViewDetail={onViewDetail}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="gap-2 min-w-[140px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {t('loadMore')}
              </>
            ) : (
              t('loadMore')
            )}
          </Button>
        </div>
      )}
    </div>
  )
}