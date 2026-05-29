# Run this from your project root (where package.json is)
# PowerShell: .\setup-routes.ps1

$base = "src\app"

# Create directories
$dirs = @(
    "$base\[locale]",
    "$base\[locale]\(dashboard)\home",
    "$base\[locale]\(dashboard)\members",
    "$base\[locale]\(dashboard)\favorites",
    "$base\[locale]\(dashboard)\profile",
    "$base\[locale]\(dashboard)\settings",
    "$base\[locale]\(auth)\login",
    "$base\[locale]\(auth)\register",
    "$base\[locale]\(auth)\register\pending",
    "$base\[locale]\(admin)\admin\dashboard",
    "$base\[locale]\(admin)\admin\members",
    "$base\[locale]\(admin)\admin\payments",
    "$base\[locale]\(admin)\admin\settings"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "Created: $dir"
}

# ── src/app/layout.tsx ──────────────────────────────────────────────────────
Set-Content "$base\layout.tsx" @'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
'@

# ── src/app/page.tsx ────────────────────────────────────────────────────────
Set-Content "$base\page.tsx" @'
import { redirect } from "next/navigation"

export default function Page() {
  redirect("/bn/home")
}
'@

# ── src/app/[locale]/page.tsx ───────────────────────────────────────────────
Set-Content "$base\[locale]\page.tsx" @'
import { redirect } from "next/navigation"

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/home`)
}
'@

# ── src/app/[locale]/layout.tsx ─────────────────────────────────────────────
Set-Content "$base\[locale]\layout.tsx" @'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Hind_Siliguri } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { Toaster } from "sonner"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hind-siliguri",
  display: "swap",
})

const locales = ["en", "bn"] as const
type Locale = (typeof locales)[number]

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  if (!locales.includes(locale as Locale)) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0D9488" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <Toaster position="top-center" richColors closeButton duration={4000} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
'@

# ── src/app/[locale]/not-found.tsx ──────────────────────────────────────────
Set-Content "$base\[locale]\not-found.tsx" @'
import Link from "next/link"
import { getLocale } from "next-intl/server"

export default async function NotFound() {
  const locale = await getLocale()
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <p className="text-6xl font-black text-zinc-200">404</p>
        <h1 className="text-lg font-bold text-zinc-900">Page Not Found</h1>
        <Link href={`/${locale}/home`} className="text-teal-600 hover:underline">
          Go Home
        </Link>
      </div>
    </div>
  )
}
'@

# ── (dashboard) layout ───────────────────────────────────────────────────────
Set-Content "$base\[locale]\(dashboard)\layout.tsx" @'
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-zinc-50">{children}</div>
}
'@

# ── home page ────────────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(dashboard)\home\page.tsx" @'
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Home" }

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">MedConnect BD</h1>
        <p className="text-zinc-500">Routing is working!</p>
      </div>
    </div>
  )
}
'@

# ── members page ─────────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(dashboard)\members\page.tsx" @'
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Members" }
export default function MembersPage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">Members</h1></div>
}
'@

# ── favorites page ───────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(dashboard)\favorites\page.tsx" @'
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Favorites" }
export default function FavoritesPage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">Favorites</h1></div>
}
'@

# ── profile page ─────────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(dashboard)\profile\page.tsx" @'
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Profile" }
export default function ProfilePage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">My Profile</h1></div>
}
'@

# ── settings page ────────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(dashboard)\settings\page.tsx" @'
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Settings" }
export default function SettingsPage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>
}
'@

# ── (auth) layout ────────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(auth)\layout.tsx" @'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
'@

# ── login page ───────────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(auth)\login\page.tsx" @'
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Login" }
export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl border p-8">
      <h1 className="text-2xl font-bold">Login</h1>
    </div>
  )
}
'@

# ── register page ────────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(auth)\register\page.tsx" @'
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Register" }
export default function RegisterPage() {
  return (
    <div className="bg-white rounded-2xl border p-8">
      <h1 className="text-2xl font-bold">Register</h1>
    </div>
  )
}
'@

# ── register/pending page ────────────────────────────────────────────────────
Set-Content "$base\[locale]\(auth)\register\pending\page.tsx" @'
import type { Metadata } from "next"
export const metadata: Metadata = { title: "Pending" }
export default function PendingPage() {
  return (
    <div className="bg-white rounded-2xl border p-8">
      <h1 className="text-2xl font-bold">Payment Pending</h1>
    </div>
  )
}
'@

# ── (admin) layout ───────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(admin)\layout.tsx" @'
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <div className="w-60 bg-zinc-900 p-4 flex-shrink-0">
        <p className="text-white font-bold">Admin</p>
      </div>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
'@

# ── admin pages ──────────────────────────────────────────────────────────────
Set-Content "$base\[locale]\(admin)\admin\dashboard\page.tsx" @'
export default function Page() { return <h1 className="text-2xl font-bold">Admin Dashboard</h1> }
'@
Set-Content "$base\[locale]\(admin)\admin\members\page.tsx" @'
export default function Page() { return <h1 className="text-2xl font-bold">Manage Members</h1> }
'@
Set-Content "$base\[locale]\(admin)\admin\payments\page.tsx" @'
export default function Page() { return <h1 className="text-2xl font-bold">Manage Payments</h1> }
'@
Set-Content "$base\[locale]\(admin)\admin\settings\page.tsx" @'
export default function Page() { return <h1 className="text-2xl font-bold">App Settings</h1> }
'@

Write-Host ""
Write-Host "✅ All route files created!" -ForegroundColor Green
Write-Host "Now run: npm run dev" -ForegroundColor Cyan
