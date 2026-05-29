import { NextRequest, NextResponse } from 'next/server'
import { initAdmin, verifyAdminToken } from '@/lib/firebase/admin'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const authHeader = req.headers.get('Authorization')
    const secretKey = process.env.ADMIN_SECRET_KEY

    // Allow bootstrap via ADMIN_SECRET_KEY OR existing admin token
    let callerUid: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      if (token === secretKey) {
        callerUid = 'bootstrap'
      } else {
        const caller = await verifyAdminToken(authHeader)
        callerUid = caller.uid
      }
    }

    if (!callerUid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { adminAuth } = await initAdmin()
    const body = await req.json() as { uid: string; isAdmin: boolean }
    const { uid, isAdmin } = body

    if (!uid) {
      return NextResponse.json({ success: false, error: 'Missing uid' }, { status: 400 })
    }

    await adminAuth.setCustomUserClaims(uid, { admin: isAdmin })

    return NextResponse.json({
      success: true,
      message: `Admin claim ${isAdmin ? 'granted' : 'revoked'} for ${uid}`,
    })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    console.error('[set-admin-claim]', err)
    return NextResponse.json(
      { success: false, error: e.message ?? 'Internal error' },
      { status: e.status ?? 500 }
    )
  }
}