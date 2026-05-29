'use client'

import { Phone, MessageCircle, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'

interface ContactActionsProps {
  mobile: string
  whatsapp?: string
  email?: string
  name?: string
  size?: 'sm' | 'md'
}

const WHATSAPP_GREETING_EN = 'Hello, I found your contact on MedConnect BD.'
const WHATSAPP_GREETING_BN = 'আমি MedConnect BD-তে আপনার যোগাযোগ পেয়েছি।'

function normalizeToE164(mobile: string): string {
  const digits = mobile.replace(/\D/g, '')
  if (digits.startsWith('880')) return `+${digits}`
  if (digits.startsWith('0')) return `+880${digits.slice(1)}`
  return `+880${digits}`
}

export function ContactActions({
  mobile,
  whatsapp,
  email,
  name,
  size = 'md',
}: ContactActionsProps) {
  const t = useTranslations('members')
  const e164Mobile = normalizeToE164(mobile)
  const e164Whatsapp = whatsapp ? normalizeToE164(whatsapp) : e164Mobile
  const waNumber = e164Whatsapp.replace('+', '')
  const greeting = encodeURIComponent(
    `${WHATSAPP_GREETING_BN} — ${name ?? ''}`
  )
  const waUrl = `https://wa.me/${waNumber}?text=${greeting}`

  const btnClass = cn(
    'flex items-center justify-center rounded-full transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
    size === 'sm'
      ? 'w-8 h-8'
      : 'w-10 h-10'
  )

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-2">
        {/* Call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`tel:${e164Mobile}`}
              aria-label={`${t('callNow')}: ${mobile}`}
              className={cn(
                btnClass,
                'bg-green-50 text-green-600 hover:bg-green-100 focus-visible:ring-green-400'
              )}
            >
              <Phone size={size === 'sm' ? 14 : 17} />
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t('callNow')}
          </TooltipContent>
        </Tooltip>

        {/* WhatsApp */}
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('whatsapp')}: ${whatsapp ?? mobile}`}
              className={cn(
                btnClass,
                'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 focus-visible:ring-emerald-400'
              )}
            >
              <MessageCircle size={size === 'sm' ? 14 : 17} />
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {t('whatsapp')}
          </TooltipContent>
        </Tooltip>

        {/* Email */}
        {email && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`mailto:${email}`}
                aria-label={`Email: ${email}`}
                className={cn(
                  btnClass,
                  'bg-blue-50 text-blue-600 hover:bg-blue-100 focus-visible:ring-blue-400'
                )}
              >
                <Mail size={size === 'sm' ? 14 : 17} />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {email}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}