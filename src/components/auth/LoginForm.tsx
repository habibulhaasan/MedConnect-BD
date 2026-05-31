'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { loginSchema, passwordResetSchema } from '@/lib/validations/auth'
import type { LoginValues, PasswordResetValues } from '@/lib/validations/auth'
import { signInWithEmail, sendPasswordReset } from '@/lib/firebase/auth'
import { getMyMemberProfile } from '@/lib/firebase/member-api'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils/cn'

export function LoginForm() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { setUser, setMember, setIsAdmin } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false)
  const [suspensionNote, setSuspensionNote] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // Login form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  // Password reset form
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetting },
    reset: resetResetForm,
  } = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
  })

  const onLogin = async (values: LoginValues) => {
    try {
      const credential = await signInWithEmail(values.email, values.password)
      const user = credential.user
      setUser(user)

      // Check admin claim
      const idTokenResult = await user.getIdTokenResult()
      const isAdmin = !!idTokenResult.claims.admin
      setIsAdmin(isAdmin)

      // Fetch member profile
      const member = await getMyMemberProfile()
      setMember(member)

      // Admin bypass — always goes to admin dashboard
      if (isAdmin) {
        router.push(`/${locale}/admin/dashboard`)
        return
      }

      if (!member) {
        // Auth user exists but no member doc — send to registration
        router.push(`/${locale}/register`)
        return
      }

      // Route by status
      switch (member.status) {
        case 'pending_payment':
        case 'pending_approval':
          router.push(`/${locale}/register/pending`)
          break
        case 'suspended':
          setSuspensionNote(member.email ?? '')
          setSuspensionDialogOpen(true)
          break
        case 'active':
          router.push(`/${locale}/home`)
          break
        default:
          router.push(`/${locale}/home`)
      }
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown'
      const knownCodes = [
        'auth/email-already-in-use',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/too-many-requests',
        'auth/invalid-credential',
      ]
      const msgKey = knownCodes.includes(code)
        ? (`errors.${code}` as Parameters<typeof t>[0])
        : 'errors.unknown'

      setError('root', { message: t(msgKey) })
    }
  }

  const onPasswordReset = async (values: PasswordResetValues) => {
    try {
      await sendPasswordReset(values.email)
      setResetEmailSent(true)
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown'
      toast.error(
        code === 'auth/user-not-found'
          ? t('errors.auth/user-not-found')
          : t('errors.networkError')
      )
    }
  }

  const handleResetDialogClose = () => {
    setResetDialogOpen(false)
    setResetEmailSent(false)
    resetResetForm()
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900">{t('auth.loginTitle')}</h1>
          <p className="text-sm text-zinc-500">{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onLogin)} noValidate className="space-y-4">
          {/* Root error */}
          {errors.root && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              {errors.root.message}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="login-email">{t('auth.email')}</Label>
            <Input
              id="login-email"
              type="email"
              inputMode="email"
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
                onClick={() => setResetDialogOpen(true)}
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={cn('pr-10', errors.password && 'border-destructive')}
                {...register('password')}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
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
            className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white text-base font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
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
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>

      {/* ── Forgot Password Dialog ── */}
      <Dialog open={resetDialogOpen} onOpenChange={handleResetDialogClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('auth.forgotPasswordTitle')}</DialogTitle>
            <DialogDescription>{t('auth.forgotPasswordSubtitle')}</DialogDescription>
          </DialogHeader>

          {resetEmailSent ? (
            <div className="py-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
              <p className="text-sm text-zinc-700 font-medium">{t('auth.resetEmailSent')}</p>
              <p className="text-xs text-zinc-500">{t('auth.checkSpam')}</p>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit(onPasswordReset)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">{t('auth.email')}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder')}
                  aria-invalid={!!resetErrors.email}
                  className={cn(resetErrors.email && 'border-destructive')}
                  {...registerReset('email')}
                />
                {resetErrors.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {t(resetErrors.email.message as Parameters<typeof t>[0])}
                  </p>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetDialogClose}
                  disabled={isResetting}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isResetting}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isResetting ? (
                    <Loader2 size={14} className="animate-spin mr-1.5" />
                  ) : null}
                  {t('auth.sendResetLink')}
                </Button>
              </DialogFooter>
            </form>
          )}

          {resetEmailSent && (
            <DialogFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResetDialogClose}
              >
                {t('auth.backToLogin')}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Suspension Dialog ── */}
      <Dialog open={suspensionDialogOpen} onOpenChange={setSuspensionDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="text-destructive" size={20} />
              </div>
              <DialogTitle className="text-destructive">
                {t('auth.accountSuspended')}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {t('auth.accountSuspendedDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspensionDialogOpen(false)}
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

// Missing import in LoginForm:
function CheckCircle2(props: React.ComponentProps<typeof import('lucide-react').CheckCircle2>) {
  const { CheckCircle2: Icon } = require('lucide-react')
  return <Icon {...props} />
}
