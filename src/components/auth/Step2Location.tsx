'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { step2Schema, type Step2Values } from '@/lib/validations/member'
import { useRegistrationStore } from '@/stores/registrationStore'
import { getBdDivisionBySlug, getDistrictsByDivisionSlug } from '@/lib/utils/bd-data'
import { cn } from '@/lib/utils/cn'
import type { District, Upazila } from '@/lib/utils/bd-data'
import { ALL_DIVISIONS, type Division } from '@/types'

interface Step2Props {
  onNext: () => void
  onBack: () => void
}

export function Step2Location({ onNext, onBack }: Step2Props) {
  const t = useTranslations()
  const { step1, step2, setStep2 } = useRegistrationStore()

  const [selectedDivision, setSelectedDivision] = useState<Division | ''>(step2.division)
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(step2.district)
  const [charCount, setCharCount] = useState(step2.officeAddress.length)

  const currentDivision = selectedDivision ? getBdDivisionBySlug(selectedDivision) : undefined
  const divisionDistricts = selectedDivision ? getDistrictsByDivisionSlug(selectedDivision) : []
  const currentDistrict = divisionDistricts.find((d) => d.id === selectedDistrictId)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      division: step2.division as Division | undefined,
      district: step2.district,
      upazila: step2.upazila,
      institution: step2.institution,
      officeAddress: step2.officeAddress,
      whatsapp: step2.whatsapp,
      sameAsMobile: step2.sameAsMobile,
    },
  })

  const sameAsMobile = watch('sameAsMobile')

  useEffect(() => {
    if (sameAsMobile) {
      setValue('whatsapp', step1.mobile, { shouldValidate: true })
    }
  }, [sameAsMobile, step1.mobile, setValue])

  const onSubmit = (values: Step2Values) => {
    setStep2(values)
    onNext()
  }

  const officeAddress = watch('officeAddress')
  useEffect(() => {
    setCharCount(officeAddress?.length ?? 0)
  }, [officeAddress])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Division */}
      <div className="space-y-1.5">
        <Label>
          {t('registration.labels.division')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Controller
          name="division"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v as Division)
                setSelectedDivision(v as Division)
                setSelectedDistrictId('')
                setValue('district', '', { shouldValidate: false })
                setValue('upazila', '', { shouldValidate: false })
              }}
            >
              <SelectTrigger
                aria-invalid={!!errors.division}
                className={cn(errors.division && 'border-destructive')}
              >
                <SelectValue placeholder={t('registration.selectDivision')} />
              </SelectTrigger>
              <SelectContent>
                {ALL_DIVISIONS.map((slug) => {
                  const div = getBdDivisionBySlug(slug)
                  return (
                    <SelectItem key={slug} value={slug}>
                      {t(`divisions.${slug}`)} ({div?.nameBn})
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )}
        />
        {errors.division && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.division.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* District — filtered by division */}
      <div className="space-y-1.5">
        <Label>
          {t('registration.labels.district')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Controller
          name="district"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              disabled={!currentDivision}
              onValueChange={(v) => {
                field.onChange(v)
                setSelectedDistrictId(v)
                setValue('upazila', '', { shouldValidate: false })
              }}
            >
              <SelectTrigger
                aria-invalid={!!errors.district}
                aria-disabled={!currentDivision}
                className={cn(
                  errors.district && 'border-destructive',
                  !currentDivision && 'opacity-60 cursor-not-allowed'
                )}
              >
                <SelectValue
                  placeholder={
                    currentDivision
                      ? t('registration.selectDistrict')
                      : t('registration.selectDivisionFirst')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {divisionDistricts.map((d: District) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.nameBn})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.district && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.district.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Upazila — filtered by district */}
      <div className="space-y-1.5">
        <Label>
          {t('registration.labels.upazila')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Controller
          name="upazila"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              disabled={!currentDistrict}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                aria-invalid={!!errors.upazila}
                aria-disabled={!currentDistrict}
                className={cn(
                  errors.upazila && 'border-destructive',
                  !currentDistrict && 'opacity-60 cursor-not-allowed'
                )}
              >
                <SelectValue
                  placeholder={
                    currentDistrict
                      ? t('registration.selectUpazila')
                      : t('registration.selectDistrictFirst')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(currentDistrict?.upazilas ?? []).map((u: Upazila) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.upazila && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.upazila.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Institution */}
      <div className="space-y-1.5">
        <Label htmlFor="institution">
          {t('registration.labels.institution')}
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <Input
          id="institution"
          placeholder={t('registration.placeholders.institution')}
          aria-invalid={!!errors.institution}
          className={cn(errors.institution && 'border-destructive')}
          {...register('institution')}
        />
        {errors.institution && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.institution.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Office address */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="officeAddress">
            {t('registration.labels.officeAddress')}
            <span className="text-destructive ml-0.5">*</span>
          </Label>
          <span
            className={cn(
              'text-xs tabular-nums',
              charCount > 270 ? 'text-amber-600' : 'text-zinc-400',
              charCount >= 300 && 'text-destructive'
            )}
          >
            {charCount}/300
          </span>
        </div>
        <Textarea
          id="officeAddress"
          rows={3}
          maxLength={300}
          placeholder={t('registration.placeholders.officeAddress')}
          aria-invalid={!!errors.officeAddress}
          className={cn(
            'resize-none',
            errors.officeAddress && 'border-destructive'
          )}
          {...register('officeAddress')}
        />
        {errors.officeAddress && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.officeAddress.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="whatsapp">
            {t('registration.labels.whatsapp')}
            <span className="text-zinc-400 text-xs ml-1.5">({t('common.optional')})</span>
          </Label>

          {/* Same as mobile toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Controller
              name="sameAsMobile"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
                  aria-label={t('registration.sameAsMobile')}
                />
              )}
            />
            <span className="text-xs text-zinc-600">{t('registration.sameAsMobile')}</span>
          </label>
        </div>

        <Input
          id="whatsapp"
          type="tel"
          inputMode="numeric"
          placeholder="01XXXXXXXXX"
          disabled={sameAsMobile}
          aria-invalid={!!errors.whatsapp}
          className={cn(
            errors.whatsapp && 'border-destructive',
            sameAsMobile && 'bg-zinc-50 text-zinc-500'
          )}
          {...register('whatsapp')}
        />
        {errors.whatsapp && (
          <p className="text-xs text-destructive" role="alert">
            {t(errors.whatsapp.message as Parameters<typeof t>[0])}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-11"
        >
          {t('registration.back')}
        </Button>
        <Button
          type="submit"
          className="flex-1 h-11 bg-primary-600 hover:bg-primary-700 text-white"
        >
          {t('registration.next')}
        </Button>
      </div>
    </form>
  )
}