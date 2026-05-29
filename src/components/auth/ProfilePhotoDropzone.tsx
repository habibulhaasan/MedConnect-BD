'use client'

import { useCallback, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, Pencil, Loader2, CheckCircle, AlertCircle, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import { compressProfilePhoto } from '@/lib/image/compress'
import { cn } from '@/lib/utils/cn'

interface ProfilePhotoDropzoneProps {
  value: string        // base64
  sizeKb: number
  onChange: (base64: string, sizeKb: number) => void
  onError?: (message: string) => void
}

export function ProfilePhotoDropzone({
  value,
  sizeKb,
  onChange,
  onError,
}: ProfilePhotoDropzoneProps) {
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [hasError, setHasError] = useState(false)

  const processFile = useCallback(
    async (file: File) => {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        const msg = t('errors.invalidImageType')
        toast.error(msg)
        onError?.(msg)
        return
      }

      setIsCompressing(true)
      setHasError(false)

      try {
        const base64 = await compressProfilePhoto(file)
        // Calculate KB from base64
        const base64Data = base64.split(',')[1] ?? base64
        const padding = (base64Data.match(/=/g) ?? []).length
        const bytes = (base64Data.length * 3) / 4 - padding
        const kb = Math.round(bytes / 1024)
        onChange(base64, kb)
      } catch (err) {
        setHasError(true)
        const msg =
          err instanceof Error && err.message === 'IMAGE_TOO_LARGE_PROFILE'
            ? t('errors.imageTooLargeProfile')
            : t('errors.imageLoadFailed')
        toast.error(msg)
        onError?.(msg)
      } finally {
        setIsCompressing(false)
      }
    },
    [t, onChange, onError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset so same file can be selected again
    e.target.value = ''
  }

  const triggerFileSelect = () => fileInputRef.current?.click()

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label={t('registration.labels.profilePhoto')}
      />

      {/* Preview / Drop area */}
      {value ? (
        /* Photo preview with edit overlay */
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-100 shadow-md">
            <img
              src={value}
              alt={t('profile.photoAlt')}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Edit overlay */}
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={isCompressing}
            className={cn(
              'absolute inset-0 rounded-full flex items-center justify-center',
              'bg-black/0 group-hover:bg-black/40 transition-all duration-200',
              'focus-visible:bg-black/40 focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-primary-500 focus-visible:ring-offset-2'
            )}
            aria-label={t('registration.changePhoto')}
          >
            <Pencil
              size={20}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </button>

          {/* Compression spinner overlay */}
          {isCompressing && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={0}
          onClick={triggerFileSelect}
          onKeyDown={(e) => e.key === 'Enter' && triggerFileSelect()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          aria-label={t('registration.uploadPhoto')}
          className={cn(
            'w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center',
            'cursor-pointer transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            isDragging
              ? 'border-primary-500 bg-primary-50 scale-105'
              : hasError
              ? 'border-destructive bg-red-50'
              : 'border-zinc-300 bg-zinc-50 hover:border-primary-400 hover:bg-primary-50'
          )}
        >
          {isCompressing ? (
            <Loader2 size={28} className="text-primary-500 animate-spin" />
          ) : hasError ? (
            <AlertCircle size={28} className="text-destructive" />
          ) : (
            <>
              <UserCircle size={32} className="text-zinc-300 mb-1" />
              <Upload size={14} className="text-zinc-400" />
            </>
          )}
        </div>
      )}

      {/* Action button */}
      <button
        type="button"
        onClick={triggerFileSelect}
        disabled={isCompressing}
        className={cn(
          'text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          'focus-visible:outline-none focus-visible:underline'
        )}
      >
        {isCompressing
          ? t('common.loading')
          : value
          ? t('registration.changePhoto')
          : t('registration.uploadPhoto')}
      </button>

      {/* Size indicator */}
      {value && sizeKb > 0 && (
        <div
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium',
            sizeKb <= 80 ? 'text-green-600' : 'text-amber-600'
          )}
        >
          {sizeKb <= 80 ? (
            <CheckCircle size={13} />
          ) : (
            <AlertCircle size={13} />
          )}
          {t('registration.photoSize', { size: sizeKb })}
        </div>
      )}

      {/* Hint */}
      <p className="text-xs text-zinc-400 text-center max-w-[200px]">
        {t('registration.photoHint')}
      </p>
    </div>
  )
}