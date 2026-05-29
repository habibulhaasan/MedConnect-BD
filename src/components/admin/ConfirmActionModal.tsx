'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ConfirmActionModalProps {
  open: boolean
  title: string
  description: string
  requireReason?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
  confirmLabel?: string
  confirmVariant?: 'destructive' | 'default'
  isProcessing?: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

export function ConfirmActionModal({
  open,
  title,
  description,
  requireReason = false,
  reasonLabel,
  reasonPlaceholder,
  confirmLabel,
  confirmVariant = 'destructive',
  isProcessing = false,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  const t = useTranslations('common')
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return
    onConfirm(reason.trim())
  }

  const handleClose = () => {
    if (isProcessing) return
    setReason('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-destructive" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-1">{description}</DialogDescription>
        </DialogHeader>

        {requireReason && (
          <div className="space-y-1.5">
            <Label className="text-sm">
              {reasonLabel ?? t('reason')}
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              maxLength={300}
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || (requireReason && !reason.trim())}
            variant={confirmVariant === 'destructive' ? 'destructive' : 'default'}
            className={confirmVariant === 'default' ? 'bg-primary-600 hover:bg-primary-700 text-white' : ''}
          >
            {isProcessing && <Loader2 size={13} className="animate-spin mr-1.5" />}
            {confirmLabel ?? t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}