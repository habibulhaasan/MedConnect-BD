'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { registerStep2Schema, type RegisterStep2Values } from '@/lib/validations/member'
import { ALL_DESIGNATIONS, ALL_BLOOD_GROUPS } from '@/types'
import { cn } from '@/lib/utils/cn'
import type { RegistrationFormData, Designation, BloodGroup } from '@/types'

interface Step2Props {
  defaultValues: Partial<RegistrationFormData>
  onComplete: (data: Pick<RegistrationFormData, 'fullName' | 'fullNameBn' | 'designation' | 'regNumber' | 'bloodGroup'>) => void
  onBack: () => void
}

export function Step2Professional({ defaultValues, onComplete, onBack }: Step2Props) {
  const t = useTranslations()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterStep2Values>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: {
      fullName: defaultValues.fullName ?? '',
      fullNameBn: defaultValues.fullNameBn ?? '',
      designation: defaultValues.designation,
      regNumber: defaultValues.regNumber ?? '',
      bloodGroup: defaultValues.bloodGroup,
    },
  })

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t('registration.step2')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">{t('registration.labels.fullName')}</Label>
            <Input
              id="fullName"
              placeholder={t('registration.placeholders.fullName')}
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

          <div className="space-y-1.5">
            <Label htmlFor="fullNameBn">{t('registration.labels.fullNameBn')}</Label>
            <Input
              id="fullNameBn"
              placeholder={t('registration.placeholders.fullNameBn')}
              lang="bn"
              className={cn('font-bangla', errors.fullNameBn && 'border-destructive')}
              aria-invalid={!!errors.fullNameBn}
              {...register('fullNameBn')}
            />
            {errors.fullNameBn && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.fullNameBn.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{t('registration.labels.designation')}</Label>
            <Select
              defaultValue={defaultValues.designation}
              onValueChange={(v) => setValue('designation', v as Designation, { shouldValidate: true })}
            >
              <SelectTrigger aria-invalid={!!errors.designation} className={cn(errors.designation && 'border-destructive')}>
                <SelectValue placeholder={t('registration.selectDesignation')} />
              </SelectTrigger>
              <SelectContent>
                {ALL_DESIGNATIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {t(`designations.${d}`)}
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

          <div className="space-y-1.5">
            <Label htmlFor="regNumber">{t('registration.labels.regNumber')}</Label>
            <Input
              id="regNumber"
              placeholder={t('registration.placeholders.regNumber')}
              className={cn(errors.regNumber && 'border-destructive')}
              aria-invalid={!!errors.regNumber}
              {...register('regNumber')}
            />
            {errors.regNumber && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.regNumber.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{t('registration.labels.bloodGroup')}</Label>
            <Select
              defaultValue={defaultValues.bloodGroup}
              onValueChange={(v) => setValue('bloodGroup', v as BloodGroup, { shouldValidate: true })}
            >
              <SelectTrigger aria-invalid={!!errors.bloodGroup} className={cn(errors.bloodGroup && 'border-destructive')}>
                <SelectValue placeholder={t('registration.selectBloodGroup')} />
              </SelectTrigger>
              <SelectContent>
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {t(`bloodGroups.${bg}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bloodGroup && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.bloodGroup.message as Parameters<typeof t>[0])}
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