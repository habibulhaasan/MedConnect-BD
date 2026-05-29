import type { Metadata } from 'next'
import { AdminSettingsPage } from '@/components/admin/AdminSettingsPage'

export const metadata: Metadata = { title: 'App Settings' }

export default function Page() {
  return <AdminSettingsPage />
}