'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { adminApi } from '@/lib/firebase/admin-api'
import { ALL_DESIGNATIONS, ALL_BLOOD_GROUPS, ALL_DIVISIONS } from '@/types'
import type { Member, Designation, BloodGroup, Division, MemberStatus } from '@/types'
import { BD_DIVISIONS } from '@/lib/utils/bd-data'
import { cn } from '@/lib/utils/cn'

const editSchema = z.object({
  fullName: z.string().min(2),
  fullNameBn: z.string().min(2),
  designation: z.enum([
    'mt_laboratory', 'mt_dental', 'mt_radiology',
    'mt_radiotherapy', 'mt_physiotherapy', 'pharmacist',
  ]),
  regNumber: z.string().min(1),
  mobile: z.string().min(10),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  institution: z.string().min(2),
  officeAddress: z.string().min(5),
  division: z.enum([
    'dhaka', 'chattogram', 'rajshahi', 'khulna',
    'barishal', 'sylhet', 'rangpur', 'mymensingh',
  ]),
  district: z.string().min(1),
  upazila: z.string().min(1),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  status: z.enum(['pending_payment', 'pending_approval', 'active', 'suspended']),
  lastDonateDate: z.string().optional(),
})

type EditValues = z.infer<typeof editSchema>

const STATUSES: MemberStatus[] = ['pending_payment', 'pending_approval', 'active', 'suspended']

interface EditMemberModalProps {
  open: boolean
  member: Member | null
  onClose: () => void
  onSaved: () => void
}

export function EditMemberModal({
  open,
  member,
  onClose,
  onSaved,
}: EditMemberModalProps) {
  const t = useTranslations()
  const [selectedDivisionId, setSelectedDivisionId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
  })

  useEffect(() => {
    if (member) {
      reset({
        fullName: member.fullName,
        fullNameBn: member.fullNameBn,
        designation: member.designation,
        regNumber: member.regNumber,
        mobile: member.mobile,
        whatsapp: member.whatsapp ?? '',
        email: member.email ?? '',
        institution: member.institution,
        officeAddress: member.officeAddress,
        division: member.division,
        district: member.district,
        upazila: member.upazila,
        bloodGroup: member.bloodGroup,
        status: member.status,
        lastDonateDate: member.lastDonateDate ?? '',
      })
      setSelectedDivisionId(member.division)
      setSelectedDistrictId(member.district)
    }
  }, [member, reset])

  const currentDivision = BD_DIVISIONS.find((d) => d.id === selectedDivisionId)
  const currentDistrict = currentDivision?.districts.find((d) => d.id === selectedDistrictId)

  const onSubmit = async (values: EditValues) => {
    if (!member) return
    setIsSaving(true)
    try {
      await adminApi.updateMember(member.uid, {
        ...values,
        whatsapp: values.whatsapp || '',
        email: values.email || '',
        lastDonateDate: values.lastDonateDate || '',
        isVerified: values.status === 'active',
      })
      toast.success(t('admin.memberUpdated'))
      onSaved()
      onClose()
    } catch {
      toast.error(t('errors.networkError'))
    } finally {
      setIsSaving(false)
    }
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('admin.editMember')}: {member.fullName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Status (admin can change any status) */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 space-y-2">
            <Label className="text-sm font-semibold text-amber-800">
              {t('common.status')}
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as MemberStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`status.${s}` as Parameters<typeof t>[0])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Separator />

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('registration.labels.fullName')}</Label>
              <Input {...register('fullName')} className={cn(errors.fullName && 'border-destructive')} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('registration.labels.fullNameBn')}</Label>
              <Input {...register('fullNameBn')} className={cn('font-bangla', errors.fullNameBn && 'border-destructive')} />
            </div>
          </div>

          {/* Designation + RegNumber */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('registration.labels.designation')}</Label>
              <Controller
                name="designation"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v as Designation)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_DESIGNATIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {t(`designations.${d}` as Parameters<typeof t>[0])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('profile.regNumber')}</Label>
              <Input {...register('regNumber')} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('registration.labels.mobile')}</Label>
              <Input {...register('mobile')} type="tel" />
            </div>
            <div className="space-y-1.5">
              <Label>{t('registration.labels.whatsapp')}</Label>
              <Input {...register('whatsapp')} type="tel" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('registration.labels.email')}</Label>
            <Input {...register('email')} type="email" />
          </div>

          <Separator />

          {/* Location */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>{t('registration.labels.division')}</Label>
              <Controller
                name="division"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v as Division)
                      setSelectedDivisionId(v)
                      setSelectedDistrictId('')
                      setValue('district', '')
                      setValue('upazila', '')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_DIVISIONS.map((div) => (
                        <SelectItem key={div} value={div}>
                          {t(`divisions.${div}` as Parameters<typeof t>[0])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('registration.labels.district')}</Label>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    disabled={!currentDivision}
                    onValueChange={(v) => {
                      field.onChange(v)
                      setSelectedDistrictId(v)
                      setValue('upazila', '')
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(currentDivision?.districts ?? []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t('registration.labels.upazila')}</Label>
              <Controller
                name="upazila"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    disabled={!currentDistrict}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(currentDistrict?.upazilas ?? []).map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('registration.labels.institution')}</Label>
            <Input {...register('institution')} />
          </div>

          <div className="space-y-1.5">
            <Label>{t('registration.labels.officeAddress')}</Label>
            <Textarea {...register('officeAddress')} rows={2} className="resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('registration.labels.bloodGroup')}</Label>
              <Controller
                name="bloodGroup"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v as BloodGroup)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('profile.lastDonate')}</Label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('lastDonateDate')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white gap-1.5"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}