import type { Metadata } from 'next'
import { PendingPage } from '@/components/auth/PendingPage'

export const metadata: Metadata = {
  title: 'Payment Submitted',
}

export default function Page() {
  return <PendingPage />
}