'use client'

import { useRef, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { Upload, UserCircle, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import { compressProfilePhoto } from '@/lib/image/compress'
import { ALL_BLOOD_GROUPS, type BloodGroup } from '@/types'

// ── Schema ─────────────────────────────────────────────────────────────────
const step3Schema = z.object({
  bloodGroup: z.enum(['A+','A-','B+','B-','AB+','AB-','O+','O-'] as const, {
    required_error: 'errors.required',
  }),
  lastDonateDate: z
    .string()
    .optional()
    .refine((v) => !v || new Date(v) <= new Date(), {
      message: 'errors.futureDateNotAllowed',
    }),
})

export type Step3Values = z.infer<typeof step3Schema> & {
  profilePhotoBase64?: string
  photoSizeKb?: number
}

// ── ProfilePhotoDropzone ──────────────────────────────────────────────────
interface ProfilePhotoDropzoneProps {
  value?: string
  onChange: (base64: string | undefined, sizeKb: number | undefined) => void
}

function ProfilePhotoDropzone({ value, onChange }: ProfilePhotoDropzoneProps) {
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [sizeKb, setSizeKb] = useState<number | undefined>()

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        toast.error(t('errors.imageTypeInvalid'))
        return
      }
      setIsCompressing(true)
      try {
        const base64 = await compressProfilePhoto(file)
        // Calculate actual compressed KB
        const base64Data = base64.includes(',') ? base64.split(',')[1] : base64
        const padding = (base64Data.match(/=/g) ?? []).length
        const bytes = (base64Data.length * 3) / 4 - padding
        const kb = Math.round(bytes / 1024)
        setSizeKb(kb)
        onChange(base64, kb)
      } catch (err) {
        const msg =
          err instanceof Error && err.message === 'IMAGE_TOO_LARGE_PROFILE'
            ? t('errors.imageTooLargeProfile')
            : t('errors.imageLoadFailed')
        toast.error(msg)
        onChange(undefined, undefined)
        setSizeKb(undefined)
      } finally {
        setIsCompressing(false)
      }
    },
    [onChange, t]
  )

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular preview / drop zone */}
      <div
        className="relative group"
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
      >
        {/* Circle */}
        <div
          className={cn(
            'w-32 h-32 rounded-full border-2 border-dashed transition-all overflow-hidden flex items-center justify-center',
            isDragOver
              ? 'border-primary-500 bg-primary-50 scale-105'
              : value
              ? 'border-primary-200'
              : 'border-zinc-300 bg-zinc-50'
          )}
        >
          {value ? (
            <img
              src={value}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle size={56} className="text-zinc-300" />
          )}

          {/* Compression spinner overlay */}
          {isCompressing && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Edit overlay on hover (when photo exists) */}
        {value && !isCompressing && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            aria-label={t('registration.changePhoto')}
          >
            <Pencil size={18} className="text-white" />
          </button>
        )}
      </div>

      {/* Size indicator */}
      {sizeKb !== undefined && (
        <p className={cn('text-xs font-medium', sizeKb <= 80 ? 'text-green-600' : 'text-amber-600')}>
          {t('registration.photoSize', { size: sizeKb })}
          {sizeKb <= 80 ? ' ✓' : ' ⚠'}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={onFileInputChange}
        className="hidden"
        aria-label={t('registration.uploadPhoto')}
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        disabled={isCompressing}
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Upload size={15} />
        {value ? t('registration.changePhoto') : t('registration.uploadPhoto')}
      </Button>

      {/* Drop hint */}
      {!value && (
        <p className="text-xs text-zinc-400 text-center max-w-[200px]">
          {t('registration.photoDropHint')}
        </p>
      )}
    </div>
  )
}

// ── Main Step3 Component ───────────────────────────────────────────────────
interface Step3PersonalPhotoProps {
  defaultValues?: Partial<Step3Values>
  onComplete: (data: Step3Values) => void
  onBack: () => void
}

export function Step3PersonalPhoto({
  defaultValues,
  onComplete,
  onBack,
}: Step3PersonalPhotoProps) {
  const t = useTranslations()
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(
    defaultValues?.profilePhotoBase64
  )
  const [photoSizeKb, setPhotoSizeKb] = useState<number | undefined>(
    defaultValues?.photoSizeKb
  )

  const today = new Date().toISOString().split('T')[0]

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      bloodGroup: defaultValues?.bloodGroup,
      lastDonateDate: defaultValues?.lastDonateDate ?? '',
    },
  })

  const onSubmit = (data: z.infer<typeof step3Schema>) => {
    onComplete({
      ...data,
      profilePhotoBase64: photoBase64,
      photoSizeKb,
    })
  }

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t('registration.step3')}</CardTitle>
        <CardDescription>{t('registration.step3Subtitle')}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Blood group */}
          <div className="space-y-1.5">
            <Label>{t('registration.labels.bloodGroup')}</Label>
            <Controller
              name="bloodGroup"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as BloodGroup)}
                >
                  <SelectTrigger
                    className={cn('w-full', errors.bloodGroup && 'border-destructive')}
                    aria-invalid={!!errors.bloodGroup}
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
              )}
            />
            {errors.bloodGroup && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.bloodGroup.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          {/* Last blood donation date */}
          <div className="space-y-1.5">
            <Label htmlFor="s3-lastDonateDate">
              {t('registration.labels.lastDonateDate')}
              <span className="text-zinc-400 text-xs font-normal ml-1">
                ({t('common.optional')})
              </span>
            </Label>
            <input
              id="s3-lastDonateDate"
              type="date"
              max={today}
              aria-invalid={!!errors.lastDonateDate}
              className={cn(
                'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none',
                'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                errors.lastDonateDate && 'border-destructive'
              )}
              {...register('lastDonateDate')}
            />
            {errors.lastDonateDate && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.lastDonateDate.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          {/* Profile photo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('registration.labels.profilePhoto')}</Label>
            </div>
            <ProfilePhotoDropzone
              value={photoBase64}
              onChange={(b64, kb) => {
                setPhotoBase64(b64)
                setPhotoSizeKb(kb)
              }}
            />
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