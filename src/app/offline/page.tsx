'use client'

import { WifiOff, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 max-w-sm w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-2xl">M</span>
          </div>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto">
          <WifiOff size={32} className="text-zinc-400" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-zinc-900">
            You&apos;re Offline
          </h1>
          <p className="text-sm font-bangla text-zinc-600">
            আপনি অফলাইন আছেন
          </p>
          <p className="text-sm text-zinc-500">
            MedConnect BD requires an internet connection to load member data.
            Please check your connection and try again.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full bg-primary-600 hover:bg-primary-700 text-white gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw size={15} />
            Retry Connection
          </Button>
          <p className="text-xs text-zinc-400">
            আবার চেষ্টা করুন
          </p>
        </div>

        {/* Cached content notice */}
        <div className="rounded-xl bg-primary-50 border border-primary-100 p-3">
          <p className="text-xs text-primary-700">
            💡 Some pages may still be available from cache. Try navigating to a
            recently visited page.
          </p>
        </div>
      </div>
    </div>
  )
}