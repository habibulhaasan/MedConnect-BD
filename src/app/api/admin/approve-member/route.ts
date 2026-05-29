import { NextRequest, NextResponse } from 'next/server'
import { initAdmin, verifyAdminToken } from '@/lib/firebase/admin'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const caller = await verifyAdminToken(req.headers.get('Authorization'))
    const { adminDb } = await initAdmin()

    const body = await req.json() as { uid: string; paymentId: string }
    const { uid, paymentId } = body

    if (!uid || !paymentId) {
      return NextResponse.json({ success: false, error: 'Missing uid or paymentId' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const batch = adminDb.batch()

    batch.update(adminDb.collection('members').doc(uid), {
      status: 'active',
      isVerified: true,
      updatedAt: now,
    })

    batch.update(adminDb.collection('payments').doc(paymentId), {
      status: 'verified',
      reviewedAt: now,
      reviewedBy: caller.uid,
    })

    await batch.commit()

    return NextResponse.json({ success: true, message: 'Member approved' })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    const status = e.status ?? 500
    console.error('[approve-member]', err)
    return NextResponse.json(
      { success: false, error: e.message ?? 'Internal error' },
      { status }
    )
  }
}