'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
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
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils/cn'
import type { Division } from '@/types'
import type { District, Upazila } from '@/lib/utils/bd-data'

// ── Schema ─────────────────────────────────────────────────────────────────
const step2Schema = z.object({
  division: z.enum([
    'dhaka','chattogram','rajshahi','khulna',
    'barishal','sylhet','rangpur','mymensingh',
  ] as const, { required_error: 'errors.required' }),
  district: z.string().min(1, 'errors.required'),
  upazila: z.string().min(1, 'errors.required'),
  institution: z.string().min(2, 'errors.required').max(200, 'errors.tooLong'),
  officeAddress: z.string().min(5, 'errors.required').max(300, 'errors.tooLong'),
  whatsapp: z
    .string()
    .regex(/^(\+880|880|0)1[3-9]\d{8}$/, 'errors.invalidMobile')
    .optional()
    .or(z.literal('')),
})

export type Step2Values = z.infer<typeof step2Schema>

// ── Division → id mapping (matches BD_DIVISIONS) ───────────────────────────
const DIVISION_ID_MAP: Record<Division, string> = {
  barishal: '1',
  chattogram: '2',
  dhaka: '3',
  khulna: '4',
  rajshahi: '5',
  rangpur: '6',
  sylhet: '7',
  mymensingh: '8',
}

// ── Component ──────────────────────────────────────────────────────────────
interface Step2LocationProps {
  defaultValues?: Partial<Step2Values>
  mobileNumber: string   // passed from step 1 for "Same as mobile" toggle
  onComplete: (data: Step2Values) => void
  onBack: () => void
}

export function Step2Location({
  defaultValues,
  mobileNumber,
  onComplete,
  onBack,
}: Step2LocationProps) {
  const t = useTranslations()

  // BD data — lazy loaded
  const [allDivisions, setAllDivisions] = useState
    { id: string; name: string; slug: Division; districts: District[] }[]
  >([])
  const [districts, setDistricts] = useState<District[]>([])
  const [upazilas, setUpazilas] = useState<Upazila[]>([])
  const [sameAsMobile, setSameAsMobile] = useState(false)

  useEffect(() => {
    import('@/lib/utils/bd-data').then(({ BD_DIVISIONS, DIVISION_SLUG_MAP }) => {
      const slugToId = DIVISION_SLUG_MAP as Record<Division, string>
      const mapped = BD_DIVISIONS.map((div) => {
        // find which slug maps to this id
        const slug = (Object.entries(slugToId).find(
          ([, id]) => id === div.id
        )?.[0] ?? div.name.toLowerCase()) as Division
        return { id: div.id, name: div.name, slug, districts: div.districts }
      })
      setAllDivisions(mapped)
    })
  }, [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      division: defaultValues?.division,
      district: defaultValues?.district ?? '',
      upazila: defaultValues?.upazila ?? '',
      institution: defaultValues?.institution ?? '',
      officeAddress: defaultValues?.officeAddress ?? '',
      whatsapp: defaultValues?.whatsapp ?? '',
    },
  })

  const watchedDivision = watch('division')
  const watchedDistrict = watch('district')

  // Re-populate districts when division changes
  useEffect(() => {
    if (!watchedDivision || allDivisions.length === 0) return
    const divId = DIVISION_ID_MAP[watchedDivision]
    const div = allDivisions.find((d) => d.id === divId)
    setDistricts(div?.districts ?? [])
    setUpazilas([])
    setValue('district', '')
    setValue('upazila', '')
  }, [watchedDivision, allDivisions, setValue])

  // Re-populate upazilas when district changes
  useEffect(() => {
    if (!watchedDistrict || districts.length === 0) return
    const dist = districts.find((d) => d.id === watchedDistrict)
    setUpazilas(dist?.upazilas ?? [])
    setValue('upazila', '')
  }, [watchedDistrict, districts, setValue])

  // Same-as-mobile toggle
  const handleSameAsMobile = (checked: boolean) => {
    setSameAsMobile(checked)
    if (checked) {
      // Normalise to 01XXXXXXXXX format
      const normalised = mobileNumber
        .replace(/^\+880/, '0')
        .replace(/^880/, '0')
      setValue('whatsapp', normalised, { shouldValidate: true })
    } else {
      setValue('whatsapp', '', { shouldValidate: false })
    }
  }

  const fieldError = (key: keyof Step2Values) =>
    errors[key] ? (
      <p className="text-xs text-destructive mt-1" role="alert">
        {t(errors[key]!.message as Parameters<typeof t>[0])}
      </p>
    ) : null

  const charCount = watch('officeAddress')?.length ?? 0

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t('registration.step2')}</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onComplete)} noValidate className="space-y-4">
          {/* Division */}
          <div className="space-y-1.5">
            <Label>{t('registration.labels.division')}</Label>
            <Controller
              name="division"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as Division)}
                >
                  <SelectTrigger
                    className={cn('w-full', errors.division && 'border-destructive')}
                    aria-invalid={!!errors.division}
                  >
                    <SelectValue placeholder={t('registration.selectDivision')} />
                  </SelectTrigger>
                  <SelectContent>
                    {allDivisions.map((div) => (
                      <SelectItem key={div.id} value={div.slug}>
                        {t(`divisions.${div.slug}` as Parameters<typeof t>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {fieldError('division')}
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
                  onValueChange={field.onChange}
                  disabled={districts.length === 0}
                >
                  <SelectTrigger
                    className={cn('w-full', errors.district && 'border-destructive')}
                    aria-invalid={!!errors.district}
                  >
                    <SelectValue placeholder={t('registration.selectDistrict')} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {fieldError('district')}
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
                  onValueChange={field.onChange}
                  disabled={upazilas.length === 0}
                >
                  <SelectTrigger
                    className={cn('w-full', errors.upazila && 'border-destructive')}
                    aria-invalid={!!errors.upazila}
                  >
                    <SelectValue placeholder={t('registration.selectUpazila')} />
                  </SelectTrigger>
                  <SelectContent>
                    {upazilas.map((u) => (
                      <SelectItem key={u.id} value={u.name}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {fieldError('upazila')}
          </div>

          {/* Institution */}
          <div className="space-y-1.5">
            <Label htmlFor="s2-institution">{t('registration.labels.institution')}</Label>
            <Input
              id="s2-institution"
              placeholder={t('registration.placeholders.institution')}
              aria-invalid={!!errors.institution}
              className={cn(errors.institution && 'border-destructive')}
              {...register('institution')}
            />
            {fieldError('institution')}
          </div>

          {/* Office address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="s2-officeAddress">{t('registration.labels.officeAddress')}</Label>
              <span className={cn('text-xs', charCount > 280 ? 'text-amber-600' : 'text-zinc-400')}>
                {charCount}/300
              </span>
            </div>
            <Textarea
              id="s2-officeAddress"
              rows={3}
              maxLength={300}
              placeholder={t('registration.placeholders.officeAddress')}
              aria-invalid={!!errors.officeAddress}
              className={cn(errors.officeAddress && 'border-destructive')}
              {...register('officeAddress')}
            />
            {fieldError('officeAddress')}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="s2-whatsapp">
                {t('registration.labels.whatsapp')}
              </Label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  id="same-as-mobile"
                  checked={sameAsMobile}
                  onCheckedChange={(v) => handleSameAsMobile(!!v)}
                  className="data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                />
                <span className="text-xs text-zinc-500">
                  {t('registration.sameAsMobile')}
                </span>
              </label>
            </div>
            <Input
              id="s2-whatsapp"
              type="tel"
              inputMode="numeric"
              disabled={sameAsMobile}
              placeholder={t('registration.placeholders.whatsapp')}
              aria-invalid={!!errors.whatsapp}
              className={cn(errors.whatsapp && 'border-destructive')}
              {...register('whatsapp')}
            />
            {fieldError('whatsapp')}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              {t('registration.back')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
            >
              {t('registration.next')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}