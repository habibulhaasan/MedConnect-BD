import type { Metadata } from 'next'
import { FavoritesPage } from '@/components/member/FavoritesPage'

export const metadata: Metadata = { title: 'Favorites' }

export default function Page() {
  return <FavoritesPage />
}