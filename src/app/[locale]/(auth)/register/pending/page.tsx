import type { Metadata } from 'next'
import { PaymentPendingCard } from '@/components/auth/PaymentPendingCard'

export const metadata: Metadata = { title: 'Payment Pending' }

export default function PendingPage() {
  return <PaymentPendingCard />
}