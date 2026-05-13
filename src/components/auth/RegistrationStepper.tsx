'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Step {
  key: string
  labelKey: string
}

const STEPS: Step[] = [
  { key: '1', labelKey: 'registration.step1' },
  { key: '2', labelKey: 'registration.step2' },
  { key: '3', labelKey: 'registration.step3' },
  { key: '4', labelKey: 'registration.step4Payment' },
]

interface RegistrationStepperProps {
  currentStep: number // 1-4
}

export function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  const t = useTranslations()

  return (
    <div className="w-full" aria-label="Registration progress">
      {/* Progress bar */}
      <div className="relative mb-4">
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
          />
        </div>
      </div>

      {/* Step dots — mobile: compact, desktop: full labels */}
      <div className="flex items-start justify-between">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1
          const isComplete = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ring-2',
                  isComplete && 'bg-primary-600 text-white ring-primary-600',
                  isCurrent && 'bg-primary-600 text-white ring-primary-200 ring-offset-2',
                  !isComplete && !isCurrent && 'bg-zinc-100 text-zinc-400 ring-zinc-100'
                )}
              >
                {isComplete ? <Check size={14} strokeWidth={2.5} /> : stepNumber}
              </div>
              {/* Label: hidden on mobile (xs), visible md+ */}
              <span
                className={cn(
                  'hidden md:block text-xs font-medium text-center leading-tight max-w-[80px]',
                  isCurrent ? 'text-primary-700' : 'text-zinc-400'
                )}
              >
                {t(step.labelKey as Parameters<typeof t>[0])}
              </span>
            </div>
          )
        })}
      </div>

      {/* Current step name — mobile only */}
      <p className="md:hidden text-center text-sm font-medium text-zinc-700 mt-2">
        {t(`registration.stepOf` as Parameters<typeof t>[0], {
          current: currentStep,
          total: STEPS.length,
        })}{' '}
        — {t(STEPS[currentStep - 1].labelKey as Parameters<typeof t>[0])}
      </p>
    </div>
  )
}