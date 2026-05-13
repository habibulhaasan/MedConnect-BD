'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const t = useTranslations('registration')

  const stepKeys = ['step1', 'step2', 'step3', 'step4'] as const

  return (
    <div className="space-y-3" aria-label="Registration progress">
      {/* Step labels */}
      <p className="text-center text-sm text-zinc-500">
        {t('stepOf', { current: currentStep, total: totalSteps })}
      </p>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1
          const isComplete = step < currentStep
          const isCurrent = step === currentStep

          return (
            <div key={step} className="flex items-center gap-2">
              <div
                role="listitem"
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${t(stepKeys[i])} ${isComplete ? '(complete)' : isCurrent ? '(current)' : '(upcoming)'}`}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  isComplete && 'bg-primary-600 text-white',
                  isCurrent && 'bg-primary-600 text-white ring-4 ring-primary-100',
                  !isComplete && !isCurrent && 'bg-zinc-100 text-zinc-400'
                )}
              >
                {isComplete ? <Check size={14} strokeWidth={2.5} /> : step}
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    'h-0.5 w-8 transition-all',
                    isComplete ? 'bg-primary-600' : 'bg-zinc-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Current step name */}
      <p className="text-center text-base font-medium text-zinc-800">
        {t(stepKeys[currentStep - 1])}
      </p>
    </div>
  )
}