'use client'

import React from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { logError } from '@/lib/utils/errorLogger'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  context?: string
}

export class ErrorBoundary extends React.Component
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, {
      context: this.props.context ?? 'ErrorBoundary',
      componentStack: info.componentStack ?? '',
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800">
              Something went wrong
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-red-500 mt-1 font-mono">
                {this.state.error?.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
          >
            <RefreshCcw size={13} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for simpler use
interface WithErrorBoundaryProps {
  children: React.ReactNode
  context?: string
  fallback?: React.ReactNode
}

export function WithErrorBoundary({
  children,
  context,
  fallback,
}: WithErrorBoundaryProps) {
  return (
    <ErrorBoundary context={context} fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}