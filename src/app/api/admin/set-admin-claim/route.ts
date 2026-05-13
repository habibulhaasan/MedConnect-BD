import { NextRequest, NextResponse } from 'next/server'
import { initAdmin } from '@/lib/firebase/admin'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { adminAuth } = await initAdmin()

    // Protect with a server-side secret for initial bootstrap
    const authHeader = request.headers.get('Authorization')
    const secretKey = process.env.ADMIN_SECRET_KEY

    let isAuthorized = false

    // Allow bootstrap via secret key OR via existing admin token
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)

      if (token === secretKey) {
        isAuthorized = true
      } else {
        try {
          const decoded = await adminAuth.verifyIdToken(token)
          isAuthorized = !!decoded.admin
        } catch {
          isAuthorized = false
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { uid: string; isAdmin: boolean }
    const { uid, isAdmin } = body

    if (!uid) {
      return NextResponse.json({ success: false, error: 'Missing uid' }, { status: 400 })
    }

    await adminAuth.setCustomUserClaims(uid, { admin: isAdmin })

    return NextResponse.json({
      success: true,
      message: `Admin claim ${isAdmin ? 'granted' : 'revoked'} for ${uid}`,
    })
  } catch (error) {
    console.error('[set-admin-claim]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}