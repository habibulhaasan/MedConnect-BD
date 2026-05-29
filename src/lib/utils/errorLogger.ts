interface ErrorContext {
  context?: string
  digest?: string
  componentStack?: string
  uid?: string
  [key: string]: unknown
}

export function logError(error: Error, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔴 [MedConnect Error]')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    if (context) console.error('Context:', context)
    console.groupEnd()
    return
  }

  // Production: structured log for Vercel / external services
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'), // limit stack depth
      context,
      env: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  )

  // Extension point: plug in Sentry, LogRocket, etc.
  // Example Sentry integration (uncomment when Sentry is installed):
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context })
  // }
}

export function logWarning(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ [MedConnect Warning]', message, context)
  }
}

export function logInfo(message: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.info('ℹ️ [MedConnect]', message, data)
  }
}