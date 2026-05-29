import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Hind_Siliguri } from 'next/font/google'
import { Toaster } from 'sonner'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-hind-siliguri',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MedConnect BD',
  description: 'Professional medical network for Bangladesh',
}

export const viewport: Viewport = {
  themeColor: '#0D9488',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton duration={4000} />
      </body>
    </html>
  )
}
