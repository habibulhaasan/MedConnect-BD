import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

interface AdminSDK {
  adminApp: App
  adminAuth: Auth
  adminDb: Firestore
}

let adminInstance: AdminSDK | null = null

export async function initAdmin(): Promise<AdminSDK> {
  if (adminInstance) return adminInstance

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env vars: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
    )
  }

  const adminApp: App =
    getApps().find((a) => a.name === 'admin') ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }, 'admin')

  adminInstance = {
    adminApp,
    adminAuth: getAuth(adminApp),
    adminDb: getFirestore(adminApp),
  }

  return adminInstance
}

// ─── Auth helper for API routes ───────────────────────────────────────────────

export async function verifyAdminToken(
  authHeader: string | null
): Promise<{ uid: string; email?: string }> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Missing token'), { status: 401 })
  }
  const { adminAuth } = await initAdmin()
  const decoded = await adminAuth.verifyIdToken(authHeader.slice(7))
  if (!decoded['admin']) {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }
  return { uid: decoded.uid, email: decoded.email }
}