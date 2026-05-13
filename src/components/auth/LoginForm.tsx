'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, ShieldAlert, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { loginSchema, forgotPasswordSchema, type LoginFormValues, type ForgotPasswordValues } from '@/lib/validations/auth'
import { signInWithEmail, sendPasswordReset } from '@/lib/firebase/auth'
import { getMember } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils/cn'

export function LoginForm() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { setUser, setMember, setIsAdmin } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [suspensionOpen, setSuspensionOpen] = useState(false)
  const [suspensionNote, setSuspensionNote] = useState<string | undefined>()
  const [resetSent, setResetSent] = useState(false)

  // ── Login form ───────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onLogin = async (values: LoginFormValues) => {
    try {
      const credential = await signInWithEmail(values.email, values.password)
      const user = credential.user
      setUser(user)

      const [idTokenResult, member] = await Promise.all([
        user.getIdTokenResult(),
        getMember(user.uid),
      ])

      setIsAdmin(!!idTokenResult.claims.admin)
      setMember(member)

      if (idTokenResult.claims.admin) {
        router.push(`/${locale}/admin/dashboard`)
        return
      }

      if (!member) {
        router.push(`/${locale}/register`)
        return
      }

      if (
        member.status === 'pending_payment' ||
        member.status === 'pending_approval'
      ) {
        router.push(`/${locale}/register/pending`)
        return
      }

      if (member.status === 'suspended') {
        // Show suspension modal instead of redirecting
        setSuspensionNote((member as unknown as { suspensionNote?: string }).suspensionNote)
        setSuspensionOpen(true)
        return
      }

      // active
      router.push(`/${locale}/home`)
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown'
      toast.error(
        t((`errors.${code}`) as Parameters<typeof t>[0]) ?? t('errors.unknown')
      )
    }
  }

  // ── Forgot password form ─────────────────────────────────────────────────
  const forgotForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onForgotSubmit = async (values: ForgotPasswordValues) => {
    try {
      await sendPasswordReset(values.email)
      setResetSent(true)
      toast.success(t('auth.resetEmailSent'))
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown'
      toast.error(
        t((`errors.${code}`) as Parameters<typeof t>[0]) ?? t('errors.unknown')
      )
    }
  }

  return (
    <>
      <Card className="border-zinc-100 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-semibold text-zinc-900">
            {t('auth.loginTitle')}
          </CardTitle>
          <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onLogin)} noValidate className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email">{t('auth.email')}</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.emailPlaceholder')}
                aria-invalid={!!errors.email}
                className={cn(errors.email && 'border-destructive')}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive" role="alert">
                  {t(errors.email.message as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">{t('auth.password')}</Label>
                <button
                  type="button"
                  onClick={() => { setForgotOpen(true); setResetSent(false) }}
                  className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder')}
                  aria-invalid={!!errors.password}
                  className={cn('pr-10', errors.password && 'border-destructive')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {t(errors.password.message as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-primary-600 hover:bg-primary-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              {t('auth.noAccount')}{' '}
              <Link
                href={`/${locale}/register`}
                className="font-medium text-primary-600 hover:underline"
              >
                {t('auth.register')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* ── Forgot Password Dialog ─────────────────────────────────────── */}
      <Dialog open={forgotOpen} onOpenChange={(v) => { setForgotOpen(v); setResetSent(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('auth.forgotPasswordTitle')}</DialogTitle>
            <DialogDescription>{t('auth.forgotPasswordSubtitle')}</DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Mail size={22} className="text-green-600" />
              </div>
              <p className="text-sm text-zinc-600">{t('auth.resetEmailSent')}</p>
            </div>
          ) : (
            <form
              onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
              noValidate
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email">{t('auth.email')}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  aria-invalid={!!forgotForm.formState.errors.email}
                  className={cn(
                    forgotForm.formState.errors.email && 'border-destructive'
                  )}
                  {...forgotForm.register('email')}
                />
                {forgotForm.formState.errors.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {t(
                      forgotForm.formState.errors.email
                        .message as Parameters<typeof t>[0]
                    )}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={forgotForm.formState.isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {forgotForm.formState.isSubmitting ? (
                    <Loader2 size={15} className="mr-2 animate-spin" />
                  ) : null}
                  {t('auth.sendResetLink')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Suspension Dialog ──────────────────────────────────────────── */}
      <Dialog open={suspensionOpen} onOpenChange={setSuspensionOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldAlert size={20} className="text-destructive" />
              </div>
              <DialogTitle className="text-destructive">
                {t('auth.accountSuspended')}
              </DialogTitle>
            </div>
            <DialogDescription>
              {t('auth.accountSuspendedDesc')}
            </DialogDescription>
          </DialogHeader>

          {suspensionNote && (
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
              <p className="text-xs font-medium text-zinc-500 mb-1">
                {t('admin.adminNote')}
              </p>
              <p className="text-sm text-zinc-700">{suspensionNote}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspensionOpen(false)}
              className="w-full"
            >
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}