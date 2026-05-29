const BD_WHATSAPP_MSG =
  'আসসালামু আলাইকুম, আমি MedConnect BD থেকে আপনার সাথে যোগাযোগ করছি।'
const EN_WHATSAPP_MSG =
  "Hello, I'm contacting you through MedConnect BD."

export function normalizeToE164(mobile: string): string {
  const digits = mobile.replace(/\D/g, '')
  if (digits.startsWith('880')) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 11) return `+880${digits.slice(1)}`
  if (digits.length === 10) return `+880${digits}`
  return `+${digits}`
}

export function makeCallLink(mobile: string): string {
  return `tel:${normalizeToE164(mobile)}`
}

export function makeWhatsAppLink(
  number: string,
  name: string,
  locale: string
): string {
  const e164 = normalizeToE164(number).replace('+', '')
  const msg = locale === 'bn' ? BD_WHATSAPP_MSG : EN_WHATSAPP_MSG
  const text = encodeURIComponent(`${msg} — ${name}`)
  return `https://wa.me/${e164}?text=${text}`
}

export function makeEmailLink(email: string): string {
  return `mailto:${email}`
}

export function makeMapsLink(address: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    return
  }
  // Fallback for older browsers / WebViews
  const el = document.createElement('textarea')
  el.value = text
  el.style.position = 'fixed'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}