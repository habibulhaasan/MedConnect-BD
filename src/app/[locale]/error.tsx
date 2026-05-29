'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logError } from '@/lib/utils/errorLogger'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('errors')

  useEffect(() => {
    logError(error, { context: 'GlobalErrorBoundary', digest: error.digest })
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertTriangle size={32} className="text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-zinc-900">{t('somethingWentWrong')}</h1>
          <p className="text-sm text-zinc-500">{t('somethingWentWrongDesc')}</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3 text-left">
              <summary className="text-xs text-zinc-400 cursor-pointer">
                {t('errorDetails')}
              </summary>
              <pre className="mt-2 p-3 bg-zinc-100 rounded text-xs overflow-auto max-h-32 text-red-600">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={reset}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white gap-2"
          >
            <RefreshCcw size={15} />
            {t('tryAgain')}
          </Button>
          <Button asChild variant="outline" className="w-full gap-2">
            <Link href="/">
              <Home size={15} />
              {t('goHome')}
            </Link>
          </Button>
          <a
            href={`mailto:support@medconnect.bd?subject=Error Report&body=Error: ${encodeURIComponent(error.message)}`}
            className="text-xs text-zinc-400 hover:text-zinc-600 hover:underline"
          >
            {t('reportError')}
          </a>
        </div>
      </div>
    </div>
  )
}