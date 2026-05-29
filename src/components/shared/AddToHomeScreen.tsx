'use client'

import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PROMPT_KEY = 'medconnect-install-prompt'
const VISIT_COUNT_KEY = 'medconnect-visit-count'

export function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem(PROMPT_KEY)
    if (dismissed === 'dismissed') return

    // Increment visit count
    const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? '0') + 1
    localStorage.setItem(VISIT_COUNT_KEY, String(visits))

    // Show after 2nd visit
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (visits >= 2) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () =>
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    localStorage.setItem(PROMPT_KEY, 'dismissed')
    setShowBanner(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_KEY, 'dismissed')
    setShowBanner(false)
  }

  if (!showBanner || isInstalled) return null

  return (
    <div
      role="banner"
      aria-label="Install MedConnect BD"
      className={cn(
        'fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50',
        'bg-white rounded-2xl border border-zinc-200 shadow-xl p-4',
        'animate-in slide-in-from-bottom-4 duration-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">M</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900">
            Install MedConnect BD
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            অ্যাপটি ইনস্টল করুন — Add to Home Screen
          </p>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              <Download size={12} />
              Install
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-lg transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="text-zinc-400 hover:text-zinc-600 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}