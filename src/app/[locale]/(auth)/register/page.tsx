import type { Metadata } from 'next'
import { RegistrationPage } from '@/components/auth/RegistrationPage'

export const metadata: Metadata = {
  title: 'Register',
}

export default function Page() {
  return <RegistrationPage />
}