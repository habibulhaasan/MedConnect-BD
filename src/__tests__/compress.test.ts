/**
 * Tests for image compression utilities.
 * Note: browser-image-compression and canvas APIs are mocked.
 */
import { isValidImageBase64, sanitizeText, sanitizeTrxId } from '@/lib/utils/sanitize'

describe('isValidImageBase64', () => {
  it('accepts valid JPEG base64 data URI', () => {
    // Create a minimal valid base64 string
    const validJpeg = 'data:image/jpeg;base64,' + 'A'.repeat(100)
    // Not valid base64 encoding but tests prefix validation
    expect(isValidImageBase64(validJpeg)).toBe(true)
  })

  it('rejects non-image data URIs', () => {
    expect(isValidImageBase64('data:text/html;base64,PHNjcmlwdD4=')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidImageBase64('')).toBe(false)
  })

  it('rejects plain text', () => {
    expect(isValidImageBase64('hello world')).toBe(false)
  })

  it('rejects data URI without base64 marker', () => {
    expect(isValidImageBase64('data:image/jpeg,rawdata')).toBe(false)
  })
})

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<script>alert(1)</script>Dr. Rahim')).toBe('Dr. Rahim')
  })

  it('strips javascript: protocol', () => {
    expect(sanitizeText('javascript:alert(1)')).toBe('alert(1)')
  })

  it('strips onclick handlers', () => {
    expect(sanitizeText('hello onclick=alert(1) world')).toBe('hello world')
  })

  it('normalizes whitespace', () => {
    expect(sanitizeText('hello   world')).toBe('hello world')
  })

  it('trims leading/trailing whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello')
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeText('')).toBe('')
  })
})

describe('sanitizeTrxId', () => {
  it('uppercases the input', () => {
    expect(sanitizeTrxId('ab12345678')).toBe('AB12345678')
  })

  it('removes special characters', () => {
    expect(sanitizeTrxId('AB!@#12345')).toBe('AB12345')
  })

  it('truncates to 20 characters', () => {
    expect(sanitizeTrxId('A'.repeat(25))).toHaveLength(20)
  })
})