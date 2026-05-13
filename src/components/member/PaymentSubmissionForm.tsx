'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Loader2, Copy, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { paymentSubmissionSchema, type PaymentSubmissionValues } from '@/lib/validations/payment'
import { createPaymentSubmission, getAppConfig, getPaymentSubmission, updateMember } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { compressPaymentScreenshot } from '@/lib/image/compress'
import type { AppConfig, PaymentSubmission } from '@/types'
import { cn } from '@/lib/utils/cn'

export function PaymentSubmissionForm() {
  const t = useTranslations()
  const { user, member, setMember } = useAuthStore()
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [existingPayment, setExistingPayment] = useState<PaymentSubmission | null>(null)
  const [screenshotBase64, setScreenshotBase64] = useState<string | undefined>()
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentSubmissionValues>({
    resolver: zodResolver(paymentSubmissionSchema),
    defaultValues: { amount: 0 },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [config, payment] = await Promise.all([
          getAppConfig(),
          user?.uid ? getPaymentSubmission(user.uid) : null,
        ])
        setAppConfig(config)
        setExistingPayment(payment)
        if (config) setValue('amount', config.registrationFee)
      } catch {
        toast.error(t('errors.networkError'))
      } finally {
        setIsLoadingConfig(false)
      }
    }
    load()
  }, [user?.uid, setValue, t])

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await compressPaymentScreenshot(file)
      setScreenshotBase64(base64)
    } catch (err) {
      const msg = err instanceof Error && err.message === 'IMAGE_TOO_LARGE_SCREENSHOT'
        ? t('errors.imageTooLargeScreenshot')
        : t('errors.imageLoadFailed')
      toast.error(msg)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onSubmit = async (values: PaymentSubmissionValues) => {
    if (!user || !member) return

    try {
      await createPaymentSubmission({
        uid: user.uid,
        memberName: member.fullName,
        mobile: member.mobile,
        amount: values.amount,
        bkashTrxId: values.bkashTrxId,
        bkashSenderNumber: values.bkashSenderNumber,
        screenshotBase64,
      })

      await updateMember(user.uid, { status: 'pending_approval' })
      setMember(member ? { ...member, status: 'pending_approval' } : null)

      toast.success(t('payment.submitted'))
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

  // Already submitted — show status
  if (existingPayment && existingPayment.status !== 'rejected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('payment.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">{t('payment.status.submitted')}:</span>
            <Badge
              variant={existingPayment.status === 'verified' ? 'default' : 'secondary'}
              className={cn(
                existingPayment.status === 'verified' && 'bg-green-100 text-green-700',
                existingPayment.status === 'submitted' && 'bg-amber-100 text-amber-700'
              )}
            >
              {t(`payment.status.${existingPayment.status}`)}
            </Badge>
          </div>
          <p className="text-sm text-zinc-600">
            {t(`payment.statusMessage.${existingPayment.status}`)}
          </p>
          {existingPayment.adminNote && (
            <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
              <p className="text-xs font-medium text-zinc-500">{t('payment.adminNote')}</p>
              <p className="text-sm text-zinc-700 mt-0.5">{existingPayment.adminNote}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoadingConfig) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('payment.title')}</CardTitle>
        <p className="text-sm text-zinc-500">{t('payment.subtitle')}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* bKash instructions */}
        {appConfig && (
          <div className="rounded-xl bg-bkash-light border border-bkash/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-bkash">
                {t('payment.adminNumber')}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-bkash text-lg">
                  {appConfig.adminBkashNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(appConfig.adminBkashNumber)}
                  className="text-bkash hover:text-bkash-dark transition-colors"
                  aria-label="Copy bKash number"
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">{t('payment.adminName')}</span>
              <span className="font-medium text-zinc-800">{appConfig.adminBkashAccountName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">{t('payment.amount')}</span>
              <span className="font-bold text-bkash text-lg">
                ৳{appConfig.registrationFee}
              </span>
            </div>

            <ol className="text-xs text-zinc-600 space-y-1 list-decimal list-inside">
              <li>{t('payment.step1')}</li>
              <li>{t('payment.step2')}</li>
              <li>{t('payment.step3', { number: appConfig.adminBkashNumber })}</li>
              <li>{t('payment.step4', { amount: appConfig.registrationFee })}</li>
              <li>{t('payment.step5')}</li>
              <li>{t('payment.step6')}</li>
            </ol>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bkashTrxId">{t('payment.trxIdLabel')}</Label>
            <Input
              id="bkashTrxId"
              placeholder={t('payment.trxIdPlaceholder')}
              className={cn('font-mono uppercase', errors.bkashTrxId && 'border-destructive')}
              aria-invalid={!!errors.bkashTrxId}
              {...register('bkashTrxId', {
                setValueAs: (v: string) => v.toUpperCase().trim(),
              })}
            />
            {errors.bkashTrxId && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.bkashTrxId.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bkashSenderNumber">{t('payment.senderNumberLabel')}</Label>
            <Input
              id="bkashSenderNumber"
              type="tel"
              placeholder={t('payment.senderNumberPlaceholder')}
              className={cn(errors.bkashSenderNumber && 'border-destructive')}
              aria-invalid={!!errors.bkashSenderNumber}
              {...register('bkashSenderNumber')}
            />
            {errors.bkashSenderNumber && (
              <p className="text-xs text-destructive" role="alert">
                {t(errors.bkashSenderNumber.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="screenshot">
              {t('payment.screenshotLabel')}
            </Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleScreenshotChange}
              className="file:mr-3 file:text-xs file:font-medium file:text-primary-600 file:bg-primary-50 file:border-0 file:rounded file:px-2 file:py-1"
            />
            {screenshotBase64 && (
              <img
                src={screenshotBase64}
                alt="Payment screenshot preview"
                className="mt-2 max-h-32 rounded-lg border border-zinc-200"
              />
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-bkash hover:bg-bkash-dark text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {t('payment.submitting')}
              </>
            ) : (
              t('payment.submit')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}