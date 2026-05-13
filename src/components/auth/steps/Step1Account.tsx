'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { registerStep1Schema, type RegisterStep1Values } from '@/lib/validations/auth'
import { cn } from '@/lib/utils/cn'
import type { RegistrationFormData } from '@/types'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface Step1Props {
  defaultValues: Partial<RegistrationFormData>
  onComplete: (data: Pick<RegistrationFormData, 'email' | 'password' | 'confirmPassword'>) => void
}

export function Step1Account({ defaultValues, onComplete }: Step1Props) {
  const t = useTranslations()
  const locale = useLocale()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStep1Values>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      email: defaultValues.email ?? '',
      password: defaultValues.password ?? '',
      confirmPassword: defaultValues.confirmPassword ?? '',
    },
  })

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t('auth.registerTitle')}</CardTitle>
        <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">{t('auth.email')}</Label>
            <Input
              id="reg-email"
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

          <div className="space-y-1.5">
            <Label htmlFor="reg-password">{t('auth.password')}</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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

          <div className="space-y-1.5">
            <Label htmlFor="reg-confirm">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={t('auth.passwordPlaceholder')}
                aria-invalid={!!errors.confirmPassword}
                className={cn('pr-10', errors.confirmPassword && 'border-destructive')}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.confirmPassword.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white">
            {t('registration.next')}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            {t('auth.haveAccount')}{' '}
            <Link
              href={`/${locale}/login`}
              className="font-medium text-primary-600 hover:underline"
            >
              {t('auth.login')}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}