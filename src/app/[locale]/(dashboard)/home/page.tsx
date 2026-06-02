'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTranslations, useLocale } from 'next-intl'

export default function DashboardHomePage() {
  const { user, isLoading } = useAuth()
  const locale = useLocale()
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="h-12 w-48 bg-primary-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-8">
      <h1 className="mb-6 text-4xl font-bold text-primary-900">
        {locale === 'bn' ? 'স্বাগতম MedConnect BD' : 'Welcome to MedConnect BD'}
      </h1>
      {user ? (
        <p className="text-lg text-primary-700">
          {locale === 'bn' ? `হ্যালো, ${user.displayName || 'ব্যবহারকারী'}!` : `Hello, ${user.displayName || 'User'}!`}
        </p>
      ) : (
        <p className="text-lg text-primary-700">
          {locale === 'bn' ? 'দয়া করে লগইন করুন' : 'Please log in'}
        </p>
      )}
    </section>
  )
}

