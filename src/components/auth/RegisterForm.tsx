'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Step1Account } from '@/components/auth/steps/Step1Account'
import { Step2Professional } from './steps/Step2Professional'
import { Step3Location } from '@/components/auth/steps/Step3Location'
import { Step4Photo } from '@/components/auth/steps/Step4Photo'
import { StepIndicator } from '@/components/shared/StepIndicator'
import { signUpWithEmail } from '@/lib/firebase/auth'
import { createMember } from '@/lib/firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import type { RegistrationFormData } from '@/types'

const TOTAL_STEPS = 4

type PartialFormData = Partial<RegistrationFormData>

export function RegisterForm() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { setUser, setMember } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PartialFormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStep1Complete = (data: Pick<RegistrationFormData, 'email' | 'password' | 'confirmPassword'>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(2)
  }

  const handleStep2Complete = (data: Pick<RegistrationFormData, 'fullName' | 'fullNameBn' | 'designation' | 'regNumber' | 'bloodGroup'>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(3)
  }

  const handleStep3Complete = (data: Pick<RegistrationFormData, 'mobile' | 'whatsapp' | 'division' | 'district' | 'upazila' | 'institution' | 'officeAddress'>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(4)
  }

  const handleStep4Complete = async (photoBase64?: string) => {
    const finalData = { ...formData, profilePhotoBase64: photoBase64 } as RegistrationFormData
    setIsSubmitting(true)

    try {
      // 1. Create Firebase Auth user
      const credential = await signUpWithEmail(finalData.email, finalData.password)
      const user = credential.user
      setUser(user)

      // 2. Create Firestore member doc
      const now = new Date().toISOString()
      const memberData = {
        fullName: finalData.fullName,
        fullNameBn: finalData.fullNameBn,
        designation: finalData.designation,
        regNumber: finalData.regNumber,
        bloodGroup: finalData.bloodGroup,
        mobile: finalData.mobile,
        whatsapp: finalData.whatsapp ?? '',
        division: finalData.division,
        district: finalData.district,
        upazila: finalData.upazila,
        institution: finalData.institution,
        officeAddress: finalData.officeAddress,
        profilePhotoBase64: finalData.profilePhotoBase64 ?? '',
        status: 'pending_payment' as const,
        isVerified: false,
        favorites: [],
        updatedAt: now,
        email: finalData.email,
      }

      await createMember(user.uid, memberData)
      setMember({ ...memberData, uid: user.uid, joinedAt: now })

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
    <div className="space-y-6">
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      {currentStep === 1 && (
        <Step1Account
          defaultValues={formData}
          onComplete={handleStep1Complete}
        />
      )}
      {currentStep === 2 && (
        <Step2Professional
          defaultValues={formData}
          onComplete={handleStep2Complete}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <Step3Location
          defaultValues={formData}
          onComplete={handleStep3Complete}
          onBack={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 4 && (
        <Step4Photo
          onComplete={handleStep4Complete}
          onBack={() => setCurrentStep(3)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}