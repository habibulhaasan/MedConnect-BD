'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { MT_DESIGNATIONS } from '@/types'
import type { Member, BloodGroup, Division, Designation } from '@/types'
import { Timestamp } from 'firebase/firestore'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption = 'newest' | 'name_asc' | 'division'

export interface MemberFilters {
  searchQuery: string
  division: Division | 'all'
  district: string
  designation: Designation | 'group_mt' | 'all'
  bloodGroups: BloodGroup[]
  sort: SortOption
}

export const DEFAULT_FILTERS: MemberFilters = {
  searchQuery: '',
  division: 'all',
  district: '',
  designation: 'all',
  bloodGroups: [],
  sort: 'newest',
}

const PAGE_SIZE = 20

// ─── Firestore doc → Member ───────────────────────────────────────────────────

function docToMember(doc: QueryDocumentSnapshot<DocumentData>): Member {
  const d = doc.data()
  return {
    uid: doc.id,
    fullName: d['fullName'] ?? '',
    fullNameBn: d['fullNameBn'] ?? '',
    designation: d['designation'],
    regNumber: d['regNumber'] ?? '',
    institution: d['institution'] ?? '',
    officeAddress: d['officeAddress'] ?? '',
    division: d['division'],
    district: d['district'] ?? '',
    upazila: d['upazila'] ?? '',
    mobile: d['mobile'] ?? '',
    whatsapp: d['whatsapp'],
    email: d['email'],
    bloodGroup: d['bloodGroup'],
    lastDonateDate: d['lastDonateDate'],
    profilePhotoBase64: d['profilePhotoBase64'],
    status: d['status'],
    isVerified: d['isVerified'] ?? false,
    joinedAt:
      d['joinedAt'] instanceof Timestamp
        ? d['joinedAt'].toDate().toISOString()
        : d['joinedAt'] ?? new Date().toISOString(),
    updatedAt:
      d['updatedAt'] instanceof Timestamp
        ? d['updatedAt'].toDate().toISOString()
        : d['updatedAt'] ?? new Date().toISOString(),
    favorites: d['favorites'] ?? [],
  }
}

// ─── Client-side filtering ────────────────────────────────────────────────────

function applyClientFilters(
  members: Member[],
  filters: MemberFilters
): Member[] {
  let result = members

  // Search — fullName, fullNameBn, institution
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim()
    result = result.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.fullNameBn.toLowerCase().includes(q) ||
        m.institution.toLowerCase().includes(q)
    )
  }

  // Blood group (multi-select)
  if (filters.bloodGroups.length > 0) {
    result = result.filter((m) =>
      filters.bloodGroups.includes(m.bloodGroup)
    )
  }

  // Sort
  result = [...result].sort((a, b) => {
    switch (filters.sort) {
      case 'name_asc':
        return a.fullName.localeCompare(b.fullName)
      case 'division':
        return a.division.localeCompare(b.division) || a.fullName.localeCompare(b.fullName)
      case 'newest':
      default:
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    }
  })

  return result
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseMembersReturn {
  members: Member[]
  filteredMembers: Member[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  filters: MemberFilters
  setFilters: (filters: MemberFilters) => void
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useMembers(): UseMembersReturn {
  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFiltersState] = useState<MemberFilters>(DEFAULT_FILTERS)

  // Cursor ref — don't need reactivity
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  // Track current filter signature to reset on change
  const filterSigRef = useRef<string>('')

  // ── Build Firestore query constraints ──────────────────────────────────────

  const buildQuery = useCallback(
    (
      currentFilters: MemberFilters,
      lastDoc: QueryDocumentSnapshot<DocumentData> | null
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const constraints: any[] = [where('status', '==', 'active')]

      // Division
      if (currentFilters.division !== 'all') {
        constraints.push(where('division', '==', currentFilters.division))
      }

      // District
      if (currentFilters.district) {
        constraints.push(where('district', '==', currentFilters.district))
      }

      // Designation
      if (currentFilters.designation !== 'all') {
        if (currentFilters.designation === 'group_mt') {
          constraints.push(where('designation', 'in', MT_DESIGNATIONS))
        } else {
          constraints.push(where('designation', '==', currentFilters.designation))
        }
      }

      // Order — must match index
      switch (currentFilters.sort) {
        case 'name_asc':
          constraints.push(orderBy('fullName', 'asc'))
          break
        case 'division':
          constraints.push(orderBy('division', 'asc'), orderBy('fullName', 'asc'))
          break
        case 'newest':
        default:
          constraints.push(orderBy('joinedAt', 'desc'))
      }

      // Pagination cursor
      if (lastDoc) {
        constraints.push(startAfter(lastDoc))
      }

      constraints.push(limit(PAGE_SIZE + 1)) // fetch +1 to detect hasMore

      return query(collection(db, 'members'), ...constraints)
    },
    []
  )

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchMembers = useCallback(
    async (
      currentFilters: MemberFilters,
      lastDoc: QueryDocumentSnapshot<DocumentData> | null,
      append: boolean
    ) => {
      try {
        const q = buildQuery(currentFilters, lastDoc)
        const snap = await getDocs(q)
        const docs = snap.docs
        const fetchedHasMore = docs.length > PAGE_SIZE
        const sliced = fetchedHasMore ? docs.slice(0, PAGE_SIZE) : docs

        const members = sliced.map(docToMember)
        lastDocRef.current = sliced[sliced.length - 1] ?? null

        setAllMembers((prev) => (append ? [...prev, ...members] : members))
        setHasMore(fetchedHasMore)
        setError(null)
      } catch (err) {
        setError('errors.networkError')
        console.error('[useMembers] fetch error:', err)
      }
    },
    [buildQuery]
  )

  // ── Set filters (resets list) ──────────────────────────────────────────────

  const setFilters = useCallback(
    async (newFilters: MemberFilters) => {
      const sig = JSON.stringify(newFilters)
      if (sig === filterSigRef.current) return

      filterSigRef.current = sig
      setFiltersState(newFilters)
      lastDocRef.current = null
      setAllMembers([])
      setHasMore(true)
      setIsLoading(true)

      await fetchMembers(newFilters, null, false)
      setIsLoading(false)
    },
    [fetchMembers]
  )

  // ── Load more ─────────────────────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return
    setIsLoadingMore(true)
    await fetchMembers(filters, lastDocRef.current, true)
    setIsLoadingMore(false)
  }, [hasMore, isLoadingMore, isLoading, fetchMembers, filters])

  // ── Refresh ───────────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    lastDocRef.current = null
    setAllMembers([])
    setHasMore(true)
    setIsLoading(true)
    await fetchMembers(filters, null, false)
    setIsLoading(false)
  }, [fetchMembers, filters])

  // ── Client-side filter + sort ─────────────────────────────────────────────

  const filteredMembers = useMemo(
    () => applyClientFilters(allMembers, filters),
    [allMembers, filters]
  )

  return {
    members: allMembers,
    filteredMembers,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    filters,
    setFilters,
    loadMore,
    refresh,
  }
}

export function isFiltersActive(f: MemberFilters): boolean {
  return (
    f.searchQuery !== '' ||
    f.division !== 'all' ||
    f.district !== '' ||
    f.designation !== 'all' ||
    f.bloodGroups.length > 0 ||
    f.sort !== 'newest'
  )
}

// ─── useMember — single-user profile update hook ─────────────────────────────

import { updateDoc, doc } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'

interface UseMemberReturn {
  updateProfile: (data: Partial<Omit<Member, 'uid' | 'joinedAt' | 'status' | 'isVerified' | 'regNumber' | 'favorites'>>) => Promise<void>
  isUpdating: boolean
}

export function useMember(): UseMemberReturn {
  const [isUpdating, setIsUpdating] = useState(false)
  const { member, setMember } = useAuthStore()

  const updateProfile = useCallback(async (
    data: Partial<Omit<Member, 'uid' | 'joinedAt' | 'status' | 'isVerified' | 'regNumber' | 'favorites'>>
  ) => {
    if (!member?.uid) throw new Error('Not authenticated')
    setIsUpdating(true)
    try {
      const ref = doc(db, 'members', member.uid)
      const payload = { ...data, updatedAt: new Date().toISOString() }
      await updateDoc(ref, payload as Record<string, unknown>)
      setMember({ ...member, ...payload })
    } finally {
      setIsUpdating(false)
    }
  }, [member, setMember])

  return { updateProfile, isUpdating }
}