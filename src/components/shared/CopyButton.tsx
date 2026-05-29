'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface CopyButtonProps {
  text: string
  label?: string
  size?: number
  className?: string
}

export function CopyButton({ text, label, size = 14, className }: CopyButtonProps) {
  const t = useTranslations('common')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(t('copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('copyFailed'))
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label ?? t('copy')}
      className={cn(
        'text-zinc-400 hover:text-zinc-700 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded',
        className
      )}
    >
      {copied ? (
        <Check size={size} className="text-green-500" />
      ) : (
        <Copy size={size} />
      )}
    </button>
  )
}