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
      'Missing Firebase Admin environment variables. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.'
    )
  }

  const adminApp: App =
    getApps().find((app) => app.name === 'admin') ??
    initializeApp(
      {
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      },
      'admin'
    )

  adminInstance = {
    adminApp,
    adminAuth: getAuth(adminApp),
    adminDb: getFirestore(adminApp),
  }

  return adminInstance
}