'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import {
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import { getAppConfig } from '@/lib/firebase/firestore'
import { compressPaymentScreenshot } from '@/lib/image/compress'
import type { AppConfig } from '@/types'

// ── Schema ─────────────────────────────────────────────────────────────────
const step4Schema = z.object({
  bkashTrxId: z
    .string()
    .min(8, 'errors.invalidTrxId')
    .max(12, 'errors.invalidTrxId')
    .regex(/^[A-Z0-9]+$/, 'errors.invalidTrxIdFormat'),
  bkashSenderNumber: z
    .string()
    .regex(/^(\+880|880|0)1[3-9]\d{8}$/, 'errors.invalidMobile'),
})

export type Step4Values = z.infer<typeof step4Schema> & {
  screenshotBase64?: string
}

// ── Numbered step list item ────────────────────────────────────────────────
function InstructionStep({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bkash text-white text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <p className="text-sm text-zinc-700 leading-snug pt-0.5">{text}</p>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
interface Step4PaymentProps {
  onComplete: (data: Step4Values) => Promise<void>
  onBack: () => void
  isSubmitting: boolean
}

export function Step4Payment({ onComplete, onBack, isSubmitting }: Step4PaymentProps) {
  const t = useTranslations()
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [configError, setConfigError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [screenshotBase64, setScreenshotBase64] = useState<string | undefined>()
  const [screenshotCompressing, setScreenshotCompressing] = useState(false)
  const screenshotInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof step4Schema>>({
    resolver: zodResolver(step4Schema),
  })

  // Load app config on mount
  useEffect(() => {
    setConfigLoading(true)
    getAppConfig()
      .then((cfg) => {
        setAppConfig(cfg)
        setConfigError(!cfg)
      })
      .catch(() => setConfigError(true))
      .finally(() => setConfigLoading(false))
  }, [])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(t('payment.copied'))
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

  const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshotCompressing(true)
    try {
      const b64 = await compressPaymentScreenshot(file)
      setScreenshotBase64(b64)
    } catch (err) {
      const msg =
        err instanceof Error && err.message === 'IMAGE_TOO_LARGE_SCREENSHOT'
          ? t('errors.imageTooLargeScreenshot')
          : t('errors.imageLoadFailed')
      toast.error(msg)
    } finally {
      setScreenshotCompressing(false)
      e.target.value = ''
    }
  }

  const onSubmit = async (values: z.infer<typeof step4Schema>) => {
    await onComplete({ ...values, screenshotBase64 })
  }

  // ── Skeleton while loading ───────────────────────────────────────────────
  if (configLoading) {
    return (
      <Card className="border-zinc-100 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  // ── Config load error ────────────────────────────────────────────────────
  if (configError || !appConfig) {
    return (
      <Card className="border-zinc-100 shadow-sm">
        <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
          <AlertCircle size={36} className="text-destructive" />
          <p className="text-sm text-zinc-600">{t('errors.networkError')}</p>
          <Button
            variant="outline"
            onClick={() => { setConfigError(false); setConfigLoading(true) }}
          >
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{t('registration.step4Payment')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* ── A. Payment Instructions Card ─────────────────────────────── */}
        <div className="rounded-2xl border-2 border-bkash bg-bkash-light p-5 space-y-4">
          {/* Title */}
          <div className="text-center space-y-0.5">
            <p className="font-bangla text-lg font-semibold text-bkash">
              বিকাশে পেমেন্ট করুন
            </p>
            <p className="text-sm font-medium text-bkash/80">
              Send Payment via bKash
            </p>
          </div>

          {/* Admin bKash number */}
          <div className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">
                  {t('payment.adminNumber')}
                </p>
                <p className="text-2xl font-bold text-bkash tracking-wide">
                  {appConfig.adminBkashNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(appConfig.adminBkashNumber)}
                aria-label="Copy bKash number"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-bkash/10 text-bkash hover:bg-bkash/20'
                )}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={14} />
                    {t('payment.copiedShort')}
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    {t('payment.copy')}
                  </>
                )}
              </button>
            </div>

            {/* Account name & amount */}
            <div className="pt-2 border-t border-zinc-100 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-zinc-400">{t('payment.adminName')}</p>
                <p className="font-medium text-zinc-800">{appConfig.adminBkashAccountName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">{t('payment.amount')}</p>
                <p className="text-xl font-bold text-bkash">
                  ৳{appConfig.registrationFee}
                </p>
              </div>
            </div>
          </div>

          {/* Numbered steps */}
          <div className="space-y-3">
            <InstructionStep n={1} text={t('payment.step1')} />
            <InstructionStep n={2} text={t('payment.step2')} />
            <InstructionStep
              n={3}
              text={t('payment.step3', { number: appConfig.adminBkashNumber })}
            />
            <InstructionStep
              n={4}
              text={t('payment.step4', { amount: appConfig.registrationFee })}
            />
            <InstructionStep n={5} text={t('payment.step5')} />
          </div>
        </div>

        {/* ── B. Submission Form ───────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* TrxID */}
          <div className="space-y-1.5">
            <Label htmlFor="s4-trxId">{t('payment.trxIdLabel')}</Label>
            <Input
              id="s4-trxId"
              placeholder={t('payment.trxIdPlaceholder')}
              aria-invalid={!!errors.bkashTrxId}
              className={cn(
                'font-mono uppercase tracking-wider',
                errors.bkashTrxId && 'border-destructive'
              )}
              {...register('bkashTrxId', {
                setValueAs: (v: string) => v.toUpperCase().replace(/\s/g, ''),
              })}
            />
            <p className="text-xs text-zinc-400">{t('payment.trxIdHint')}</p>
            {errors.bkashTrxId && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.bkashTrxId.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          {/* Sender number */}
          <div className="space-y-1.5">
            <Label htmlFor="s4-senderNumber">{t('payment.senderNumberLabel')}</Label>
            <Input
              id="s4-senderNumber"
              type="tel"
              inputMode="numeric"
              placeholder={t('payment.senderNumberPlaceholder')}
              aria-invalid={!!errors.bkashSenderNumber}
              className={cn(errors.bkashSenderNumber && 'border-destructive')}
              {...register('bkashSenderNumber')}
            />
            {errors.bkashSenderNumber && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.bkashSenderNumber.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          {/* Screenshot upload */}
          <div className="space-y-2">
            <Label>
              {t('payment.screenshotLabel')}
              <span className="text-zinc-400 text-xs font-normal ml-1">
                ({t('common.optional')})
              </span>
            </Label>

            <input
              ref={screenshotInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleScreenshot}
              className="hidden"
              aria-label={t('payment.screenshotLabel')}
            />

            {screenshotBase64 ? (
              <div className="relative rounded-lg overflow-hidden border border-zinc-200">
                <img
                  src={screenshotBase64}
                  alt="Payment screenshot"
                  className="max-h-40 w-full object-contain bg-zinc-50"
                />
                {screenshotCompressing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loader2 size={20} className="animate-spin text-primary-600" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => screenshotInputRef.current?.click()}
                  className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded border border-zinc-200 hover:bg-white text-zinc-600"
                >
                  {t('registration.changePhoto')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={screenshotCompressing}
                onClick={() => screenshotInputRef.current?.click()}
                className={cn(
                  'w-full rounded-xl border-2 border-dashed border-zinc-200 py-6',
                  'flex flex-col items-center gap-2 text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-colors',
                  screenshotCompressing && 'opacity-50 cursor-not-allowed'
                )}
              >
                {screenshotCompressing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Upload size={20} />
                )}
                <span className="text-xs">{t('payment.screenshotHint')}</span>
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
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
              type="submit"
              disabled={isSubmitting || screenshotCompressing}
              className="flex-1 bg-bkash hover:bg-bkash-dark text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="mr-2 animate-spin" />
                  {t('registration.submitting')}
                </>
              ) : (
                t('payment.submitForVerification')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}