'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, UserCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { compressProfilePhoto } from '@/lib/image/compress'

interface Step4Props {
  onComplete: (photoBase64?: string) => Promise<void>
  onBack: () => void
  isSubmitting: boolean
}

export function Step4Photo({ onComplete, onBack, isSubmitting }: Step4Props) {
  const t = useTranslations()
  const [photoBase64, setPhotoBase64] = useState<string | undefined>()
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressing(true)
    try {
      const base64 = await compressProfilePhoto(file)
      setPhotoBase64(base64)
    } catch (err) {
      const msg =
        err instanceof Error && err.message === 'IMAGE_TOO_LARGE_PROFILE'
          ? t('errors.imageTooLargeProfile')
          : t('errors.imageLoadFailed')
      toast.error(msg)
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{t('registration.step4')}</CardTitle>
        <CardDescription>{t('registration.photoHint')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {photoBase64 ? (
              <img
                src={photoBase64}
                alt="Profile preview"
                className="w-28 h-28 rounded-full object-cover border-4 border-primary-100 shadow-sm"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center">
                <UserCircle size={48} className="text-zinc-300" />
              </div>
            )}

            {isCompressing && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 size={24} className="text-white animate-spin" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            aria-label={t('registration.uploadPhoto')}
          />

          <Button
            type="button"
            variant="outline"
            disabled={isCompressing}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload size={15} />
            {photoBase64 ? t('registration.changePhoto') : t('registration.uploadPhoto')}
          </Button>

          <p className="text-xs text-zinc-400 text-center">
            {t('registration.labels.profilePhoto')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1"
          >
            {t('registration.back')}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || isCompressing}
            onClick={() => onComplete(photoBase64)}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="mr-2 animate-spin" />
                {t('registration.submitting')}
              </>
            ) : (
              t('registration.submit')
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}