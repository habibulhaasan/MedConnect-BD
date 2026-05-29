import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { SearchX, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const t = await getTranslations('errors')
  const locale = await getLocale()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 max-w-sm w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-6xl font-black text-primary-100">404</p>
          <h1 className="text-lg font-bold text-zinc-900">{t('pageNotFound')}</h1>
          <p className="text-sm text-zinc-500">{t('pageNotFoundDesc')}</p>
        </div>

        <Button
          asChild
          className="w-full bg-primary-600 hover:bg-primary-700 text-white gap-2"
        >
          <Link href={`/${locale}/home`}>
            <Home size={15} />
            {t('goHome')}
          </Link>
        </Button>
      </div>
    </div>
  )
}