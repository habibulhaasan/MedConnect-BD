import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ProfilePage } from '@/components/member/ProfilePage'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile')
  return { title: t('title') }
}

export default function Page() {
  return <ProfilePage />
}