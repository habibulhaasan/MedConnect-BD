import type { Metadata } from 'next'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export const metadata: Metadata = {
  title: 'Auth',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <p className="font-semibold text-primary-800 text-lg leading-tight">
              MedConnect BD
            </p>
            <p className="text-xs text-primary-600 leading-tight">
              Professional Network
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-primary-600/70">
        &copy; {new Date().getFullYear()} MedConnect BD
      </footer>
    </div>
  )
}