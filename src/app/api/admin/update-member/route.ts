import { NextRequest, NextResponse } from 'next/server'
import { initAdmin, verifyAdminToken } from '@/lib/firebase/admin'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await verifyAdminToken(req.headers.get('Authorization'))
    const { adminDb } = await initAdmin()

    const body = await req.json() as { uid: string; data: Record<string, unknown> }
    const { uid, data } = body

    if (!uid || !data) {
      return NextResponse.json({ success: false, error: 'Missing uid or data' }, { status: 400 })
    }

    await adminDb.collection('members').doc(uid).update({
      ...data,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: 'Member updated' })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    console.error('[update-member]', err)
    return NextResponse.json(
      { success: false, error: e.message ?? 'Internal error' },
      { status: e.status ?? 500 }
    )
  }
}