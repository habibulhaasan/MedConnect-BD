import type { Metadata } from 'next'
import { AdminMembersPage } from '@/components/admin/AdminMembersPage'

export const metadata: Metadata = { title: 'Manage Members' }

export default function Page() {
  return <AdminMembersPage />
}