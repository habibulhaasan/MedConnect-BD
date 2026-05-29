'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar } from './FilterBar'
import { MembersGrid } from './MembersGrid'
import { MemberDetailModal } from './MemberDetailModal'
import { useMembers, DEFAULT_FILTERS } from '@/hooks/useMembers'
import { useFavorites } from '@/hooks/useFavorites'
import type { Member } from '@/types'
import { isFiltersActive } from './FilterBar'
import type { MemberFilters } from '@/hooks/useMembers'
import { useMembers, DEFAULT_FILTERS, isFiltersActive } from '@/hooks/useMembers'
// Remove local filtersActive computation, use isFiltersActive(filters) instead

// Re-export for FilterBar internal use
export { isFiltersActive }

export function MembersPage() {
  const t = useTranslations()
  const {
    filteredMembers,
    isLoading,
    isLoadingMore,
    hasMore,
    filters,
    setFilters,
    loadMore,
    refresh,
  } = useMembers()

  const { favoriteUids, toggle } = useFavorites()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Load initial data
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleViewDetail = useCallback((member: Member) => {
    setSelectedMember(member)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    // Keep selectedMember mounted for exit animation
    setTimeout(() => setSelectedMember(null), 300)
  }, [])

  const handleFavoriteToggle = useCallback(
    (uid: string) => { toggle(uid) },
    [toggle]
  )

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [setFilters])

  const filtersActive =
    filters.searchQuery !== '' ||
    filters.division !== 'all' ||
    filters.district !== '' ||
    filters.designation !== 'all' ||
    filters.bloodGroups.length > 0 ||
    filters.sort !== 'newest'

  return (
    <div className="space-y-4 pb-4">
      <PageHeader title={t('members.title')} />

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-10 bg-zinc-50 pb-3 -mx-4 px-4 md:-mx-6 md:px-6 pt-2 border-b border-zinc-100">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={filteredMembers.length}
          isLoading={isLoading}
        />
      </div>

      <MembersGrid
        members={filteredMembers}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        hasFilters={filtersActive}
        favoriteUids={favoriteUids}
        onFavoriteToggle={handleFavoriteToggle}
        onViewDetail={handleViewDetail}
        onLoadMore={loadMore}
        onClearFilters={handleClearFilters}
      />

      <MemberDetailModal
        member={selectedMember}
        open={modalOpen}
        isFavorite={selectedMember ? favoriteUids.includes(selectedMember.uid) : false}
        onClose={handleCloseModal}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </div>
  )
}