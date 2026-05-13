import { format, parseISO, isValid } from 'date-fns'

export function formatDate(
  dateStr: string | undefined | null,
  locale: 'en' | 'bn' = 'en'
): string {
  if (!dateStr) return ''
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return ''
    const formatted = format(date, 'dd MMM yyyy')
    if (locale === 'bn') return toBengaliNumerals(formatted)
    return formatted
  } catch {
    return ''
  }
}

export function formatDateTime(
  dateStr: string | undefined | null,
  locale: 'en' | 'bn' = 'en'
): string {
  if (!dateStr) return ''
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return ''
    const formatted = format(date, 'dd MMM yyyy, hh:mm a')
    if (locale === 'bn') return toBengaliNumerals(formatted)
    return formatted
  } catch {
    return ''
  }
}

export function formatMobile(mobile: string): string {
  if (!mobile) return ''
  // Format BD mobile: 01XXXXXXXXX → +880 1X-XXXX-XXXX
  const digits = mobile.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('01')) {
    return `+880 ${digits.slice(1, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return mobile
}

export function toBengaliNumerals(str: string): string {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return str.replace(/[0-9]/g, (d) => bengaliNumerals[parseInt(d)])
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}