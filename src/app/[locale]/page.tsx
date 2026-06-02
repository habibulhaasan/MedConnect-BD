'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'

// This root page no longer forces redirects. It simply renders nothing.
export default function RootPage() {
  const { isLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  // Optional: if you ever need to redirect unauthenticated users, add logic here.
  // For now we keep it inert to avoid navigation loops.
  useEffect(() => {
    if (!isLoading) {
      // No automatic redirect
    }
  }, [isLoading, router, locale])

  return null
}
