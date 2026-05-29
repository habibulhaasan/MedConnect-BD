'use client'

import { useTranslations } from 'next-intl'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentSubmissionForm } from '@/components/member/PaymentSubmissionForm'

export function PaymentPendingCard() {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      <Card className="border-amber-100 bg-amber-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="text-amber-600" size={20} />
            </div>
            <CardTitle className="text-lg text-amber-800">
              {t('registration.successTitle')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">
            {t('registration.pendingMessage')}
          </p>
        </CardContent>
      </Card>

      <PaymentSubmissionForm />
    </div>
  )
}