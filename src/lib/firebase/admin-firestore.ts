import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  doc,
  deleteDoc,
  Unsubscribe,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './config'
import type { Member, PaymentSubmission, PaymentStatus, MemberStatus } from '@/types'

// ─── Transforms ───────────────────────────────────────────────────────────────

function toMember(id: string, d: Record<string, unknown>): Member {
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
    status: d['status'] as MemberStatus,
    isVerified: (d['isVerified'] as boolean) ?? false,
    joinedAt:
      d['joinedAt'] instanceof Timestamp
        ? (d['joinedAt'] as Timestamp).toDate().toISOString()
        : (d['joinedAt'] as string) ?? '',
    updatedAt:
      d['updatedAt'] instanceof Timestamp
        ? (d['updatedAt'] as Timestamp).toDate().toISOString()
        : (d['updatedAt'] as string) ?? '',
    favorites: (d['favorites'] as string[]) ?? [],
  }
}

function toPayment(id: string, d: Record<string, unknown>): PaymentSubmission {
  return {
    id,
    uid: (d['uid'] as string) ?? '',
    memberName: (d['memberName'] as string) ?? '',
    mobile: (d['mobile'] as string) ?? '',
    amount: (d['amount'] as number) ?? 0,
    bkashTrxId: (d['bkashTrxId'] as string) ?? '',
    bkashSenderNumber: (d['bkashSenderNumber'] as string) ?? '',
    screenshotBase64: d['screenshotBase64'] as string | undefined,
    status: (d['status'] as PaymentStatus) ?? 'submitted',
    adminNote: d['adminNote'] as string | undefined,
    submittedAt:
      d['submittedAt'] instanceof Timestamp
        ? (d['submittedAt'] as Timestamp).toDate().toISOString()
        : (d['submittedAt'] as string) ?? '',
    reviewedAt:
      d['reviewedAt'] instanceof Timestamp
        ? (d['reviewedAt'] as Timestamp).toDate().toISOString()
        : (d['reviewedAt'] as string | undefined),
    reviewedBy: d['reviewedBy'] as string | undefined,
  }
}

// ─── Real-time listeners ──────────────────────────────────────────────────────

export function subscribeAllMembers(
  statusFilter: MemberStatus | 'all',
  callback: (members: Member[]) => void
): Unsubscribe {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraints: any[] = [orderBy('joinedAt', 'desc')]
  if (statusFilter !== 'all') {
    constraints.unshift(where('status', '==', statusFilter))
  }
  const q = query(collection(db, 'members'), ...constraints)
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toMember(d.id, d.data() as Record<string, unknown>)))
  })
}

export function subscribeAllPayments(
  statusFilter: PaymentStatus | 'all',
  callback: (payments: PaymentSubmission[]) => void
): Unsubscribe {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraints: any[] = [orderBy('submittedAt', 'desc')]
  if (statusFilter !== 'all') {
    constraints.unshift(where('status', '==', statusFilter))
  }
  const q = query(collection(db, 'payments'), ...constraints)
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toPayment(d.id, d.data() as Record<string, unknown>)))
  })
}

export function subscribePendingApprovals(
  callback: (members: Member[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'members'),
    where('status', '==', 'pending_approval'),
    orderBy('updatedAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toMember(d.id, d.data() as Record<string, unknown>)))
  })
}

export function subscribeRecentActivity(
  callback: (payments: PaymentSubmission[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'payments'),
    orderBy('submittedAt', 'desc'),
    limit(10)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => toPayment(d.id, d.data() as Record<string, unknown>)))
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalActive: number
  pendingPayment: number
  pendingApproval: number
  totalRevenue: number
  newThisWeek: number
  byDesignation: Record<string, number>
}

export function subscribeAdminStats(
  callback: (stats: AdminStats) => void
): Unsubscribe {
  // Subscribe to all members for stats computation
  const q = query(collection(db, 'members'), orderBy('joinedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const members = snap.docs.map((d) => toMember(d.id, d.data() as Record<string, unknown>))
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const stats: AdminStats = {
      totalActive: 0,
      pendingPayment: 0,
      pendingApproval: 0,
      totalRevenue: 0,
      newThisWeek: 0,
      byDesignation: {},
    }

    for (const m of members) {
      if (m.status === 'active') stats.totalActive++
      if (m.status === 'pending_payment') stats.pendingApproval++ // count under pending_approval
      if (m.status === 'pending_approval') stats.pendingApproval++
      if (new Date(m.joinedAt) > oneWeekAgo) stats.newThisWeek++
      stats.byDesignation[m.designation] = (stats.byDesignation[m.designation] ?? 0) + 1
    }

    callback(stats)
  })
}

export function subscribeRevenueStats(
  registrationFee: number,
  callback: (revenue: number) => void
): Unsubscribe {
  const q = query(collection(db, 'payments'), where('status', '==', 'verified'))
  return onSnapshot(q, (snap) => {
    callback(snap.size * registrationFee)
  })
}

// ─── One-time fetches ──────────────────────────────────────────────────────────

export async function deleteMember(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'members', uid))
}

export async function getPaymentForMember(uid: string): Promise<PaymentSubmission | null> {
  const q = query(
    collection(db, 'payments'),
    where('uid', '==', uid),
    where('status', '==', 'submitted'),
    orderBy('submittedAt', 'desc'),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]!
  return toPayment(d.id, d.data() as Record<string, unknown>)
}