'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Smartphone,
  User,
  MapPin,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { DesignationBadge } from '@/components/shared/DesignationBadge'
import { adminApi } from '@/lib/firebase/admin-api'
import { formatDateTime } from '@/lib/utils/format'
import { copyToClipboard } from '@/lib/utils/contact'
import type { Member, PaymentSubmission } from '@/types'
import { cn } from '@/lib/utils/cn'

interface VerifyPaymentModalProps {
  open: boolean
  member: Member | null
  payment: PaymentSubmission | null
  registrationFee: number
  onClose: () => void
  onApproved: () => void
  onRejected: () => void
}

type Step = 'review' | 'reject-reason' | 'confirming'

export function VerifyPaymentModal({
  open,
  member,
  payment,
  registrationFee,
  onClose,
  onApproved,
  onRejected,
}: VerifyPaymentModalProps) {
  const t = useTranslations()
  const [step, setStep] = useState<Step>('review')
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [copiedTrx, setCopiedTrx] = useState(false)

  const handleClose = () => {
    if (isProcessing) return
    setStep('review')
    setRejectReason('')
    onClose()
  }

  const handleApprove = async () => {
    if (!member || !payment) return
    setIsProcessing(true)
    try {
      await adminApi.approveMember(member.uid, payment.id)
      toast.success(t('admin.approveSuccess', { name: member.fullName }))
      handleClose()
      onApproved()
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!member || !payment) return
    if (!rejectReason.trim()) {
      toast.error(t('admin.rejectReasonRequired'))
      return
    }
    setIsProcessing(true)
    try {
      await adminApi.rejectPayment(member.uid, payment.id, rejectReason.trim())
      toast.success(t('admin.rejectSuccess'))
      handleClose()
      onRejected()
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setIsProcessing(false)
    }
  }

  const copyTrxId = async () => {
    if (!payment) return
    await copyToClipboard(payment.transactionId)
    setCopiedTrx(true)
    setTimeout(() => setCopiedTrx(false), 2000)
    toast.success(t('common.copied'))
  }

  if (!member || !payment) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone size={18} className="text-bkash" />
            {t('admin.verifyPayment')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.verifyPaymentDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Member info */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
            <ProfileAvatar
              base64={member.profilePhotoBase64}
              name={member.fullName}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-900">{member.fullName}</p>
              {member.fullNameBn && (
                <p className="text-xs text-zinc-500 font-bangla">{member.fullNameBn}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <DesignationBadge designation={member.designation} size="sm" />
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <MapPin size={10} />
                  {member.district}, {member.division}
                </span>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              {t('admin.paymentDetails')}
            </h3>

            {/* TrxID — prominent */}
            <div className="rounded-xl border-2 border-bkash/30 bg-bkash-light p-4">
              <p className="text-xs text-zinc-600 font-medium mb-1">
                {t('admin.trxId')}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold font-mono text-bkash tracking-wider flex-1">
                  {payment.transactionId}
                </span>
                <button
                  type="button"
                  onClick={copyTrxId}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    copiedTrx
                      ? 'bg-green-100 text-green-700'
                      : 'bg-white text-bkash border border-bkash/30 hover:bg-bkash/5'
                  )}
                >
                  {copiedTrx ? <Check size={12} /> : <Copy size={12} />}
                  {copiedTrx ? t('payment.copied') : t('payment.copy')}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-xs text-zinc-500">{t('payment.senderNumberLabel')}</p>
                  <p className="text-sm font-semibold text-zinc-800">{payment.senderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{t('payment.amount')}</p>
                  <p className="text-xl font-bold text-bkash">৳{payment.amount}</p>
                </div>
              </div>
            </div>

            {/* Expected amount notice */}
            {payment.amount !== registrationFee && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  {t('admin.amountMismatch', {
                    expected: registrationFee,
                    received: payment.amount,
                  })}
                </p>
              </div>
            )}

            {/* Submitted at */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">{t('admin.submittedAt')}</span>
              <span className="text-zinc-700 text-xs">{formatDateTime(payment.submittedAt)}</span>
            </div>

            {/* Mobile */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">{t('registration.labels.mobile')}</span>
              <span className="font-mono text-zinc-700">{member.mobile}</span>
            </div>
          </div>

          {/* Payment screenshot */}
          {payment.screenshotBase64 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                {t('payment.screenshotLabel')}
              </h3>
              <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                <img
                  src={payment.screenshotBase64}
                  alt={t('payment.screenshotAlt')}
                  className="w-full object-contain max-h-64"
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Admin instruction */}
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-xs font-semibold text-blue-800 mb-1">{t('admin.verifyInstruction')}</p>
            <p className="text-xs text-blue-700">{t('admin.verifyInstructionDesc')}</p>
          </div>

          {/* Reject reason input */}
          {step === 'reject-reason' && (
            <div className="space-y-2">
              <Label htmlFor="reject-reason" className="text-sm font-medium text-red-700">
                {t('admin.rejectReason')}
                <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('admin.rejectReasonPlaceholder')}
                rows={3}
                maxLength={300}
                className="border-red-200 focus-visible:ring-red-400"
              />
              <p className="text-xs text-zinc-400 text-right">{rejectReason.length}/300</p>
            </div>
          )}

          {/* Action buttons */}
          {step === 'review' && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={() => setStep('reject-reason')}
                disabled={isProcessing}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
              >
                <XCircle size={15} />
                {t('admin.rejectPayment')}
              </Button>
              <Button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
              >
                {isProcessing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                {t('admin.approveMember')}
              </Button>
            </div>
          )}

          {step === 'reject-reason' && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('review')}
                disabled={isProcessing}
                className="flex-1"
              >
                {t('common.back')}
              </Button>
              <Button
                type="button"
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white gap-1.5"
              >
                {isProcessing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={15} />
                )}
                {t('admin.confirmReject')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}