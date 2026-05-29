'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Smartphone,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { step4Schema, type Step4Values } from '@/lib/validations/payment'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useAuthStore } from '@/stores/authStore'
import { signUpWithEmail } from '@/lib/firebase/auth'
import { createMember, createPaymentSubmission, getAppConfig } from '@/lib/firebase/firestore'
import { compressPaymentScreenshot } from '@/lib/image/compress'
import type { AppConfig } from '@/types'
import { cn } from '@/lib/utils/cn'

interface Step4Props {
  onBack: () => void
}

const PAYMENT_STEPS_BN = [
  'আপনার বিকাশ অ্যাপ খুলুন অথবা *247# ডায়াল করুন',
  '"Send Money" বা "পাঠান" অপশন বেছে নিন',
  'উপরের নম্বরে নির্ধারিত পরিমাণ টাকা পাঠান',
  'সফল হলে বিকাশ থেকে SMS পাবেন — Transaction ID কপি করুন',
  'নিচের ফর্মে Transaction ID পূরণ করে Submit করুন',
]

const PAYMENT_STEPS_EN = [
  'Open your bKash app or dial *247#',
  'Select "Send Money"',
  'Enter the number above and send the exact amount',
  'You will receive an SMS with a Transaction ID (TrxID)',
  'Enter the Transaction ID in the form below and submit',
]

export function Step4Payment({ onBack }: Step4Props) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { step1, step2, step3, step4, setStep4, reset: resetStore } = useRegistrationStore()
  const { setUser, setMember } = useAuthStore()

  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [configError, setConfigError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [screenshotBase64, setScreenshotBase64] = useState(step4.screenshotBase64)
  const [isCompressingScreenshot, setIsCompressingScreenshot] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const paymentSteps = locale === 'bn' ? PAYMENT_STEPS_BN : PAYMENT_STEPS_EN

  useEffect(() => {
    const load = async () => {
      setIsLoadingConfig(true)
      setConfigError(false)
      try {
        const config = await getAppConfig()
        setAppConfig(config)
      } catch {
        setConfigError(true)
        toast.error(t('errors.networkError'))
      } finally {
        setIsLoadingConfig(false)
      }
    }
    load()
  }, [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      bkashTrxId: step4.bkashTrxId,
      bkashSenderNumber: step4.bkashSenderNumber,
    },
  })

  const copyBkashNumber = async () => {
    if (!appConfig?.adminBkashNumber) return
    try {
      await navigator.clipboard.writeText(appConfig.adminBkashNumber)
      setCopied(true)
      toast.success(t('payment.copiedToClipboard'))
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error(t('errors.copyFailed'))
    }
  }

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsCompressingScreenshot(true)
    try {
      const base64 = await compressPaymentScreenshot(file)
      setScreenshotBase64(base64)
      setStep4({ screenshotBase64: base64 })
    } catch (err) {
      const msg =
        err instanceof Error && err.message === 'IMAGE_TOO_LARGE_SCREENSHOT'
          ? t('errors.imageTooLargeScreenshot')
          : t('errors.imageLoadFailed')
      toast.error(msg)
    } finally {
      setIsCompressingScreenshot(false)
      e.target.value = ''
    }
  }

  const onSubmit = async (values: Step4Values) => {
    setIsSubmitting(true)

    try {
      // 1. Create Firebase Auth user
      const credential = await signUpWithEmail(step1.email || `${step1.mobile}@medconnect.bd`, step1.password)
      const user = credential.user
      setUser(user)

      const now = new Date().toISOString()

      // 2. Create member document with pending_approval status
      const memberData = {
        fullName: step1.fullName,
        fullNameBn: step1.fullNameBn,
        designation: step1.designation as import('@/types').Designation,
        regNumber: step1.regNumber,
        mobile: step1.mobile,
        email: step1.email || '',
        whatsapp: step2.sameAsMobile ? step1.mobile : (step2.whatsapp || ''),
        division: step2.division as import('@/types').Division,
        district: step2.district,
        upazila: step2.upazila,
        institution: step2.institution,
        officeAddress: step2.officeAddress,
        bloodGroup: step3.bloodGroup as import('@/types').BloodGroup,
        lastDonateDate: step3.lastDonateDate || '',
        profilePhotoBase64: step3.profilePhotoBase64 || '',
        status: 'pending_approval' as const,
        isVerified: false,
        favorites: [] as string[],
        updatedAt: now,
      }

      await createMember(user.uid, memberData)
      const fullMember = { ...memberData, uid: user.uid, joinedAt: now }
      setMember(fullMember)

      // 3. Create payment submission
      const paymentDocId = await createPaymentSubmission({
        uid: user.uid,
        memberName: step1.fullName,
        mobile: step1.mobile,
        amount: appConfig?.registrationFee ?? 0,
        bkashTrxId: values.bkashTrxId.toUpperCase().trim(),
        bkashSenderNumber: values.bkashSenderNumber,
        screenshotBase64: screenshotBase64 || '',
      })

      // 4. Reset store + redirect
      resetStore()
      toast.success(t('payment.submitted'))
      router.push(`/${locale}/register/pending`)
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown'
      const msgKey = `errors.${code}` as Parameters<typeof t>[0]
      toast.error(
        code !== 'unknown'
          ? t(msgKey)
          : t('errors.unknown')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── bKash Instruction Card ── */}
      <div className="rounded-2xl border-2 border-bkash/30 bg-bkash-light overflow-hidden">
        {/* Header */}
        <div className="bg-bkash px-5 py-4 flex items-center gap-3">
          <Smartphone className="text-white" size={22} />
          <div>
            <h2 className="text-white font-semibold text-base leading-tight">
              {locale === 'bn'
                ? 'বিকাশে পেমেন্ট করুন'
                : 'Send Payment via bKash'}
            </h2>
            <p className="text-white/80 text-xs">
              {locale === 'bn'
                ? 'নিচের নির্দেশনা অনুসরণ করুন'
                : 'Follow the steps below carefully'}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Config loading state */}
          {isLoadingConfig && (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
          )}

          {/* Config error */}
          {!isLoadingConfig && configError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle size={16} />
              {t('errors.networkError')}
            </div>
          )}

          {/* bKash details */}
          {!isLoadingConfig && appConfig && (
            <>
              {/* Admin number — large & copyable */}
              <div className="rounded-xl bg-white border border-bkash/20 p-4">
                <p className="text-xs text-zinc-500 mb-1 font-medium">
                  {t('payment.adminNumber')}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-bold text-bkash tracking-wider font-mono">
                    {appConfig.adminBkashNumber}
                  </span>
                  <button
                    type="button"
                    onClick={copyBkashNumber}
                    aria-label={t('payment.copyNumber')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      copied
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-bkash-light text-bkash border border-bkash/30 hover:bg-bkash/10'
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={13} />
                        {t('payment.copied')}
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        {t('payment.copy')}
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {t('payment.adminName')}: {' '}
                  <span className="font-medium text-zinc-700">
                    {appConfig.adminBkashAccountName}
                  </span>
                </p>
              </div>

              {/* Amount */}
              <div className="rounded-xl bg-white border border-bkash/20 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 font-medium">{t('payment.amount')}</p>
                  <p className="text-3xl font-bold text-bkash mt-0.5">
                    ৳{appConfig.registrationFee}
                  </p>
                </div>
                <BadgeCheck size={40} className="text-bkash/30" />
              </div>
            </>
          )}

          {/* Step-by-step instructions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              {t('payment.instructions')}
            </p>
            <ol className="space-y-2">
              {paymentSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-bkash text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-zinc-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* ── Submission Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 border-b border-zinc-100 pb-3">
          <ArrowRight size={16} className="text-primary-600" />
          {t('payment.formTitle')}
        </div>

        {/* TrxID */}
        <div className="space-y-1.5">
          <Label htmlFor="bkashTrxId">
            {t('payment.trxIdLabel')}
            <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="bkashTrxId"
            placeholder="AB12345678"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={!!errors.bkashTrxId}
            className={cn(
              'font-mono uppercase tracking-widest text-base',
              errors.bkashTrxId && 'border-destructive'
            )}
            {...register('bkashTrxId', {
              setValueAs: (v: string) => v.toUpperCase().replace(/\s/g, ''),
            })}
          />
          <p className="text-xs text-zinc-400">
            {t('payment.trxIdHint')}
          </p>
          {errors.bkashTrxId && (
            <p className="text-xs text-destructive" role="alert">
              {t(errors.bkashTrxId.message as Parameters<typeof t>[0])}
            </p>
          )}
        </div>

        {/* Sender number */}
        <div className="space-y-1.5">
          <Label htmlFor="bkashSenderNumber">
            {t('payment.senderNumberLabel')}
            <span className="text-destructive ml-0.5">*</span>
          </Label>
          <Input
            id="bkashSenderNumber"
            type="tel"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
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

        {/* Screenshot — optional */}
        <div className="space-y-2">
          <Label htmlFor="paymentScreenshot">
            {t('payment.screenshotLabel')}
            <span className="text-zinc-400 text-xs ml-1.5">({t('common.optional')})</span>
          </Label>

          {screenshotBase64 ? (
            <div className="flex items-start gap-3">
              <img
                src={screenshotBase64}
                alt={t('payment.screenshotAlt')}
                className="w-20 h-20 object-cover rounded-lg border border-zinc-200 shadow-sm"
              />
              <div className="flex flex-col gap-2">
                <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={13} />
                  {t('payment.screenshotUploaded')}
                </span>
                <label
                  htmlFor="paymentScreenshot"
                  className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer hover:underline"
                >
                  {t('registration.changePhoto')}
                </label>
              </div>
            </div>
          ) : (
            <label
              htmlFor="paymentScreenshot"
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200',
                'p-4 cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all',
                isCompressingScreenshot && 'opacity-60 cursor-not-allowed'
              )}
            >
              {isCompressingScreenshot ? (
                <Loader2 size={20} className="text-primary-500 animate-spin" />
              ) : (
                <Copy size={20} className="text-zinc-300" />
              )}
              <span className="text-xs text-zinc-500">
                {isCompressingScreenshot ? t('common.loading') : t('payment.screenshotHint')}
              </span>
            </label>
          )}

          <input
            id="paymentScreenshot"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleScreenshotChange}
            disabled={isCompressingScreenshot}
            className="hidden"
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 h-12"
          >
            {t('registration.back')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingConfig || !appConfig}
            className="flex-1 h-12 bg-bkash hover:bg-bkash-dark text-white font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {t('payment.submitting')}
              </>
            ) : (
              t('payment.submitVerification')
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}