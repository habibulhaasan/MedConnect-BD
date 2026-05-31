'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Loader2,
  ReceiptText,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { step4Schema, type Step4InputValues, type Step4Values } from '@/lib/validations/payment'
import type { PaymentMethod } from '@/types'
import { useRegistrationStore } from '@/stores/registrationStore'
import { useAuthStore } from '@/stores/authStore'
import { signInWithEmail, signUpWithEmail } from '@/lib/firebase/auth'
import { submitRegistrationForReview } from '@/lib/firebase/member-api'
import { compressPaymentScreenshot } from '@/lib/image/compress'
import { cn } from '@/lib/utils/cn'

interface Step4Props {
  onBack: () => void
}

const MANUAL_REFERENCE = 'MANUAL'

export function Step4Payment({ onBack }: Step4Props) {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { step1, step2, step3, step4, setStep4, reset: resetStore } = useRegistrationStore()
  const { setUser, setMember } = useAuthStore()

  const [screenshotBase64, setScreenshotBase64] = useState(step4.screenshotBase64)
  const [isCompressingScreenshot, setIsCompressingScreenshot] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step4InputValues, unknown, Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      method: step4.method ?? 'bkash',
      transactionId: step4.transactionId ?? '',
      senderNumber: step4.senderNumber ?? '',
    },
  })

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

    // ── Guard: ensure all prior steps have data in the store ──────────────
    const missingField = !step1.fullName ? 'fullName'
      : !step1.mobile ? 'mobile'
      : !step1.password ? 'password (store may have been cleared — please restart registration)'
      : !step2.division ? 'division'
      : !step3.bloodGroup ? 'bloodGroup'
      : null

    if (missingField) {
      console.error('[Step4Payment] Missing required store field:', missingField)
      toast.error(`Missing data: ${missingField}. Please go back and re-enter.`)
      setIsSubmitting(false)
      return
    }

    // ── Step A: Create / sign in Firebase Auth user ───────────────────────
    let user: import('firebase/auth').User
    try {
      const authEmail = step1.email?.trim()
        ? step1.email.trim()
        : `${step1.mobile.replace(/\D/g, '')}@medconnectbd.app`

      const credential = await signUpWithEmail(authEmail, step1.password).catch((err) => {
        if ((err as { code?: string }).code === 'auth/email-already-in-use') {
          return signInWithEmail(authEmail, step1.password)
        }
        throw err
      })
      user = credential.user
      setUser(user)
    } catch (err) {
      const code = (err as { code?: string }).code ?? 'unknown'
      console.error('[Step4Payment] Auth error:', err)
      const authErrorMap: Record<string, Parameters<typeof t>[0]> = {
        'auth/email-already-in-use': 'errors.auth/email-already-in-use',
        'auth/too-many-requests': 'errors.auth/too-many-requests',
        'auth/invalid-credential': 'errors.auth/invalid-credential',
        'auth/wrong-password': 'errors.auth/wrong-password',
      }
      toast.error(authErrorMap[code] ? t(authErrorMap[code]) : `Auth failed: ${code}`)
      setIsSubmitting(false)
      return
    }

    // ── Step B: Submit member + payment to Firestore via API ──────────────
    try {
      const now = new Date().toISOString()
      const memberData = {
        fullName: step1.fullName,
        fullNameBn: step1.fullNameBn ?? '',
        designation: step1.designation as import('@/types').Designation,
        regNumber: step1.regNumber,
        mobile: step1.mobile,
        email: step1.email || user.email || '',
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

      const result = await submitRegistrationForReview(
        {
          member: memberData,
          payment: {
            uid: user.uid,
            memberName: step1.fullName,
            mobile: step1.mobile,
            amount: 0,
            method: values.method,
            transactionId: values.transactionId?.toUpperCase().trim() || MANUAL_REFERENCE,
            senderNumber: values.senderNumber?.trim() || step1.mobile,
            screenshotBase64: screenshotBase64 || '',
          },
        },
        user
      )

      setMember(result.member)
      resetStore()
      toast.success(t('payment.submitted'))
      router.push(`/${locale}/register/pending`)
    } catch (err) {
      const code = (err as { code?: string }).code ?? 'unknown'
      const message = err instanceof Error ? err.message : String(err)
      console.error('[Step4Payment] API/Firestore error — code:', code, '| message:', message, '| full:', err)
      // Show the real error message so it can be reported / debugged
      toast.error(`Submission failed: ${message} (${code})`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-200 bg-primary-50 overflow-hidden">
        <div className="bg-primary-600 px-5 py-4 flex items-center gap-3">
          <ClipboardList className="text-white" size={22} />
          <div>
            <h2 className="text-white font-semibold text-base leading-tight">
              {t('payment.manualTitle')}
            </h2>
            <p className="text-white/80 text-xs">
              {t('payment.manualSubtitle')}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-white border border-primary-100 p-4 flex items-start gap-3">
            <BadgeCheck size={28} className="text-primary-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-800">
                {t('payment.manualReviewTitle')}
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {t('payment.manualReviewDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              {t('payment.instructions')}
            </p>
            <ol className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  1
                </span>
                <span className="text-sm text-zinc-700">{t('payment.manualStep1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  2
                </span>
                <span className="text-sm text-zinc-700">{t('payment.manualStep2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  3
                </span>
                <span className="text-sm text-zinc-700">{t('payment.manualStep3')}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 border-b border-zinc-100 pb-3">
          <ArrowRight size={16} className="text-primary-600" />
          {t('payment.manualFormTitle')}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="method">{t('payment.methodLabel') ?? 'Payment Method'}</Label>
          <select id="method" className="w-full border rounded p-2" {...register('method')}>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="transactionId">
            {t('payment.transactionIdLabel') ?? 'Transaction ID'}
            <span className="text-zinc-400 text-xs ml-1.5">({t('common.optional')})</span>
          </Label>
          <Input
            id="transactionId"
            placeholder={t('payment.transactionIdPlaceholder') ?? ''}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={!!errors.transactionId}
            className={cn(
              'font-mono uppercase tracking-widest text-base',
              errors.transactionId && 'border-destructive'
            )}
            {...register('transactionId', {
              setValueAs: (v: string) => v.toUpperCase().replace(/\s/g, ''),
            })}
          />
          {errors.transactionId && (
            <p className="text-xs text-destructive" role="alert">
              {t(errors.transactionId.message as Parameters<typeof t>[0])}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="senderNumber">
            {t('payment.senderNumberLabel') ?? 'Sender Number'}
            <span className="text-zinc-400 text-xs ml-1.5">({t('common.optional')})</span>
          </Label>
          <Input
            id="senderNumber"
            type="tel"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            aria-invalid={!!errors.senderNumber}
            className={cn(errors.senderNumber && 'border-destructive')}
            {...register('senderNumber')}
          />
          {errors.senderNumber && (
            <p className="text-xs text-destructive" role="alert">
              {t(errors.senderNumber.message as Parameters<typeof t>[0])}
            </p>
          )}
        </div>

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
                <Upload size={20} className="text-zinc-300" />
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
            disabled={isSubmitting || isCompressingScreenshot}
            className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                {t('payment.submitting')}
              </>
            ) : (
              <>
                <ReceiptText size={16} className="mr-2" />
                {t('payment.submitVerification')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}