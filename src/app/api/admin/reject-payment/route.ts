import { NextRequest, NextResponse } from 'next/server'
import { initAdmin } from '@/lib/firebase/admin'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminAuth, adminDb } = await initAdmin()

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.slice(7)
    const decoded = await adminAuth.verifyIdToken(idToken)

    if (!decoded.admin) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as {
      uid: string
      paymentId: string
      adminNote?: string
    }
    const { uid, paymentId, adminNote } = body

    if (!uid || !paymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing uid or paymentId' },
        { status: 400 }
      )
    }

    const batch = adminDb.batch()

    // Revert member to pending_payment
    const memberRef = adminDb.collection('members').doc(uid)
    batch.update(memberRef, {
      status: 'pending_payment',
      updatedAt: new Date().toISOString(),
    })

    // Update payment status to rejected
    const paymentRef = adminDb.collection('payments').doc(paymentId)
    batch.update(paymentRef, {
      status: 'rejected',
      adminNote: adminNote ?? '',
      reviewedAt: new Date().toISOString(),
      reviewedBy: decoded.uid,
    })

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: 'Payment rejected',
    })
  } catch (error) {
    console.error('[reject-payment]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}