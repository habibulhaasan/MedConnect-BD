'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  ShieldOff,
  ShieldCheck,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { DesignationBadge } from '@/components/shared/DesignationBadge'
import { adminApi } from '@/lib/firebase/admin-api'
import { deleteMember } from '@/lib/firebase/admin-firestore'
import { formatDate } from '@/lib/utils/format'
import { toast } from 'sonner'
import type { Member, MemberStatus } from '@/types'
import { cn } from '@/lib/utils/cn'

type SortField = 'fullName' | 'joinedAt' | 'status' | 'division'
type SortDir = 'asc' | 'desc'

const STATUS_STYLES: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-700',
  pending_payment: 'bg-zinc-100 text-zinc-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
}

interface MemberTableProps {
  members: Member[]
  onViewProfile: (member: Member) => void
  onEditMember: (member: Member) => void
  onRefresh: () => void
}

export function MemberTable({
  members,
  onViewProfile,
  onEditMember,
  onRefresh,
}: MemberTableProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [sortField, setSortField] = useState<SortField>('joinedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedUids, setSelectedUids] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isActioning, setIsActioning] = useState<string | null>(null)

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'fullName': cmp = a.fullName.localeCompare(b.fullName); break
        case 'joinedAt': cmp = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(); break
        case 'status': cmp = a.status.localeCompare(b.status); break
        case 'division': cmp = a.division.localeCompare(b.division); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [members, sortField, sortDir])

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }, [sortField])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={13} className="text-zinc-400" />
    return sortDir === 'asc'
      ? <ChevronUp size={13} className="text-primary-600" />
      : <ChevronDown size={13} className="text-primary-600" />
  }

  const toggleSelectAll = () => {
    if (selectedUids.size === sortedMembers.length) {
      setSelectedUids(new Set())
    } else {
      setSelectedUids(new Set(sortedMembers.map((m) => m.uid)))
    }
  }

  const toggleSelect = (uid: string) => {
    setSelectedUids((prev) => {
      const next = new Set(prev)
      next.has(uid) ? next.delete(uid) : next.add(uid)
      return next
    })
  }

  const handleStatusChange = async (member: Member, newStatus: 'active' | 'suspended') => {
    setIsActioning(member.uid)
    try {
      await adminApi.updateMember(member.uid, {
        status: newStatus,
        isVerified: newStatus === 'active',
      })
      toast.success(
        newStatus === 'active'
          ? t('admin.memberActivated')
          : t('admin.memberSuspended')
      )
      onRefresh()
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setIsActioning(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteMember(deleteTarget.uid)
      toast.success(t('admin.memberDeleted'))
      setDeleteTarget(null)
      onRefresh()
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkSuspend = async () => {
    if (!selectedUids.size) return
    try {
      await Promise.all(
        [...selectedUids].map((uid) =>
          adminApi.updateMember(uid, { status: 'suspended', isVerified: false })
        )
      )
      toast.success(t('admin.bulkSuspendSuccess', { count: selectedUids.size }))
      setSelectedUids(new Set())
      onRefresh()
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

  const exportCSV = () => {
    const rows = [
      ['Name', 'Name (BN)', 'Designation', 'Reg No', 'Mobile', 'Division', 'District', 'Status', 'Joined'],
      ...sortedMembers.map((m) => [
        m.fullName, m.fullNameBn, m.designation, m.regNumber,
        m.mobile, m.division, m.district, m.status,
        new Date(m.joinedAt).toLocaleDateString(),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medconnect-members-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Bulk actions */}
      {selectedUids.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-50 border border-primary-100 rounded-lg mb-3">
          <span className="text-sm font-medium text-primary-700">
            {t('admin.selectedCount', { count: selectedUids.size })}
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkSuspend}
              className="border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1"
            >
              <ShieldOff size={12} />
              {t('admin.bulkSuspend')}
            </Button>
            <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs">
              {t('admin.exportCSV')}
            </Button>
          </div>
        </div>
      )}

      {selectedUids.size === 0 && (
        <div className="flex justify-end mb-3">
          <Button size="sm" variant="outline" onClick={exportCSV} className="text-xs gap-1.5">
            {t('admin.exportCSV')}
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={selectedUids.size === sortedMembers.length && sortedMembers.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => toggleSort('fullName')}
                    className="flex items-center gap-1 font-semibold hover:text-zinc-900"
                  >
                    {t('admin.colName')} <SortIcon field="fullName" />
                  </button>
                </TableHead>
                <TableHead>{t('admin.colDesignation')}</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => toggleSort('division')}
                    className="flex items-center gap-1 font-semibold hover:text-zinc-900"
                  >
                    {t('admin.colLocation')} <SortIcon field="division" />
                  </button>
                </TableHead>
                <TableHead>{t('admin.colMobile')}</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => toggleSort('status')}
                    className="flex items-center gap-1 font-semibold hover:text-zinc-900"
                  >
                    {t('common.status')} <SortIcon field="status" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => toggleSort('joinedAt')}
                    className="flex items-center gap-1 font-semibold hover:text-zinc-900"
                  >
                    {t('admin.colJoined')} <SortIcon field="joinedAt" />
                  </button>
                </TableHead>
                <TableHead className="text-right pr-4">{t('admin.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-zinc-400">
                    {t('admin.noMembersFound')}
                  </TableCell>
                </TableRow>
              ) : (
                sortedMembers.map((member, idx) => (
                  <TableRow
                    key={member.uid}
                    className={cn(
                      'transition-colors',
                      selectedUids.has(member.uid) && 'bg-primary-50/50'
                    )}
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedUids.has(member.uid)}
                        onCheckedChange={() => toggleSelect(member.uid)}
                        aria-label={`Select ${member.fullName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-zinc-400 w-5 text-center">
                          {idx + 1}
                        </span>
                        <ProfileAvatar
                          base64={member.profilePhotoBase64}
                          name={member.fullName}
                          size="xs"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-zinc-400 truncate font-mono">
                            {member.regNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DesignationBadge designation={member.designation} size="sm" />
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-zinc-600">
                        {t(`divisions.${member.division}` as Parameters<typeof t>[0])}
                      </p>
                      <p className="text-xs text-zinc-400">{member.district}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-zinc-700">{member.mobile}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs border-0', STATUS_STYLES[member.status])}
                      >
                        {t(`status.${member.status}` as Parameters<typeof t>[0])}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-500">
                        {formatDate(member.joinedAt, locale as 'en' | 'bn')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isActioning === member.uid}
                          >
                            <MoreHorizontal size={15} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => onViewProfile(member)}
                            className="gap-2"
                          >
                            <Eye size={13} />
                            {t('admin.viewDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditMember(member)}
                            className="gap-2"
                          >
                            <Pencil size={13} />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {member.status === 'suspended' ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(member, 'active')}
                              className="gap-2 text-green-600 focus:text-green-700"
                            >
                              <ShieldCheck size={13} />
                              {t('admin.activateMember')}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(member, 'suspended')}
                              className="gap-2 text-amber-600 focus:text-amber-700"
                            >
                              <ShieldOff size={13} />
                              {t('admin.suspendMember')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(member)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 size={13} />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {t('admin.deleteMemberTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.deleteMemberDesc', { name: deleteTarget?.fullName ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? '...' : t('admin.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}