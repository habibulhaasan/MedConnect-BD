'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import type { Designation } from '@/types'

// ── Schema ─────────────────────────────────────────────────────────────────
const step1Schema = z
  .object({
    fullName: z.string().min(3, 'errors.required').max(100, 'errors.tooLong'),
    fullNameBn: z.string().min(3, 'errors.required').max(100, 'errors.tooLong'),
    designation: z.enum([
      'mt_laboratory',
      'mt_dental',
      'mt_radiology',
      'mt_radiotherapy',
      'mt_physiotherapy',
      'pharmacist',
    ] as const, { required_error: 'errors.required' }),
    regNumber: z.string().min(1, 'errors.required').max(50, 'errors.tooLong'),
    mobile: z.string().regex(/^(\+880|880|0)1[3-9]\d{8}$/, 'errors.invalidMobile'),
    email: z.string().email('errors.invalidEmail').optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'errors.passwordTooShort')
      .regex(/[A-Z]/, 'errors.passwordNeedsUppercase')
      .regex(/[0-9]/, 'errors.passwordNeedsNumber'),
    confirmPassword: z.string().min(1, 'errors.required'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'errors.passwordMismatch',
    path: ['confirmPassword'],
  })

export type Step1Values = z.infer<typeof step1Schema>

// ── MT Designation options ─────────────────────────────────────────────────
const MT_OPTIONS: { value: Designation; labelKey: string }[] = [
  { value: 'mt_laboratory',    labelKey: 'designations.mt_laboratory' },
  { value: 'mt_dental',        labelKey: 'designations.mt_dental' },
  { value: 'mt_radiology',     labelKey: 'designations.mt_radiology' },
  { value: 'mt_radiotherapy',  labelKey: 'designations.mt_radiotherapy' },
  { value: 'mt_physiotherapy', labelKey: 'designations.mt_physiotherapy' },
]

// ── Component ──────────────────────────────────────────────────────────────
interface Step1AccountInfoProps {
  defaultValues?: Partial<Step1Values>
  onComplete: (data: Step1Values) => void
}

export function Step1AccountInfo({ defaultValues, onComplete }: Step1AccountInfoProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? '',
      fullNameBn: defaultValues?.fullNameBn ?? '',
      designation: defaultValues?.designation,
      regNumber: defaultValues?.regNumber ?? '',
      mobile: defaultValues?.mobile ?? '',
      email: defaultValues?.email ?? '',
      password: defaultValues?.password ?? '',
      confirmPassword: defaultValues?.confirmPassword ?? '',
    },
  })

  const fieldError = (key: keyof Step1Values) =>
    errors[key] ? (
      <p className="text-xs text-destructive mt-1" role="alert">
        {t(errors[key]!.message as Parameters<typeof t>[0])}
      </p>
    ) : null

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t('registration.step1')}</CardTitle>
        <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-4">
          {/* Full name EN */}
          <div className="space-y-1.5">
            <Label htmlFor="s1-fullName">{t('registration.labels.fullName')}</Label>
            <Input
              id="s1-fullName"
              placeholder={t('registration.placeholders.fullName')}
              aria-invalid={!!errors.fullName}
              className={cn(errors.fullName && 'border-destructive')}
              {...register('fullName')}
            />
            {fieldError('fullName')}
          </div>

          {/* Full name BN */}
          <div className="space-y-1.5">
            <Label htmlFor="s1-fullNameBn">{t('registration.labels.fullNameBn')}</Label>
            <Input
              id="s1-fullNameBn"
              lang="bn"
              placeholder={t('registration.placeholders.fullNameBn')}
              aria-invalid={!!errors.fullNameBn}
              className={cn('font-bangla', errors.fullNameBn && 'border-destructive')}
              {...register('fullNameBn')}
            />
            {fieldError('fullNameBn')}
          </div>

          {/* Designation — grouped select */}
          <div className="space-y-1.5">
            <Label>{t('registration.labels.designation')}</Label>
            <Controller
              name="designation"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as Designation)}
                >
                  <SelectTrigger
                    className={cn('w-full', errors.designation && 'border-destructive')}
                    aria-invalid={!!errors.designation}
                  >
                    <SelectValue placeholder={t('registration.selectDesignation')} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Group 1: Medical Technologist */}
                    <SelectGroup>
                      <SelectLabel className="text-xs font-semibold text-zinc-500 px-2 py-1">
                        Medical Technologist / মেডিকেল টেকনোলজিস্ট
                      </SelectLabel>
                      {MT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {t(opt.labelKey as Parameters<typeof t>[0])}
                        </SelectItem>
                      ))}
                    </SelectGroup>

                    {/* Visual divider */}
                    <SelectSeparator />

                    {/* Group 2: Other */}
                    <SelectGroup>
                      <SelectLabel className="text-xs font-semibold text-zinc-500 px-2 py-1">
                        Other / অন্যান্য
                      </SelectLabel>
                      <SelectItem value="pharmacist">
                        {t('designations.pharmacist')} / ফার্মাসিস্ট
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {fieldError('designation')}
          </div>

          {/* Registration number */}
          <div className="space-y-1.5">
            <Label htmlFor="s1-regNumber">{t('registration.labels.regNumber')}</Label>
            <Input
              id="s1-regNumber"
              placeholder={t('registration.placeholders.regNumber')}
              aria-invalid={!!errors.regNumber}
              className={cn(errors.regNumber && 'border-destructive')}
              {...register('regNumber')}
            />
            {fieldError('regNumber')}
          </div>

          {/* Mobile */}
          <div className="space-y-1.5">
            <Label htmlFor="s1-mobile">{t('registration.labels.mobile')}</Label>
            <Input
              id="s1-mobile"
              type="tel"
              inputMode="numeric"
              placeholder={t('registration.placeholders.mobile')}
              aria-invalid={!!errors.mobile}
              className={cn(errors.mobile && 'border-destructive')}
              {...register('mobile')}
            />
            {fieldError('mobile')}
          </div>

          {/* Email (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="s1-email">
              {t('auth.email')}
              <span className="text-zinc-400 text-xs font-normal ml-1">
                ({t('common.optional')})
              </span>
            </Label>
            <Input
              id="s1-email"
              type="email"
              autoComplete="email"
              placeholder={t('auth.emailPlaceholder')}
              aria-invalid={!!errors.email}
              className={cn(errors.email && 'border-destructive')}
              {...register('email')}
            />
            {fieldError('email')}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="s1-password">{t('auth.password')}</Label>
            <div className="relative">
              <Input
                id="s1-password"
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
            <p className="text-xs text-zinc-400">
              {t('registration.passwordHint')}
            </p>
            {fieldError('password')}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="s1-confirmPassword">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="s1-confirmPassword"
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
            {fieldError('confirmPassword')}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white h-10"
          >
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