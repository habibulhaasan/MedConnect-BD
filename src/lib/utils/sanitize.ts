/**
 * Input sanitization utilities.
 * Strip HTML and dangerous characters from all text before Firestore writes.
 */

// Characters that should never appear in member text fields
const DANGEROUS_PATTERNS = [
  /<[^>]*>/g,           // HTML tags
  /javascript:/gi,      // JS protocol
  /on\w+\s*=/gi,       // Event handlers: onclick=, onload=, etc.
  /data:/gi,            // Data URIs in text fields (different from photo base64)
  /vbscript:/gi,        // VBScript protocol
  /expression\s*\(/gi, // CSS expression()
]

/**
 * Strip HTML tags and dangerous patterns from a string.
 * Safe for display in JSX (no XSS risk).
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return ''

  let result = input.trim()

  for (const pattern of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, '')
  }

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

/**
 * Sanitize a member name — allow letters, spaces, hyphens, dots, apostrophes.
 * Strips everything else.
 */
export function sanitizeName(input: string): string {
  const clean = sanitizeText(input)
  // Allow: Unicode letters (covers Bengali), spaces, hyphens, dots, apostrophes
  return clean.replace(/[^\p{L}\p{M}\s.\-']/gu, '').trim()
}

/**
 * Sanitize a Bangladeshi mobile number — keep only digits and leading +.
 */
export function sanitizeMobile(input: string): string {
  return input.replace(/[^\d+]/g, '').substring(0, 14)
}

/**
 * Sanitize a bKash TrxID — uppercase alphanumeric only.
 */
export function sanitizeTrxId(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 20)
}

/**
 * Sanitize an address — allow Unicode letters, digits, spaces, common punctuation.
 */
export function sanitizeAddress(input: string): string {
  const clean = sanitizeText(input)
  return clean.substring(0, 500)
}

/**
 * Validate that a string is a valid base64 image data URI.
 * Must start with data:image/jpeg or data:image/png or data:image/webp.
 */
export function isValidImageBase64(input: string): boolean {
  if (!input || typeof input !== 'string') return false
  const validPrefixes = [
    'data:image/jpeg;base64,',
    'data:image/png;base64,',
    'data:image/webp;base64,',
  ]
  const hasValidPrefix = validPrefixes.some((p) => input.startsWith(p))
  if (!hasValidPrefix) return false

  // Extract base64 data and validate format
  const base64Data = input.split(',')[1]
  if (!base64Data) return false

  // Base64 should only contain A-Z, a-z, 0-9, +, /, and = padding
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  if (!base64Regex.test(base64Data)) return false

  // Size check: base64 encodes ~4/3× the binary size
  const estimatedBytes = (base64Data.length * 3) / 4
  const maxBytes = 100 * 1024 // 100KB

  return estimatedBytes <= maxBytes
}

/**
 * Validate payment screenshot base64 (larger limit).
 */
export function isValidScreenshotBase64(input: string): boolean {
  if (!input || typeof input !== 'string') return false
  const validPrefixes = [
    'data:image/jpeg;base64,',
    'data:image/png;base64,',
    'data:image/webp;base64,',
  ]
  const hasValidPrefix = validPrefixes.some((p) => input.startsWith(p))
  if (!hasValidPrefix) return false

  const base64Data = input.split(',')[1]
  if (!base64Data) return false

  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  if (!base64Regex.test(base64Data)) return false

  const estimatedBytes = (base64Data.length * 3) / 4
  const maxBytes = 200 * 1024 // 200KB for screenshots

  return estimatedBytes <= maxBytes
}

/**
 * Sanitize all text fields of a member object before writing to Firestore.
 */
export function sanitizeMemberData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (key === 'profilePhotoBase64') {
      // Validate base64 image
      result[key] = typeof value === 'string' && isValidImageBase64(value) ? value : ''
    } else if (key === 'screenshotBase64') {
      result[key] = typeof value === 'string' && isValidScreenshotBase64(value) ? value : ''
    } else if (key === 'mobile' || key === 'whatsapp' || key === 'bkashSenderNumber') {
      result[key] = typeof value === 'string' ? sanitizeMobile(value) : value
    } else if (key === 'bkashTrxId') {
      result[key] = typeof value === 'string' ? sanitizeTrxId(value) : value
    } else if (key === 'officeAddress') {
      result[key] = typeof value === 'string' ? sanitizeAddress(value) : value
    } else if (typeof value === 'string') {
      result[key] = sanitizeText(value)
    } else {
      result[key] = value
    }
  }

  return result
}