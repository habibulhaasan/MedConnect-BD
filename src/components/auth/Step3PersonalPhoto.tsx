'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { step3Schema, type Step3Values } from '@/lib/validations/member'
import { useRegistrationStore } from '@/stores/registrationStore'
import { ProfilePhotoDropzone } from './ProfilePhotoDropzone'
import { ALL_BLOOD_GROUPS } from '@/types'
import { cn } from '@/lib/utils/cn'
import type { BloodGroup } from '@/types'
import { format } from 'date-fns'

interface Step3Props {
  onNext: () => void
  onBack: () => void
}

export function Step3PersonalPhoto({ onNext, onBack }: Step3Props) {
  const t = useTranslations()
  const { step3, setStep3 } = useRegistrationStore()

  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      bloodGroup: step3.bloodGroup as BloodGroup | undefined,
      lastDonateDate: step3.lastDonateDate,
      profilePhotoBase64: step3.profilePhotoBase64,
    },
  })

  const photoBase64 = watch('profilePhotoBase64')
  const today = format(new Date(), 'yyyy-MM-dd')

  const onSubmit = (values: Step3Values) => {
    setStep3({
      bloodGroup: values.bloodGroup,
      lastDonateDate: values.lastDonateDate ?? '',
      profilePhotoBase64: values.profilePhotoBase64 ?? '',
      photoSizeKb: step3.photoSizeKb,
    })
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Profile photo */}
      <div className="space-y-2">
        <Label>
          {t('registration.labels.profilePhoto')}
          <span className="text-zinc-400 text-xs ml-1.5">({t('common.optional')})</span>
        </Label>
        <div className="flex justify-center py-2">
          <ProfilePhotoDropzone
            value={photoBase64 ?? ''}
            sizeKb={step3.photoSizeKb}
            onChange={(base64, sizeKb) => {
              setValue('profilePhotoBase64', base64, { shouldValidate: true })
              setStep3({ photoSizeKb: sizeKb })
            }}
          />
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-5 space-y-5">
        {/* Blood group */}
        <div className="space-y-1.5">
          <Label>
            {t('registration.labels.bloodGroup')}
            <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Select
            defaultValue={step3.bloodGroup || undefined}
            onValueChange={(v) =>
              setValue('bloodGroup', v as BloodGroup, { shouldValidate: true })
            }
          >
            <SelectTrigger
              aria-invalid={!!errors.bloodGroup}
              className={cn(errors.bloodGroup && 'border-destructive')}
            >
              <SelectValue placeholder={t('registration.selectBloodGroup')} />
            </SelectTrigger>
            <SelectContent>
              {ALL_BLOOD_GROUPS.map((bg) => (
                <SelectItem key={bg} value={bg}>
                  {t(`bloodGroups.${bg}` as Parameters<typeof t>[0])}
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

        {/* Last donation date */}
        <div className="space-y-1.5">
          <Label htmlFor="lastDonateDate">
            {t('profile.lastDonate')}
            <span className="text-zinc-400 text-xs ml-1.5">({t('common.optional')})</span>
          </Label>
          <input
            id="lastDonateDate"
            type="date"
            max={today}
            aria-invalid={!!errors.lastDonateDate}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
              'text-sm ring-offset-background placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              errors.lastDonateDate && 'border-destructive'
            )}
            {...register('lastDonateDate')}
          />
          {errors.lastDonateDate && (
            <p className="text-xs text-destructive" role="alert">
              {t(errors.lastDonateDate.message as Parameters<typeof t>[0])}
            </p>
          )}
          <p className="text-xs text-zinc-400">{t('profile.lastDonateHint')}</p>
        </div>
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