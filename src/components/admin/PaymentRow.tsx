'use client'

import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/shared/CopyButton'
import { formatDateTime } from '@/lib/utils/format'
import type { PaymentSubmission } from '@/types'
import { cn } from '@/lib/utils/cn'

const STATUS_CONFIG = {
  submitted: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', badgeClass: 'bg-amber-100 text-amber-700' },
  verified: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', badgeClass: 'bg-green-100 text-green-700' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', badgeClass: 'bg-red-100 text-red-700' },
} as const

interface PaymentRowProps {
  payment: PaymentSubmission
  onVerify: () => void
}

export function PaymentRow({ payment, onVerify }: PaymentRowProps) {
  const t = useTranslations()
  const locale = useLocale()
  const cfg = STATUS_CONFIG[payment.status]
  const StatusIcon = cfg.icon

  return (
    <div className="bg-white rounded-xl border border-zinc-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Status icon */}
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', cfg.bg)}>
        <StatusIcon size={18} className={cfg.color} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="col-span-2 md:col-span-1">
          <p className="text-sm font-semibold text-zinc-900 truncate">{payment.memberName}</p>
          <p className="text-xs text-zinc-400 font-mono">{payment.mobile}</p>
        </div>

        <div>
          <p className="text-xs text-zinc-500 font-medium">{t('admin.trxId')}</p>
          <div className="flex items-center gap-1">
            <span className="text-sm font-mono font-bold text-bkash">
              {payment.transactionId ?? payment.bkashTrxId}
                        </span>
            <CopyButton text={payment.transactionId ?? payment.bkashTrxId ?? ''} size={12} />
                    </div>
          <p className="text-xs text-zinc-400">{t('payment.senderNumberLabel')}: {payment.senderNumber ?? payment.bkashSenderNumber}</p>
        </div>

        <div>
          <p className="text-xs text-zinc-500">{t('payment.amount')}</p>
          <p className="text-lg font-bold text-bkash">৳{payment.amount}</p>
        </div>

        <div>
          <p className="text-xs text-zinc-500">{t('admin.submittedAt')}</p>
          <p className="text-xs text-zinc-700">{formatDateTime(payment.submittedAt, locale as 'en' | 'bn')}</p>
          {payment.screenshotBase64 && (
            <a
              href={payment.screenshotBase64}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-xs text-primary-600 hover:underline mt-0.5"
            >
              {t('admin.viewScreenshot')} <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Right: status + action */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="secondary" className={cn('border-0 text-xs', cfg.badgeClass)}>
          {t(`payment.status.${payment.status}` as Parameters<typeof t>[0])}
        </Badge>

        {payment.status === 'submitted' && (
          <Button
            size="sm"
            onClick={onVerify}
            className="bg-primary-600 hover:bg-primary-700 text-white text-xs gap-1"
          >
            <CheckCircle2 size={13} />
            {t('admin.verify')}
          </Button>
        )}

        {payment.adminNote && (
          <div className="text-xs text-zinc-500 max-w-[140px] truncate" title={payment.adminNote}>
            {payment.adminNote}
          </div>
        )}
      </div>
    </div>
  )
}