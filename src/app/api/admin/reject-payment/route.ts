import { NextRequest, NextResponse } from 'next/server'
import { initAdmin, verifyAdminToken } from '@/lib/firebase/admin'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const caller = await verifyAdminToken(req.headers.get('Authorization'))
    const { adminDb } = await initAdmin()

    const body = await req.json() as { uid: string; paymentId: string; reason?: string }
    const { uid, paymentId, reason } = body

    if (!uid || !paymentId) {
      return NextResponse.json({ success: false, error: 'Missing uid or paymentId' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const batch = adminDb.batch()

    batch.update(adminDb.collection('members').doc(uid), {
      status: 'pending_payment',
      updatedAt: now,
    })

    batch.update(adminDb.collection('payments').doc(paymentId), {
      status: 'rejected',
      adminNote: reason ?? '',
      reviewedAt: now,
      reviewedBy: caller.uid,
    })

    await batch.commit()

    return NextResponse.json({ success: true, message: 'Payment rejected' })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    console.error('[reject-payment]', err)
    return NextResponse.json(
      { success: false, error: e.message ?? 'Internal error' },
      { status: e.status ?? 500 }
    )
  }
}