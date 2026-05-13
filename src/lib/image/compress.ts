import imageCompression from 'browser-image-compression'

const MAX_PROFILE_BYTES = 100 * 1024   // 100KB hard limit
const MAX_SCREENSHOT_BYTES = 150 * 1024 // 150KB hard limit

// ─── Profile Photo ─────────────────────────────────────────────────────────

export async function compressProfilePhoto(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 200,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })

  // Draw to canvas for final quality control
  const base64 = await canvasCompress(compressed, 200, 200, 0.7)

  const byteLength = getBase64ByteLength(base64)
  if (byteLength > MAX_PROFILE_BYTES) {
    throw new Error('IMAGE_TOO_LARGE_PROFILE')
  }

  return base64
}

// ─── Payment Screenshot ────────────────────────────────────────────────────

export async function compressPaymentScreenshot(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })

  const base64 = await canvasCompress(compressed, 800, 800, 0.75)

  const byteLength = getBase64ByteLength(base64)
  if (byteLength > MAX_SCREENSHOT_BYTES) {
    throw new Error('IMAGE_TOO_LARGE_SCREENSHOT')
  }

  return base64
}

// ─── Canvas Resize Helper ──────────────────────────────────────────────────

function canvasCompress(
  file: File | Blob,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('CANVAS_CONTEXT_UNAVAILABLE'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL('image/jpeg', quality)
      resolve(base64)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('IMAGE_LOAD_FAILED'))
    }

    img.src = url
  })
}

// ─── Byte Size Calculator ──────────────────────────────────────────────────

function getBase64ByteLength(base64: string): number {
  // Remove data URL prefix if present: "data:image/jpeg;base64,"
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64
  const padding = (base64Data.match(/=/g) ?? []).length
  return (base64Data.length * 3) / 4 - padding
}