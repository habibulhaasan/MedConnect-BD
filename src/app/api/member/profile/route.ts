import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { initAdmin, verifyUserToken } from '@/lib/firebase/admin'
import type { Member } from '@/types'

function toIsoDate(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function serializeMember(uid: string, data: FirebaseFirestore.DocumentData): Member {
  return {
    uid,
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
    joinedAt: toIsoDate(data.joinedAt),
    updatedAt: toIsoDate(data.updatedAt),
    favorites: data.favorites ?? [],
  }
}

export async function GET(request: Request) {
  try {
    const user = await verifyUserToken(request.headers.get('authorization'))
    const { adminDb } = await initAdmin()
    const snapshot = await adminDb.collection('members').doc(user.uid).get()

    return NextResponse.json({
      success: true,
      data: snapshot.exists ? serializeMember(user.uid, snapshot.data() ?? {}) : null,
    })
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error
      ? Number((error as { status: number }).status)
      : 500
    const message = error instanceof Error ? error.message : 'Failed to fetch profile'
    console.error('[member/profile]', error)
    return NextResponse.json(
      { success: false, error: message, code: 'member/profile-failed' },
      { status }
    )
  }
}
