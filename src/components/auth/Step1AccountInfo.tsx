'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { step1Schema, type Step1Values } from '@/lib/validations/auth'
import { useRegistrationStore } from '@/stores/registrationStore'
import { ALL_DESIGNATIONS } from '@/types'
import { cn } from '@/lib/utils/cn'
import type { Designation } from '@/types'

interface Step1Props {
  onNext: () => void
}

export function Step1AccountInfo({ onNext }: Step1Props) {
  const t = useTranslations()
  const { step1, setStep1 } = useRegistrationStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: step1.fullName,
      fullNameBn: step1.fullNameBn,
      designation: step1.designation as Designation | undefined,
      regNumber: step1.regNumber,
      mobile: step1.mobile,
      email: step1.email,
      password: step1.password,
      confirmPassword: step1.confirmPassword,
    },
  })

  const onSubmit = (values: Step1Values) => {
    setStep1(values)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Full name English */}
      <div className="space-y-1.5">
        <Label htmlFor="fullName">
          {t('registration.labels.fullName')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Input
          id="fullName"
          placeholder={t('registration.placeholders.fullName')}
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          className={cn(errors.fullName && 'border-destructive')}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.fullName.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Full name Bangla */}
      <div className="space-y-1.5">
        <Label htmlFor="fullNameBn">
          {t('registration.labels.fullNameBn')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Input
          id="fullNameBn"
          lang="bn"
          placeholder={t('registration.placeholders.fullNameBn')}
          aria-invalid={!!errors.fullNameBn}
          className={cn('font-bangla', errors.fullNameBn && 'border-destructive')}
          {...register('fullNameBn')}
        />
        {errors.fullNameBn && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.fullNameBn.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Designation */}
      <div className="space-y-1.5">
        <Label>
          {t('registration.labels.designation')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Select
          defaultValue={step1.designation || undefined}
          onValueChange={(v) =>
            setValue('designation', v as Designation, { shouldValidate: true })
          }
        >
          <SelectTrigger
            aria-invalid={!!errors.designation}
            className={cn(errors.designation && 'border-destructive')}
          >
            <SelectValue placeholder={t('registration.selectDesignation')} />
          </SelectTrigger>
          <SelectContent>
            {ALL_DESIGNATIONS.map((d) => (
              <SelectItem key={d} value={d}>
                {t(`designations.${d}` as Parameters<typeof t>[0])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.designation && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.designation.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Registration number */}
      <div className="space-y-1.5">
        <Label htmlFor="regNumber">
          {t('registration.labels.regNumber')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Input
          id="regNumber"
          placeholder={t('registration.placeholders.regNumber')}
          aria-invalid={!!errors.regNumber}
          className={cn(errors.regNumber && 'border-destructive')}
          {...register('regNumber')}
        />
        {errors.regNumber && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.regNumber.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Mobile */}
      <div className="space-y-1.5">
        <Label htmlFor="mobile">
          {t('registration.labels.mobile')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Input
          id="mobile"
          type="tel"
          inputMode="numeric"
          placeholder="01XXXXXXXXX"
          autoComplete="tel"
          aria-invalid={!!errors.mobile}
          className={cn(errors.mobile && 'border-destructive')}
          {...register('mobile')}
        />
        {errors.mobile && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.mobile.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Email (optional) */}
      <div className="space-y-1.5">
        <Label htmlFor="email">
          {t('registration.labels.email')}
          <span className="text-zinc-400 text-xs ml-1.5">({t('common.optional')})</span>
        </Label>
        <Input
          id="email"
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
        <Label htmlFor="password">
          {t('auth.password')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
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
        <p className="text-xs text-zinc-400">{t('auth.passwordHint')}</p>
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">
          {t('auth.confirmPassword')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('auth.passwordPlaceholder')}
            aria-invalid={!!errors.confirmPassword}
            className={cn('pr-10', errors.confirmPassword && 'border-destructive')}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? t('auth.hidePassword') : t('auth.showPassword')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
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

      <Button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white h-11 text-base"
      >
        {t('registration.next')}
      </Button>
    </form>
  )
}