import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { MembersPage } from '@/components/member/MembersPage'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('members')
  return { title: t('title') }
}

export default function Page() {
  return <MembersPage />
}