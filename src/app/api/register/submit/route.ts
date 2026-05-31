import { NextResponse } from 'next/server'
import { initAdmin, verifyUserToken } from '@/lib/firebase/admin'
import type { Member, PaymentSubmission } from '@/types'

type SubmitBody = {
  member?: Omit<Member, 'uid' | 'joinedAt' | 'updatedAt'>
  payment?: Omit<PaymentSubmission, 'id' | 'submittedAt' | 'status'>
}

export async function POST(request: Request) {
  try {
    const user = await verifyUserToken(request.headers.get('authorization'))
    const body = (await request.json()) as SubmitBody

    if (!body.member || !body.payment || body.payment.uid !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Invalid registration payload', code: 'register/invalid-payload' },
        { status: 400 }
      )
    }

    const { adminDb } = await initAdmin()
    const now = new Date()
    const memberRef = adminDb.collection('members').doc(user.uid)
    const paymentRef = adminDb.collection('payments').doc()
    const batch = adminDb.batch()

    const memberData = {
      ...body.member,
      status: 'pending_approval',
      isVerified: false,
      joinedAt: now,
      updatedAt: now,
    }

    batch.set(memberRef, memberData, { merge: true })
    batch.set(paymentRef, {
      ...body.payment,
      uid: user.uid,
      memberName: body.member.fullName,
      mobile: body.member.mobile,
      status: 'submitted',
      submittedAt: now,
    })

    await batch.commit()

    return NextResponse.json({
      success: true,
      data: {
        paymentId: paymentRef.id,
        member: {
          ...memberData,
          uid: user.uid,
          joinedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
    })
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error
      ? Number((error as { status: number }).status)
      : 500
    const message = error instanceof Error ? error.message : 'Failed to submit registration'
    console.error('[register/submit]', error)
    return NextResponse.json(
      { success: false, error: message, code: 'register/submit-failed' },
      { status }
    )
  }
}
