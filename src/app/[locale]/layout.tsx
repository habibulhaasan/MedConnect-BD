import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Hind_Siliguri } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from 'sonner'
import '@/app/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-hind-siliguri',
  display: 'swap',
})

const locales = ['en', 'bn'] as const
type Locale = (typeof locales)[number]

export const metadata: Metadata = {
  title: {
    default: 'MedConnect BD',
    template: '%s | MedConnect BD',
  },
  description:
    'Professional contact management platform for Medical Technologists and Pharmacists in Bangladesh',
  keywords: [
    'Medical Technologist Bangladesh',
    'Pharmacist Bangladesh',
    'MedConnect BD',
    'Medical Professional Network',
  ],
  authors: [{ name: 'MedConnect BD' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0D9488',
  manifest: '/manifest.json',
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  if (!locales.includes(locale as Locale)) notFound()

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${hindSiliguri.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              classNames: {
                toast: 'font-sans',
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}