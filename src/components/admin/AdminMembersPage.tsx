'use client'

import { useEffect, useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { MemberTable } from './MemberTable'
import { EditMemberModal } from './EditMemberModal'
import { MemberDetailModal } from '@/components/member/MemberDetailModal'
import { useFavorites } from '@/hooks/useFavorites'
import { subscribeAllMembers } from '@/lib/firebase/admin-firestore'
import { MT_DESIGNATIONS, ALL_DESIGNATIONS } from '@/types'
import type { Member, MemberStatus, Designation } from '@/types'

type StatusFilter = MemberStatus | 'all'
type DesigFilter = Designation | 'group_mt' | 'all'

export function AdminMembersPage() {
  const t = useTranslations()
  const { isFavorite, toggle } = useFavorites()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [designFilter, setDesignFilter] = useState<DesigFilter>('all')
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [viewTarget, setViewTarget] = useState<Member | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const unsub = subscribeAllMembers('all', (m) => {
      setMembers(m)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    let result = members

    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter)
    }

    if (designFilter !== 'all') {
      if (designFilter === 'group_mt') {
        result = result.filter((m) => MT_DESIGNATIONS.includes(m.designation))
      } else {
        result = result.filter((m) => m.designation === designFilter)
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.fullNameBn.toLowerCase().includes(q) ||
          m.mobile.includes(q) ||
          m.regNumber.toLowerCase().includes(q)
      )
    }

    return result
  }, [members, statusFilter, designFilter, search])

  const handleRefresh = () => {
    // onSnapshot already provides real-time — no manual refresh needed
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t('admin.members')}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {t('admin.membersSubtitle', { count: filtered.length })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.searchMembers')}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="h-9 text-sm w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
            <SelectItem value="active">{t('status.active')}</SelectItem>
            <SelectItem value="pending_approval">{t('status.pending_approval')}</SelectItem>
            <SelectItem value="pending_payment">{t('status.pending_payment')}</SelectItem>
            <SelectItem value="suspended">{t('status.suspended')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={designFilter} onValueChange={(v) => setDesignFilter(v as DesigFilter)}>
          <SelectTrigger className="h-9 text-sm w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('members.allDesignations')}</SelectItem>
            <SelectGroup>
              <SelectLabel className="text-xs">— MT —</SelectLabel>
              <SelectItem value="group_mt">{t('designations.group_mt')}</SelectItem>
              {MT_DESIGNATIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {t(`designations.${d}` as Parameters<typeof t>[0])}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="text-xs">— Other —</SelectLabel>
              <SelectItem value="pharmacist">{t('designations.pharmacist')}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <MemberTable
          members={filtered}
          onViewProfile={(m) => setViewTarget(m)}
          onEditMember={(m) => setEditTarget(m)}
          onRefresh={handleRefresh}
        />
      )}

      <EditMemberModal
        open={!!editTarget}
        member={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => setEditTarget(null)}
      />

      <MemberDetailModal
        open={!!viewTarget}
        member={viewTarget}
        isFavorite={viewTarget ? isFavorite(viewTarget.uid) : false}
        onClose={() => setViewTarget(null)}
        onFavoriteToggle={toggle}
      />
    </div>
  )
}