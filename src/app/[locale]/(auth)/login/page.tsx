import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'

export const metadata: Metadata = { title: 'Login' }

export default async function LoginPage() {
  const locale = await getLocale()
  const t = await getTranslations()

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8 space-y-6">
      <LoginForm />
    </div>
  )
}