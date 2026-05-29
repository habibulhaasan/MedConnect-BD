'use client'

import { enableIndexedDbPersistence, Firestore } from 'firebase/firestore'
import { logError, logInfo } from '@/lib/utils/errorLogger'

let persistenceEnabled = false

export async function enableOfflinePersistence(db: Firestore): Promise<void> {
  if (persistenceEnabled || typeof window === 'undefined') return

  try {
    await enableIndexedDbPersistence(db)
    persistenceEnabled = true
    logInfo('Firestore offline persistence enabled')
  } catch (err: unknown) {
    const error = err as { code?: string }
    if (error.code === 'failed-precondition') {
      // Multiple tabs open — persistence only works in one tab at a time
      logInfo('Firestore persistence unavailable (multiple tabs open)')
    } else if (error.code === 'unimplemented') {
      // Browser doesn't support IndexedDB
      logInfo('Firestore persistence not supported in this browser')
    } else {
      logError(err instanceof Error ? err : new Error(String(err)), {
        context: 'enableOfflinePersistence',
      })
    }
  }
}