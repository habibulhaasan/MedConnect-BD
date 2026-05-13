'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'
import { signInWithEmail } from '@/lib/firebase/auth'
import { getMember } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils/cn'

export function LoginForm() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { setUser, setMember, setIsAdmin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const credential = await signInWithEmail(values.email, values.password)
      const user = credential.user

      setUser(user)

      const idTokenResult = await user.getIdTokenResult()
      setIsAdmin(!!idTokenResult.claims.admin)

      const member = await getMember(user.uid)
      setMember(member)

      if (idTokenResult.claims.admin) {
        router.push(`/${locale}/admin/dashboard`)
        return
      }

      if (!member) {
        router.push(`/${locale}/register`)
        return
      }

      if (member.status === 'pending_payment') {
        router.push(`/${locale}/register/pending`)
        return
      }

      router.push(`/${locale}/home`)
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown'
      const messageKey = `errors.${code}` as Parameters<typeof t>[0]
      toast.error(t(messageKey) ?? t('errors.unknown'))
    }
  }

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-semibold text-zinc-900">
          {t('auth.loginTitle')}
        </CardTitle>
        <CardDescription className="text-zinc-500">
          {t('auth.loginSubtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
              {t('auth.email')}
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive" role="alert">
                {t(errors.email.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                {t('auth.password')}
              </Label>
              <Link
                href={`/${locale}/forgot-password`}
                className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('auth.passwordPlaceholder')}
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
                className={cn(
                  'pr-10',
                  errors.password && 'border-destructive focus-visible:ring-destructive'
                )}
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
              <p id="password-error" className="text-xs text-destructive" role="alert">
                {t(errors.password.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
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

          {/* Register link */}
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
      </CardContent>
    </Card>
  )
}