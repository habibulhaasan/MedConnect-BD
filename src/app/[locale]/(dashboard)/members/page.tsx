import type { Metadata } from 'next'
import { MembersPage } from '@/components/member/MembersPage'

export const metadata: Metadata = { title: 'Members' }

export default function Page() {
  return <MembersPage />
}