'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { LandingPage } from '@/components/shared/LandingPage'
import { useEffect } from 'react'

export default function LandingPageWrapper() {
  const { user, member, isLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  useEffect(() => {
    if (isLoading) return

    if (user && member) {
      router.push(`/${locale}/home`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, member?.id, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-primary-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (user && member) {
    return null
  }

  return <LandingPage />
}

