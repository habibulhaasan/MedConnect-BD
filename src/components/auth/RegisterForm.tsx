'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RegistrationStepper } from '@/components/auth/RegistrationStepper'
import { Step1AccountInfo } from '@/components/auth/Step1AccountInfo'
import { Step2Location } from '@/components/auth/Step2Location'
import { Step3PersonalPhoto } from '@/components/auth/Step3PersonalPhoto'
import { Step4Payment } from '@/components/auth/Step4Payment'
import { useAuthStore } from '@/stores/authStore'
import { type Step1Values } from '@/lib/validations/auth'
import { type Step2Values, type Step3Values } from '@/lib/validations/member'
import { type Step4Values } from '@/lib/validations/payment'
import { signUpWithEmail } from '@/lib/firebase/auth'
import { createMember, createPaymentSubmission, updateMember } from '@/lib/firebase/firestore'

// ── Accumulated form state across steps ───────────────────────────────────
interface RegState {
  step1?: Step1Values
  step2?: Step2Values
  step3?: Step3Values
}

export function RegisterForm() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { setUser, setMember } = useAuthStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [regState, setRegState] = useState<RegState>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Step handlers ────────────────────────────────────────────────────────

  const handleStep1 = (data: Step1Values) => {
    setRegState((prev) => ({ ...prev, step1: data }))
    setCurrentStep(2)
  }

  const handleStep2 = (data: Step2Values) => {
    setRegState((prev) => ({ ...prev, step2: data }))
    setCurrentStep(3)
  }

  const handleStep3 = (data: Step3Values) => {
    setRegState((prev) => ({ ...prev, step3: data }))
    setCurrentStep(4)
  }

  const handleStep4 = async (paymentData: Step4Values) => {
    const { step1, step2, step3 } = regState
    if (!step1 || !step2 || !step3) {
      toast.error(t('errors.unknown'))
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create Firebase Auth user — use mobile as a fallback identifier
      //    Email may be absent (optional field), so construct a synthetic one if needed
      const authEmail = step1.email && step1.email.trim()
        ? step1.email.trim()
        : `${step1.mobile.replace(/\D/g, '')}@medconnectbd.app`

      const credential = await signUpWithEmail(authEmail, step1.password)
      const user = credential.user
      setUser(user)

      const now = new Date().toISOString()

      // 2. Create /members/{uid} with status: 'pending_payment'
      const memberData = {
        fullName: step1.fullName,
        fullNameBn: step1.fullNameBn,
        designation: step1.designation,
        regNumber: step1.regNumber,
        mobile: step1.mobile,
        email: step1.email ?? authEmail,
        division: step2.division,
        district: step2.district,
        upazila: step2.upazila,
        institution: step2.institution,
        officeAddress: step2.officeAddress,
        whatsapp: step2.whatsapp ?? '',
        bloodGroup: step3.bloodGroup,
        lastDonateDate: step3.lastDonateDate,
        profilePhotoBase64: step3.profilePhotoBase64 ?? '',
        status: 'pending_payment' as const,
        isVerified: false,
        favorites: [],
        updatedAt: now,
      }

      await createMember(user.uid, memberData)

      // 3. Create /payments/{auto-id} with payment submission data
      await createPaymentSubmission({
        uid: user.uid,
        memberName: step1.fullName,
        mobile: step1.mobile,
        amount: 0, // will be filled from appConfig but we pass the field
        bkashTrxId: paymentData.bkashTrxId,
        bkashSenderNumber: paymentData.bkashSenderNumber,
        screenshotBase64: paymentData.screenshotBase64,
      })

      // 4. Update member status to 'pending_approval'
      await updateMember(user.uid, { status: 'pending_approval' })

      setMember({
        ...memberData,
        uid: user.uid,
        joinedAt: now,
        updatedAt: now,
        status: 'pending_approval',
      })

      toast.success(t('registration.successTitle'))
      router.push(`/${locale}/register/pending`)
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown'
      const messageKey = `errors.${code}` as Parameters<typeof t>[0]
      toast.error(t(messageKey) ?? t('errors.unknown'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <RegistrationStepper currentStep={currentStep} />

      {currentStep === 1 && (
        <Step1AccountInfo onNext={handleStep1} />
      )}

      {currentStep === 2 && regState.step1 && (
        <Step2Location
          onNext={handleStep2}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <Step3PersonalPhoto onNext={handleStep3} onBack={() => setCurrentStep(2)} />
      )}

      {currentStep === 4 && (
        <Step4Payment onBack={() => setCurrentStep(3)} />
      )}
    </div>
  )
}