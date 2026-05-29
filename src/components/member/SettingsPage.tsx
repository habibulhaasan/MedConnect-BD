'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import {
  Lock,
  Globe,
  Info,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuthStore } from '@/stores/authStore'
import { auth } from '@/lib/firebase/config'
import { db } from '@/lib/firebase/config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { cn } from '@/lib/utils/cn'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'errors.required'),
    newPassword: z
      .string()
      .min(8, 'errors.passwordTooShort')
      .regex(/[A-Z]/, 'errors.passwordNeedsUppercase')
      .regex(/[0-9]/, 'errors.passwordNeedsNumber'),
    confirmPassword: z.string().min(1, 'errors.required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'errors.passwordMismatch',
    path: ['confirmPassword'],
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export function SettingsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { user, member } = useAuthStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeletionSubmitting, setIsDeletionSubmitting] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset: resetForm,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onChangePassword = async (values: ChangePasswordValues) => {
    if (!user?.email) return

    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      )
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, values.newPassword)

      resetForm()
      toast.success(t('settings.passwordChanged'))
    } catch (error) {
      const code = (error as { code?: string }).code ?? ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('currentPassword', {
          message: 'errors.auth/wrong-password',
        })
      } else if (code === 'auth/too-many-requests') {
        toast.error(t('errors.auth/too-many-requests'))
      } else {
        toast.error(t('errors.networkError'))
      }
    }
  }

  const handleRequestDeletion = async () => {
    if (!user?.uid || !member) return
    setIsDeletionSubmitting(true)
    try {
      await setDoc(doc(db, 'deletion_requests', user.uid), {
        uid: user.uid,
        memberName: member.fullName,
        mobile: member.mobile,
        email: member.email ?? '',
        requestedAt: serverTimestamp(),
        status: 'pending',
      })
      setDeleteDialogOpen(false)
      toast.success(t('settings.deletionRequested'))
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setIsDeletionSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-4">
      <PageHeader title={t('nav.settings')} />

      {/* Language */}
      <Card className="border-zinc-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe size={16} className="text-primary-600" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600">{t('settings.languageDesc')}</p>
            <LanguageToggle variant="pill" />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-zinc-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock size={16} className="text-primary-600" />
            {t('settings.security')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit(onChangePassword)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPwd">{t('settings.currentPassword')}</Label>
              <div className="relative">
                <Input
                  id="currentPwd"
                  type={showCurrent ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={cn('pr-10', errors.currentPassword && 'border-destructive')}
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {t(errors.currentPassword.message as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPwd">{t('settings.newPassword')}</Label>
              <div className="relative">
                <Input
                  id="newPwd"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn('pr-10', errors.newPassword && 'border-destructive')}
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {t(errors.newPassword.message as Parameters<typeof t>[0])}
                </p>
              )}
              <p className="text-xs text-zinc-400">{t('auth.passwordHint')}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPwd">{t('auth.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPwd"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={cn('pr-10', errors.confirmPassword && 'border-destructive')}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {t(errors.confirmPassword.message as Parameters<typeof t>[0])}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Lock size={14} />
              )}
              {t('settings.changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-zinc-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info size={16} className="text-primary-600" />
            {t('settings.about')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('settings.appVersion')}</span>
            <span className="font-medium text-zinc-700">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('settings.support')}</span>
            <a
              href="mailto:support@medconnect.bd"
              className="text-primary-600 hover:underline"
            >
              support@medconnect.bd
            </a>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">{t('settings.privacyPolicy')}</span>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              {t('settings.view')}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle size={16} />
            {t('settings.dangerZone')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-800">
                {t('settings.requestDeletion')}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t('settings.requestDeletionDesc')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-red-200 text-destructive hover:bg-red-50 flex-shrink-0 gap-1.5"
            >
              <Trash2 size={13} />
              {t('settings.requestDeletion')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deletion confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={18} />
              {t('settings.requestDeletion')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.deletionConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletionSubmitting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestDeletion}
              disabled={isDeletionSubmitting}
              className="bg-destructive hover:bg-destructive/90 text-white gap-1.5"
            >
              {isDeletionSubmitting && (
                <Loader2 size={13} className="animate-spin" />
              )}
              {t('settings.confirmDeletion')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}