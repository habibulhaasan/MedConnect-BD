'use client'

import { useTranslations } from 'next-intl'
import { useRegistrationStore } from '@/stores/registrationStore'
import { RegistrationStepper } from './RegistrationStepper'
import { Step1AccountInfo } from './Step1AccountInfo'
import { Step2Location } from './Step2Location'
import { Step3PersonalPhoto } from './Step3PersonalPhoto'
import { Step4Payment } from './Step4Payment'

export function RegistrationPage() {
  const t = useTranslations()
  const { currentStep, setCurrentStep } = useRegistrationStore()

  const goNext = () => setCurrentStep(Math.min(currentStep + 1, 4))
  const goBack = () => setCurrentStep(Math.max(currentStep - 1, 1))

  return (
    <div className="space-y-6">
      {/* Stepper nav */}
      <RegistrationStepper currentStep={currentStep} />

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8">
        {currentStep === 1 && <Step1AccountInfo onNext={goNext} />}
        {currentStep === 2 && <Step2Location onNext={goNext} onBack={goBack} />}
        {currentStep === 3 && <Step3PersonalPhoto onNext={goNext} onBack={goBack} />}
        {currentStep === 4 && <Step4Payment onBack={goBack} />}
      </div>
    </div>
  )
}