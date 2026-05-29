'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Step {
  number: number
  labelKey: string
}

const STEPS: Step[] = [
  { number: 1, labelKey: 'registration.step1' },
  { number: 2, labelKey: 'registration.step2' },
  { number: 3, labelKey: 'registration.step3' },
  { number: 4, labelKey: 'registration.step4' },
]

interface RegistrationStepperProps {
  currentStep: number
}

export function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  const t = useTranslations()

  return (
    <nav aria-label={t('registration.progressLabel')} className="w-full">
      {/* Mobile: compact dots */}
      <div className="flex md:hidden items-center justify-center gap-1.5 py-2">
        {STEPS.map((step) => {
          const isComplete = step.number < currentStep
          const isCurrent = step.number === currentStep
          return (
            <div
              key={step.number}
              role="listitem"
              aria-label={`${t(step.labelKey as Parameters<typeof t>[0])} ${isComplete ? '— complete' : isCurrent ? '— current' : '— upcoming'}`}
              className={cn(
                'transition-all duration-300 rounded-full',
                isComplete && 'w-5 h-5 bg-primary-600 flex items-center justify-center',
                isCurrent && 'w-6 h-6 bg-primary-600 ring-4 ring-primary-100',
                !isComplete && !isCurrent && 'w-2 h-2 bg-zinc-300'
              )}
            >
              {isComplete && <Check size={10} strokeWidth={3} className="text-white" />}
              {isCurrent && (
                <span className="text-white text-xs font-bold">{step.number}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: current step label */}
      <p className="md:hidden text-center text-sm font-medium text-zinc-700 mb-4">
        {t('registration.stepOf', { current: currentStep, total: STEPS.length })}{' '}
        —{' '}
        {t(STEPS[currentStep - 1]!.labelKey as Parameters<typeof t>[0])}
      </p>

      {/* Desktop: full stepper */}
      <div className="hidden md:flex items-center w-full mb-6">
        {STEPS.map((step, index) => {
          const isComplete = step.number < currentStep
          const isCurrent = step.number === currentStep
          const isLast = index === STEPS.length - 1

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    isComplete && 'bg-primary-600 text-white shadow-sm',
                    isCurrent && 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-md',
                    !isComplete && !isCurrent && 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                  )}
                >
                  {isComplete ? (
                    <Check size={16} strokeWidth={2.5} />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap transition-colors',
                    isCurrent ? 'text-primary-700' : isComplete ? 'text-zinc-600' : 'text-zinc-400'
                  )}
                >
                  {t(step.labelKey as Parameters<typeof t>[0])}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-2 mb-5">
                  <div
                    className={cn(
                      'h-0.5 w-full transition-all duration-500',
                      isComplete ? 'bg-primary-500' : 'bg-zinc-200'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}