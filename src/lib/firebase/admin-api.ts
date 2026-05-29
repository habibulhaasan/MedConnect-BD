import { getCurrentUserIdToken } from './auth'
import type { ApiResponse } from '@/types'

async function adminPost<T = void>(
  path: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const token = await getCurrentUserIdToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json() as ApiResponse<T>
  if (!data.success) throw new Error(data.error ?? 'Request failed')
  return data
}

export const adminApi = {
  approveMember: (uid: string, paymentId: string) =>
    adminPost('/api/admin/approve-member', { uid, paymentId }),

  rejectPayment: (uid: string, paymentId: string, reason: string) =>
    adminPost('/api/admin/reject-payment', { uid, paymentId, reason }),

  setAdminClaim: (uid: string, isAdmin: boolean) =>
    adminPost('/api/admin/set-admin-claim', { uid, isAdmin }),

  updateMember: (uid: string, data: Record<string, unknown>) =>
    adminPost('/api/admin/update-member', { uid, data }),
}