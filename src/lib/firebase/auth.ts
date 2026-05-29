import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  UserCredential,
  NextOrObserver,
} from 'firebase/auth'
import { auth } from './config'

// ─── Sign Up ───────────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    return await createUserWithEmailAndPassword(auth, email, password)
  } catch (error) {
    throw normalizeFirebaseError(error)
  }
}

// ─── Sign In ───────────────────────────────────────────────────────────────

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    throw normalizeFirebaseError(error)
  }
}

// ─── Sign Out ──────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    throw normalizeFirebaseError(error)
  }
}

// ─── Password Reset ────────────────────────────────────────────────────────

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    throw normalizeFirebaseError(error)
  }
}

// ─── Auth State Observer ───────────────────────────────────────────────────

export function onAuthStateChange(callback: NextOrObserver<User>) {
  return onAuthStateChanged(auth, callback)
}

// ─── Get ID Token for API Routes ──────────────────────────────────────────

export async function getCurrentUserIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  try {
    return await user.getIdToken()
  } catch {
    return null
  }
}

// ─── Get Current User ─────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  return auth.currentUser
}

// ─── Error Normalizer ──────────────────────────────────────────────────────

export interface FirebaseAuthError extends Error {
  code: string
}

function normalizeFirebaseError(error: unknown): FirebaseAuthError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  ) {
    const e = error as { code: string; message: string }
    const normalized: FirebaseAuthError = new Error(e.message) as FirebaseAuthError
    normalized.code = e.code
    return normalized
  }
  const fallback: FirebaseAuthError = new Error('Unknown error') as FirebaseAuthError
  fallback.code = 'unknown'
  return fallback
}