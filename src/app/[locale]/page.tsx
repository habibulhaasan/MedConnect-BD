import { redirect } from 'next/navigation'

interface RootPageProps {
  params: { locale: string }
}

export default function RootPage({ params: { locale } }: RootPageProps) {
  redirect(`/${locale}/home`)
}