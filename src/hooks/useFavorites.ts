'use client'

import { useState, useCallback } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { Member } from '@/types'
import { Timestamp } from 'firebase/firestore'

function docToMember(id: string, d: Record<string, unknown>): Member {
  return {
    uid: id,
    fullName: (d['fullName'] as string) ?? '',
    fullNameBn: (d['fullNameBn'] as string) ?? '',
    designation: d['designation'] as Member['designation'],
    regNumber: (d['regNumber'] as string) ?? '',
    institution: (d['institution'] as string) ?? '',
    officeAddress: (d['officeAddress'] as string) ?? '',
    division: d['division'] as Member['division'],
    district: (d['district'] as string) ?? '',
    upazila: (d['upazila'] as string) ?? '',
    mobile: (d['mobile'] as string) ?? '',
    whatsapp: d['whatsapp'] as string | undefined,
    email: d['email'] as string | undefined,
    bloodGroup: d['bloodGroup'] as Member['bloodGroup'],
    lastDonateDate: d['lastDonateDate'] as string | undefined,
    profilePhotoBase64: d['profilePhotoBase64'] as string | undefined,
    status: d['status'] as Member['status'],
    isVerified: (d['isVerified'] as boolean) ?? false,
    joinedAt:
      d['joinedAt'] instanceof Timestamp
        ? (d['joinedAt'] as Timestamp).toDate().toISOString()
        : (d['joinedAt'] as string) ?? new Date().toISOString(),
    updatedAt:
      d['updatedAt'] instanceof Timestamp
        ? (d['updatedAt'] as Timestamp).toDate().toISOString()
        : (d['updatedAt'] as string) ?? new Date().toISOString(),
    favorites: (d['favorites'] as string[]) ?? [],
  }
}

interface UseFavoritesReturn {
  favoriteUids: string[]
  isFavorite: (uid: string) => boolean
  toggle: (targetUid: string) => Promise<void>
  favoriteMembers: Member[]
  isLoadingFavorites: boolean
  fetchFavoriteMembers: () => Promise<void>
}

export function useFavorites(): UseFavoritesReturn {
  const { user, member, setMember } = useAuthStore()
  const [favoriteMembers, setFavoriteMembers] = useState<Member[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set())

  const favoriteUids = member?.favorites ?? []

  const isFavorite = useCallback(
    (uid: string) => favoriteUids.includes(uid),
    [favoriteUids]
  )

  const toggle = useCallback(
    async (targetUid: string) => {
      if (!user?.uid || !member) return
      if (pendingToggles.has(targetUid)) return // debounce double-tap

      const currentlyFav = favoriteUids.includes(targetUid)
      const newFavs = currentlyFav
        ? favoriteUids.filter((id) => id !== targetUid)
        : [...favoriteUids, targetUid]

      // Optimistic update
      setMember({ ...member, favorites: newFavs })
      setPendingToggles((prev) => new Set(prev).add(targetUid))

      try {
        const ref = doc(db, 'members', user.uid)
        await updateDoc(ref, {
          favorites: currentlyFav ? arrayRemove(targetUid) : arrayUnion(targetUid),
        })
      } catch {
        // Revert optimistic update
        setMember({ ...member, favorites: favoriteUids })
        toast.error('errors.networkError')
      } finally {
        setPendingToggles((prev) => {
          const next = new Set(prev)
          next.delete(targetUid)
          return next
        })
      }
    },
    [user?.uid, member, favoriteUids, setMember, pendingToggles]
  )

  const fetchFavoriteMembers = useCallback(async () => {
    if (!favoriteUids.length) {
      setFavoriteMembers([])
      return
    }

    setIsLoadingFavorites(true)
    try {
      // Batch fetch in groups of 10 (Firestore 'in' limit)
      const chunks: string[][] = []
      for (let i = 0; i < favoriteUids.length; i += 10) {
        chunks.push(favoriteUids.slice(i, i + 10))
      }

      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const fetched = await Promise.all(
            chunk.map(async (uid) => {
              const snap = await getDoc(doc(db, 'members', uid))
              if (!snap.exists()) return null
              return docToMember(snap.id, snap.data() as Record<string, unknown>)
            })
          )
          return fetched.filter((m): m is Member => m !== null && m.status === 'active')
        })
      )

      setFavoriteMembers(results.flat())
    } catch {
      toast.error('errors.networkError')
    } finally {
      setIsLoadingFavorites(false)
    }
  }, [favoriteUids])

  return {
    favoriteUids,
    isFavorite,
    toggle,
    favoriteMembers,
    isLoadingFavorites,
    fetchFavoriteMembers,
  }
}