import type { Metadata } from 'next'
import { PendingApprovalPage } from '@/components/auth/PendingApprovalPage'

export const metadata: Metadata = { title: 'Registration Pending' }

export default function PendingPage() {
  return <PendingApprovalPage />
}