'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DEFAULT_FILTERS, isFiltersActive } from '@/hooks/useMember'
import type { MemberFilters, SortOption } from '@/hooks/useMember'
import { getBdDivisionBySlug, getDistrictsByDivisionSlug } from '@/lib/utils/bd-data'
import { ALL_BLOOD_GROUPS, ALL_DIVISIONS, MT_DESIGNATIONS } from '@/types'
import type { BloodGroup, Designation, Division } from '@/types'
import { cn } from '@/lib/utils/cn'

interface FilterBarProps {
  filters: MemberFilters
  onFiltersChange: (filters: MemberFilters) => void
  resultCount: number
  isLoading: boolean
}

export function FilterBar({
  filters,
  onFiltersChange,
  resultCount,
  isLoading,
}: FilterBarProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        onFiltersChange({ ...filters, searchQuery: localSearch })
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch])

  const currentDivision =
    filters.division && filters.division !== 'all'
      ? getBdDivisionBySlug(filters.division)
      : undefined
  const divisionDistricts =
    filters.division && filters.division !== 'all'
      ? getDistrictsByDivisionSlug(filters.division)
      : []

  const update = (patch: Partial<MemberFilters>) => {
    onFiltersChange({ ...filters, ...patch })
  }

  const clearAll = () => {
    setLocalSearch('')
    onFiltersChange(DEFAULT_FILTERS)
  }

  const toggleBloodGroup = (bg: BloodGroup) => {
    const next = filters.bloodGroups.includes(bg)
      ? filters.bloodGroups.filter((b) => b !== bg)
      : [...filters.bloodGroups, bg]
    update({ bloodGroups: next })
  }

  const filtersActive = isFiltersActive(filters)

  const FilterControls = () => (
    <div className="space-y-4">
      {/* Division */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {t('members.filterDivision')}
        </p>
        <Select
          value={filters.division}
          onValueChange={(v) => update({ division: v as Division | 'all', district: '' })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('members.allDivisions')}</SelectItem>
            {ALL_DIVISIONS.map((slug) => {
              const div = getBdDivisionBySlug(slug)
              return (
                <SelectItem key={slug} value={slug}>
                  {t(`divisions.${slug}`)} ({div?.nameBn})
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {t('members.filterDistrict')}
        </p>
        <Select
          value={filters.district || 'all'}
          disabled={!currentDivision}
          onValueChange={(v) => update({ district: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder={t('members.allDistricts')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('members.allDistricts')}</SelectItem>
            {divisionDistricts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} ({d.nameBn})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Designation */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {t('members.filterDesignation')}
        </p>
        <Select
          value={filters.designation}
          onValueChange={(v) => update({ designation: v as Designation | 'group_mt' | 'all' })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('members.allDesignations')}</SelectItem>
            <SelectGroup>
              <SelectLabel className="text-xs text-zinc-400">
                — Medical Technologist —
              </SelectLabel>
              <SelectItem value="group_mt">
                {t('designations.group_mt')}
              </SelectItem>
              {MT_DESIGNATIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {t(`designations.${d}` as Parameters<typeof t>[0])}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel className="text-xs text-zinc-400">— Other —</SelectLabel>
              <SelectItem value="pharmacist">
                {t('designations.pharmacist')}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Blood group chips */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {t('members.filterBloodGroup')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_BLOOD_GROUPS.map((bg) => {
            const selected = filters.bloodGroups.includes(bg)
            return (
              <button
                key={bg}
                type="button"
                onClick={() => toggleBloodGroup(bg)}
                aria-pressed={selected}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-semibold border transition-all',
                  selected
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-primary-300 hover:text-primary-600'
                )}
              >
                {bg}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {t('members.sort')}
        </p>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: 'newest', label: t('members.sortNewest') },
            { value: 'name_asc', label: t('members.sortName') },
            { value: 'division', label: t('members.sortDivision') },
          ] as { value: SortOption; label: string }[]).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update({ sort: opt.value })}
              aria-pressed={filters.sort === opt.value}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                filters.sort === opt.value
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Search + filter trigger row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t('members.searchPlaceholder')}
            className="pl-9 pr-9 h-10"
            aria-label={t('common.search')}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => { setLocalSearch(''); update({ searchQuery: '' }) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              aria-label={t('common.clear')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Mobile: sheet trigger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'md:hidden h-10 w-10 flex-shrink-0',
                filtersActive && 'border-primary-400 text-primary-600 bg-primary-50'
              )}
              aria-label={t('common.filter')}
            >
              <SlidersHorizontal size={16} />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader className="mb-4">
              <SheetTitle>{t('common.filter')}</SheetTitle>
            </SheetHeader>
            <FilterControls />
            <div className="flex gap-2 mt-5 pb-safe">
              {filtersActive && (
                <Button
                  variant="outline"
                  className="flex-1 text-destructive border-red-200"
                  onClick={() => { clearAll(); setSheetOpen(false) }}
                >
                  {t('common.clear')}
                </Button>
              )}
              <Button
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                onClick={() => setSheetOpen(false)}
              >
                {t('members.applyFilters')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: inline filter row */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {/* Division */}
        <Select
          value={filters.division}
          onValueChange={(v) => update({ division: v as Division | 'all', district: '' })}
        >
          <SelectTrigger className="h-9 text-sm w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('members.allDivisions')}</SelectItem>
            {ALL_DIVISIONS.map((slug) => {
              const div = getBdDivisionBySlug(slug)
              return (
                <SelectItem key={slug} value={slug}>
                  {t(`divisions.${slug}`)}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* District */}
        <Select
          value={filters.district || 'all'}
          disabled={!currentDivision}
          onValueChange={(v) => update({ district: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="h-9 text-sm w-[150px]">
            <SelectValue placeholder={t('members.allDistricts')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('members.allDistricts')}</SelectItem>
            {divisionDistricts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Designation */}
        <Select
          value={filters.designation}
          onValueChange={(v) => update({ designation: v as Designation | 'group_mt' | 'all' })}
        >
          <SelectTrigger className="h-9 text-sm w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('members.allDesignations')}</SelectItem>
            <SelectGroup>
              <SelectLabel className="text-xs">— Medical Technologist —</SelectLabel>
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

        {/* Blood group chips — desktop inline */}
        <div className="flex gap-1">
          {ALL_BLOOD_GROUPS.map((bg) => {
            const selected = filters.bloodGroups.includes(bg)
            return (
              <button
                key={bg}
                type="button"
                onClick={() => toggleBloodGroup(bg)}
                aria-pressed={selected}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-semibold border transition-all',
                  selected
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-primary-300'
                )}
              >
                {bg}
              </button>
            )
          })}
        </div>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(v) => update({ sort: v as SortOption })}
        >
          <SelectTrigger className="h-9 text-sm w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('members.sortNewest')}</SelectItem>
            <SelectItem value="name_asc">{t('members.sortName')}</SelectItem>
            <SelectItem value="division">{t('members.sortDivision')}</SelectItem>
          </SelectContent>
        </Select>

        {filtersActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-destructive hover:text-destructive hover:bg-red-50 gap-1"
          >
            <X size={13} />
            {t('common.clear')}
          </Button>
        )}
      </div>

      {/* Result count */}
      {!isLoading && (
        <p className="text-xs text-zinc-500">
          {locale === 'bn'
            ? `${resultCount} জন সদস্য পাওয়া গেছে`
            : `${resultCount} ${t('members.totalMembers', { count: resultCount })}`}
        </p>
      )}
    </div>
  )
}