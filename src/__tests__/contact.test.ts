import {
  makeCallLink,
  makeWhatsAppLink,
  makeEmailLink,
  makeMapsLink,
  normalizeToE164,
} from '@/lib/utils/contact'

describe('normalizeToE164', () => {
  it('converts 01XXXXXXXXX to +880XXXXXXXXX', () => {
    expect(normalizeToE164('01712345678')).toBe('+8801712345678')
  })

  it('converts 880XXXXXXXXX to +880XXXXXXXXX', () => {
    expect(normalizeToE164('8801712345678')).toBe('+8801712345678')
  })

  it('passes +880XXXXXXXXX through unchanged', () => {
    expect(normalizeToE164('+8801712345678')).toBe('+8801712345678')
  })

  it('handles numbers with spaces/hyphens', () => {
    expect(normalizeToE164('017-1234-5678')).toBe('+8801712345678')
  })
})

describe('makeCallLink', () => {
  it('produces a tel: link', () => {
    expect(makeCallLink('01712345678')).toBe('tel:+8801712345678')
  })
})

describe('makeWhatsAppLink', () => {
  it('produces a wa.me link with encoded message in Bangla', () => {
    const link = makeWhatsAppLink('01712345678', 'Dr. Rahim', 'bn')
    expect(link).toContain('wa.me/8801712345678')
    expect(link).toContain('text=')
    expect(link).toContain('MedConnect%20BD')
  })

  it('produces a wa.me link with English message', () => {
    const link = makeWhatsAppLink('01712345678', 'Dr. Rahim', 'en')
    expect(link).toContain("I'm contacting you through MedConnect BD")
  })

  it('falls back to mobile if whatsapp not provided', () => {
    const link = makeWhatsAppLink('01712345678', 'Test', 'en')
    expect(link).toContain('8801712345678')
  })
})

describe('makeEmailLink', () => {
  it('produces a mailto: link', () => {
    expect(makeEmailLink('test@example.com')).toBe('mailto:test@example.com')
  })
})

describe('makeMapsLink', () => {
  it('encodes the address in a Google Maps URL', () => {
    const link = makeMapsLink('Dhaka Medical College, Dhaka')
    expect(link).toContain('maps.google.com')
    expect(link).toContain('Dhaka%20Medical%20College')
  })
})