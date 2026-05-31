import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  Timestamp,
  FieldValue,
} from 'firebase/firestore'
import { db } from './config'
import type {
  Member,
  PaymentSubmission,
  AppConfig,
  MemberFilters,
  PaginatedResult,
  PaginationCursor,
} from '@/types'

// ─── Collection References ─────────────────────────────────────────────────

const COLLECTIONS = {
  MEMBERS: 'members',
  PAYMENTS: 'payments',
  APP_CONFIG: 'app_config',
} as const

// ─── Data Transformers ─────────────────────────────────────────────────────

function docToMember(doc: DocumentSnapshot | QueryDocumentSnapshot): Member {
  const data = doc.data()
  if (!data) throw new Error(`Member document ${doc.id} has no data`)

  return {
    uid: doc.id,
    fullName: data.fullName ?? '',
    fullNameBn: data.fullNameBn ?? '',
    designation: data.designation,
    regNumber: data.regNumber ?? '',
    institution: data.institution ?? '',
    officeAddress: data.officeAddress ?? '',
    division: data.division,
    district: data.district ?? '',
    upazila: data.upazila ?? '',
    mobile: data.mobile ?? '',
    whatsapp: data.whatsapp,
    email: data.email,
    bloodGroup: data.bloodGroup,
    lastDonateDate: data.lastDonateDate,
    profilePhotoBase64: data.profilePhotoBase64,
    status: data.status,
    isVerified: data.isVerified ?? false,
    joinedAt:
      data.joinedAt instanceof Timestamp
        ? data.joinedAt.toDate().toISOString()
        : data.joinedAt ?? new Date().toISOString(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt ?? new Date().toISOString(),
    favorites: data.favorites ?? [],
  }
}

function docToPayment(
  doc: DocumentSnapshot | QueryDocumentSnapshot
): PaymentSubmission {
  const data = doc.data()
  if (!data) throw new Error(`Payment document ${doc.id} has no data`)

  return {
    id: doc.id,
    uid: data.uid,
    memberName: data.memberName ?? '',
    mobile: data.mobile ?? '',
    amount: data.amount ?? 0,
    method: data.method ?? 'bkash',
    transactionId: data.transactionId ?? data.bkashTrxId ?? '',
    senderNumber: data.senderNumber ?? data.bkashSenderNumber ?? '',
    // legacy fields — kept for backwards compatibility with old documents
    bkashTrxId: data.bkashTrxId,
    bkashSenderNumber: data.bkashSenderNumber,
    screenshotBase64: data.screenshotBase64,
    status: data.status,
    adminNote: data.adminNote,
    submittedAt:
      data.submittedAt instanceof Timestamp
        ? data.submittedAt.toDate().toISOString()
        : data.submittedAt ?? new Date().toISOString(),
    reviewedAt:
      data.reviewedAt instanceof Timestamp
        ? data.reviewedAt.toDate().toISOString()
        : data.reviewedAt,
    reviewedBy: data.reviewedBy,
  }
}

// ─── Member Operations ─────────────────────────────────────────────────────

export async function getMember(uid: string): Promise<Member | null> {
  try {
    const ref = doc(db, COLLECTIONS.MEMBERS, uid)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    return docToMember(snapshot)
  } catch (error) {
    throw new Error(`Failed to fetch member: ${String(error)}`)
  }
}

export async function createMember(
  uid: string,
  data: Omit<Member, 'uid' | 'joinedAt' | 'updatedAt'>
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.MEMBERS, uid)
    await setDoc(ref, {
      ...data,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    throw new Error(`Failed to create member: ${String(error)}`)
  }
}

export async function updateMember(
  uid: string,
  data: Partial<Omit<Member, 'uid' | 'joinedAt'>>
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.MEMBERS, uid)
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    } as Record<string, unknown>)
  } catch (error) {
    throw new Error(`Failed to update member: ${String(error)}`)
  }
}

// ─── Member Browse with Filters + Pagination ───────────────────────────────

export async function getActiveMembers(
  filters: MemberFilters,
  cursor: PaginationCursor
): Promise<PaginatedResult<Member>> {
  try {
    const membersRef = collection(db, COLLECTIONS.MEMBERS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraints: any[] = [where('status', '==', 'active')]

    if (filters.designation && filters.designation !== 'all') {
      if (filters.designation === 'group_mt') {
        constraints.push(
          where('designation', 'in', [
            'mt_laboratory',
            'mt_dental',
            'mt_radiology',
            'mt_radiotherapy',
            'mt_physiotherapy',
          ])
        )
      } else {
        constraints.push(where('designation', '==', filters.designation))
      }
    }

    if (filters.division && filters.division !== 'all') {
      constraints.push(where('division', '==', filters.division))
    }

    if (filters.district) {
      constraints.push(where('district', '==', filters.district))
    }

    if (filters.bloodGroup && filters.bloodGroup !== 'all') {
      constraints.push(where('bloodGroup', '==', filters.bloodGroup))
    }

    constraints.push(orderBy('fullName', 'asc'))
    constraints.push(limit(cursor.pageSize + 1))

    if (cursor.lastDoc) {
      constraints.push(startAfter(cursor.lastDoc))
    }

    const q = query(membersRef, ...constraints)
    const snapshot = await getDocs(q)

    const docs = snapshot.docs
    const hasMore = docs.length > cursor.pageSize
    const slicedDocs = hasMore ? docs.slice(0, cursor.pageSize) : docs

    const members = slicedDocs.map(docToMember)

    return {
      data: members,
      cursor: {
        lastDoc: slicedDocs[slicedDocs.length - 1] ?? null,
        hasMore,
        pageSize: cursor.pageSize,
      },
    }
  } catch (error) {
    throw new Error(`Failed to fetch members: ${String(error)}`)
  }
}

// ─── Payment Operations ────────────────────────────────────────────────────

export async function getPaymentSubmission(
  uid: string
): Promise<PaymentSubmission | null> {
  try {
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS)
    const q = query(
      paymentsRef,
      where('uid', '==', uid),
      orderBy('submittedAt', 'desc'),
      limit(1)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return docToPayment(snapshot.docs[0])
  } catch (error) {
    throw new Error(`Failed to fetch payment: ${String(error)}`)
  }
}

export async function createPaymentSubmission(
  data: Omit<PaymentSubmission, 'id' | 'submittedAt' | 'status'>
): Promise<string> {
  try {
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS)
    const docRef = await addDoc(paymentsRef, {
      ...data,
      status: 'submitted' as const,
      submittedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    throw new Error(`Failed to submit payment: ${String(error)}`)
  }
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'verified' | 'rejected',
  adminNote?: string,
  reviewedBy?: string
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.PAYMENTS, paymentId)
    const updateData: Record<string, string | FieldValue> = {
      status,
      reviewedAt: serverTimestamp() as FieldValue,
    }
    if (adminNote) updateData.adminNote = adminNote
    if (reviewedBy) updateData.reviewedBy = reviewedBy
    await updateDoc(ref, updateData)
  } catch (error) {
    throw new Error(`Failed to update payment status: ${String(error)}`)
  }
}

// ─── Admin: All Payments ───────────────────────────────────────────────────

export async function getAllPayments(
  statusFilter?: 'submitted' | 'verified' | 'rejected'
): Promise<PaymentSubmission[]> {
  try {
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraints: any[] = [orderBy('submittedAt', 'desc')]

    if (statusFilter) {
      constraints.unshift(where('status', '==', statusFilter))
    }

    const q = query(paymentsRef, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(docToPayment)
  } catch (error) {
    throw new Error(`Failed to fetch payments: ${String(error)}`)
  }
}

// ─── Admin: All Members ────────────────────────────────────────────────────

export async function getAllMembers(
  statusFilter?: 'pending_payment' | 'pending_approval' | 'active' | 'suspended'
): Promise<Member[]> {
  try {
    const membersRef = collection(db, COLLECTIONS.MEMBERS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraints: any[] = [orderBy('joinedAt', 'desc')]

    if (statusFilter) {
      constraints.unshift(where('status', '==', statusFilter))
    }

    const q = query(membersRef, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(docToMember)
  } catch (error) {
    throw new Error(`Failed to fetch all members: ${String(error)}`)
  }
}

// ─── App Config ────────────────────────────────────────────────────────────

export async function getAppConfig(): Promise<AppConfig | null> {
  try {
    const ref = doc(db, COLLECTIONS.APP_CONFIG, 'config')
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    const data = snapshot.data()
    return data as AppConfig
  } catch (error) {
    throw new Error(`Failed to fetch app config: ${String(error)}`)
  }
}

export async function updateAppConfig(
  data: Partial<AppConfig>
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.APP_CONFIG, 'config')
    await setDoc(ref, data, { merge: true })
  } catch (error) {
    throw new Error(`Failed to update app config: ${String(error)}`)
  }
}