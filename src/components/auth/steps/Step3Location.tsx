'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { registerStep3Schema, type RegisterStep3Values } from '@/lib/validations/member'
import { ALL_DIVISIONS } from '@/types'
import { cn } from '@/lib/utils/cn'
import type { RegistrationFormData } from '@/types'
import type { Division, District, Upazila } from '@/lib/utils/bd-data'

// Lazy import bd-data to avoid initial bundle
async function getBdData() {
  const { BD_DIVISIONS } = await import('@/lib/utils/bd-data')
  return BD_DIVISIONS
}

interface Step3Props {
  defaultValues: Partial<RegistrationFormData>
  onComplete: (data: Pick<RegistrationFormData, 'mobile' | 'whatsapp' | 'division' | 'district' | 'upazila' | 'institution' | 'officeAddress'>) => void
  onBack: () => void
}

export function Step3Location({ defaultValues, onComplete, onBack }: Step3Props) {
  const t = useTranslations()
  const [divisions, setDivisions] = useState<Division[]>([])
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(defaultValues.division ?? '')
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(defaultValues.district ?? '')

  useEffect(() => {
    getBdData().then(setDivisions)
  }, [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterStep3Values>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: {
      mobile: defaultValues.mobile ?? '',
      whatsapp: defaultValues.whatsapp ?? '',
      division: defaultValues.division,
      district: defaultValues.district ?? '',
      upazila: defaultValues.upazila ?? '',
      institution: defaultValues.institution ?? '',
      officeAddress: defaultValues.officeAddress ?? '',
    },
  })

  const currentDivision = divisions.find((d: Division) => d.id === selectedDivisionId)
  const currentDistrict = currentDivision?.districts.find((d: District) => d.id === selectedDistrictId)

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t('registration.step3')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mobile">{t('registration.labels.mobile')}</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder={t('registration.placeholders.mobile')}
              className={cn(errors.mobile && 'border-destructive')}
              aria-invalid={!!errors.mobile}
              {...register('mobile')}
            />
            {errors.mobile && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.mobile.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">
              {t('registration.labels.whatsapp')}
              <span className="text-zinc-400 text-xs ml-1">({t('common.optional')})</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder={t('registration.placeholders.whatsapp')}
              className={cn(errors.whatsapp && 'border-destructive')}
              aria-invalid={!!errors.whatsapp}
              {...register('whatsapp')}
            />
            {errors.whatsapp && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.whatsapp.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          {/* Division */}
          <div className="space-y-1.5">
            <Label>{t('registration.labels.division')}</Label>
            <Controller
              name="division"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v)
                    setSelectedDivisionId(v)
                    setSelectedDistrictId('')
                    setValue('district', '')
                    setValue('upazila', '')
                  }}
                >
                  <SelectTrigger className={cn(errors.division && 'border-destructive')}>
                    <SelectValue placeholder={t('registration.selectDivision')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DIVISIONS.map((div) => (
                      <SelectItem key={div} value={div}>
                        {t(`divisions.${div}`)}
                      </SelectItem>
                    ))}
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

          {/* District */}
          <div className="space-y-1.5">
            <Label>{t('registration.labels.district')}</Label>
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
                    setValue('upazila', '')
                  }}
                >
                  <SelectTrigger className={cn(errors.district && 'border-destructive')}>
                    <SelectValue placeholder={t('registration.selectDistrict')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(currentDivision?.districts ?? []).map((d: District) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
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

          {/* Upazila */}
          <div className="space-y-1.5">
            <Label>{t('registration.labels.upazila')}</Label>
            <Controller
              name="upazila"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  disabled={!currentDistrict}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={cn(errors.upazila && 'border-destructive')}>
                    <SelectValue placeholder={t('registration.selectUpazila')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(currentDistrict?.upazilas ?? []).map((u: Upazila) => (
                      <SelectItem key={u.id} value={u.name}>
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

          <div className="space-y-1.5">
            <Label htmlFor="institution">{t('registration.labels.institution')}</Label>
            <Input
              id="institution"
              placeholder={t('registration.placeholders.institution')}
              className={cn(errors.institution && 'border-destructive')}
              aria-invalid={!!errors.institution}
              {...register('institution')}
            />
            {errors.institution && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.institution.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="officeAddress">{t('registration.labels.officeAddress')}</Label>
            <Textarea
              id="officeAddress"
              placeholder={t('registration.placeholders.officeAddress')}
              rows={3}
              className={cn(errors.officeAddress && 'border-destructive')}
              aria-invalid={!!errors.officeAddress}
              {...register('officeAddress')}
            />
            {errors.officeAddress && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.officeAddress.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              {t('registration.back')}
            </Button>
            <Button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white">
              {t('registration.next')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
