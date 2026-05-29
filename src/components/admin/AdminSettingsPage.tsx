'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'
import { Save, Loader2, Plus, Trash2, Eye, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { updateAppConfig, getAppConfig } from '@/lib/firebase/firestore'
import { adminApi } from '@/lib/firebase/admin-api'
import { useAppConfig } from '@/hooks/useAppConfig'
import type { AppConfig } from '@/types'
import { cn } from '@/lib/utils/cn'

const settingsSchema = z.object({
  registrationFee: z.number().min(1).max(10000),
  adminBkashNumber: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid mobile number'),
  adminBkashAccountName: z.string().min(2),
  announcementEnabled: z.boolean(),
  announcementTextEn: z.string().max(500),
  announcementTextBn: z.string().max(500),
})

type SettingsValues = z.infer<typeof settingsSchema>

export function AdminSettingsPage() {
  const t = useTranslations()
  const locale = useLocale()
  const { config, refetch } = useAppConfig()
  const [isSaving, setIsSaving] = useState(false)
  const [newAdminUid, setNewAdminUid] = useState('')
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [removeAdminUid, setRemoveAdminUid] = useState('')
  const [adminUids, setAdminUids] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      registrationFee: 500,
      adminBkashNumber: '',
      adminBkashAccountName: '',
      announcementEnabled: false,
      announcementTextEn: '',
      announcementTextBn: '',
    },
  })

  useEffect(() => {
    if (config) {
      reset({
        registrationFee: config.registrationFee,
        adminBkashNumber: config.adminBkashNumber,
        adminBkashAccountName: config.adminBkashAccountName,
        announcementEnabled: config.announcementEnabled,
        announcementTextEn: config.announcementTextEn,
        announcementTextBn: config.announcementTextBn,
      })
    }
  }, [config, reset])

  const announcementEnabled = watch('announcementEnabled')
  const announcementTextEn = watch('announcementTextEn')
  const announcementTextBn = watch('announcementTextBn')

  const onSaveSettings = async (values: SettingsValues) => {
    setIsSaving(true)
    try {
      await updateAppConfig(values)
      await refetch()
      toast.success(t('admin.settingsSaved'))
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdminUid.trim()) return
    setIsAddingAdmin(true)
    try {
      await adminApi.setAdminClaim(newAdminUid.trim(), true)
      setAdminUids((prev) => [...prev, newAdminUid.trim()])
      setNewAdminUid('')
      toast.success(t('admin.adminAdded'))
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const handleRemoveAdmin = async (uid: string) => {
    try {
      await adminApi.setAdminClaim(uid, false)
      setAdminUids((prev) => prev.filter((id) => id !== uid))
      setRemoveAdminUid('')
      toast.success(t('admin.adminRemoved'))
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t('admin.settings')}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{t('admin.settingsSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSaveSettings)} noValidate className="space-y-5">
        {/* Payment config */}
        <Card className="border-zinc-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('admin.paymentConfig')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fee">{t('admin.registrationFee')} (৳)</Label>
              <Input
                id="fee"
                type="number"
                min={1}
                className={cn(errors.registrationFee && 'border-destructive')}
                {...register('registrationFee', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bkashNum">{t('admin.bkashNumber')}</Label>
              <Input
                id="bkashNum"
                type="tel"
                placeholder="01XXXXXXXXX"
                className={cn(errors.adminBkashNumber && 'border-destructive')}
                {...register('adminBkashNumber')}
              />
              {errors.adminBkashNumber && (
                <p className="text-xs text-destructive">{errors.adminBkashNumber.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bkashName">{t('admin.bkashName')}</Label>
              <Input
                id="bkashName"
                className={cn(errors.adminBkashAccountName && 'border-destructive')}
                {...register('adminBkashAccountName')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Announcement */}
        <Card className="border-zinc-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('admin.announcement')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-primary-600"
                {...register('announcementEnabled')}
              />
              <span className="text-sm font-medium text-zinc-700">
                {t('admin.enableAnnouncement')}
              </span>
            </label>

            <div className="space-y-1.5">
              <Label htmlFor="annEn">{t('admin.announcementEn')}</Label>
              <Textarea
                id="annEn"
                rows={2}
                maxLength={500}
                className="resize-none"
                {...register('announcementTextEn')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="annBn">{t('admin.announcementBn')}</Label>
              <Textarea
                id="annBn"
                rows={2}
                maxLength={500}
                className="resize-none font-bangla"
                {...register('announcementTextBn')}
              />
            </div>

            {/* Preview */}
            {announcementEnabled && (announcementTextEn || announcementTextBn) && (
              <div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                  <Eye size={12} />
                  {t('admin.preview')}
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                  <p className="text-sm text-amber-800">
                    {locale === 'bn' ? announcementTextBn : announcementTextEn}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-primary-600 hover:bg-primary-700 text-white gap-1.5"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {t('admin.saveSettings')}
        </Button>
      </form>

      <Separator />

      {/* Admin users management */}
      <Card className="border-zinc-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={16} className="text-primary-600" />
            {t('admin.adminUsers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add admin */}
          <div className="space-y-1.5">
            <Label>{t('admin.addAdmin')}</Label>
            <div className="flex gap-2">
              <Input
                value={newAdminUid}
                onChange={(e) => setNewAdminUid(e.target.value)}
                placeholder={t('admin.enterFirebaseUid')}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                onClick={handleAddAdmin}
                disabled={isAddingAdmin || !newAdminUid.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white gap-1 flex-shrink-0"
              >
                {isAddingAdmin ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                {t('common.save')}
              </Button>
            </div>
            <p className="text-xs text-zinc-400">{t('admin.addAdminHint')}</p>
          </div>

          {/* Admin UID list */}
          {adminUids.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500">{t('admin.currentAdmins')}</p>
              {adminUids.map((uid) => (
                <div
                  key={uid}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-100"
                >
                  <span className="text-xs font-mono text-zinc-600 truncate">{uid}</span>
                  <button
                    type="button"
                    onClick={() => setRemoveAdminUid(uid)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                    aria-label={`Remove admin ${uid}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove admin confirmation */}
      <AlertDialog open={!!removeAdminUid} onOpenChange={() => setRemoveAdminUid('')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.removeAdmin')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.removeAdminDesc', { uid: removeAdminUid })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveAdmin(removeAdminUid)}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {t('admin.confirmRemoveAdmin')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}