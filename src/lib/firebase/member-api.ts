import type { User } from 'firebase/auth'
import type { Member, PaymentSubmission } from '@/types'
import { auth } from './config'

type ApiResult<T> = {
  success: boolean
  data?: T
  error?: string
  code?: string
}

async function authFetch<T>(url: string, init?: RequestInit, userOverride?: User): Promise<T> {
  // Prefer an explicit User object (e.g. freshly signed-up credential.user) over
  // auth.currentUser, which may not be populated yet immediately after sign-up.
  const currentUser = userOverride ?? auth.currentUser
  const token = await currentUser?.getIdToken()
  if (!token) {
    throw Object.assign(new Error('Missing authenticated user'), { code: 'auth/user-not-found' })
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const payload = (await response.json()) as ApiResult<T>

  if (!response.ok || !payload.success) {
    throw Object.assign(new Error(payload.error ?? 'Request failed'), {
      code: payload.code ?? `api/${response.status}`,
    })
  }

  return payload.data as T
}

export async function getMyMemberProfile(): Promise<Member | null> {
  return authFetch<Member | null>('/api/member/profile')
}

export async function submitRegistrationForReview(
  data: {
    member: Omit<Member, 'uid' | 'joinedAt' | 'updatedAt'>
    payment: Omit<PaymentSubmission, 'id' | 'submittedAt' | 'status'>
  },
  user: User
): Promise<{ member: Member; paymentId: string }> {
  return authFetch<{ member: Member; paymentId: string }>(
    '/api/register/submit',
    { method: 'POST', body: JSON.stringify(data) },
    user
  )
}