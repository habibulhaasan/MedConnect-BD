import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { LocaleSwitcherButton } from '@/components/shared/LocaleSwitcherButton'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common')
  return {
    title: {
      default: t('appName'),
      template: `%s | ${t('appName')}`,
    },
  }
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col">
      {/* Top bar */}
      <header className="w-full px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg leading-none">M</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-primary-800 text-base">MedConnect BD</p>
            <p className="text-xs text-primary-500 hidden sm:block">
              Professional Network
            </p>
          </div>
        </div>

        {/* Language switcher */}
        <LocaleSwitcherButton />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 w-full">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-primary-400">
        &copy; {new Date().getFullYear()} MedConnect BD. All rights reserved.
      </footer>
    </div>
  )
}