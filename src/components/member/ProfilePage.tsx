'use client'

import { useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Pencil,
  X,
  Save,
  Phone,
  Share2,
  Lock,
  MapPin,
  Building2,
  Droplets,
  Calendar,
  Copy,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProfileAvatar } from '@/components/shared/ProfileAvatar'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import { DesignationBadge } from '@/components/shared/DesignationBadge'
import { BloodGroupBadge } from '@/components/shared/BloodGroupBadge'
import { ContactActions } from '@/components/shared/ContactActions'
import { CopyButton } from '@/components/shared/CopyButton'
import { PageHeader } from '@/components/shared/PageHeader'
import { profileEditSchema, type ProfileEditValues } from '@/lib/validations/member'
import { useMember } from '@/hooks/useMember'
import { useAuthStore } from '@/stores/authStore'
import { getDistrictsByDivisionSlug } from '@/lib/utils/bd-data'
import { compressProfilePhoto } from '@/lib/image/compress'
import { formatDate } from '@/lib/utils/format'
import { ALL_BLOOD_GROUPS, ALL_DIVISIONS } from '@/types'
import type { BloodGroup, Division } from '@/types'
import { cn } from '@/lib/utils/cn'
import { format } from 'date-fns'

export function ProfilePage() {
  const t = useTranslations()
  const locale = useLocale()
  const { member } = useAuthStore()
  const { updateProfile, isUpdating } = useMember()
  const [isEditing, setIsEditing] = useState(false)
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(
    member?.profilePhotoBase64
  )
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false)
  const [selectedDivisionId, setSelectedDivisionId] = useState(member?.division ?? '')
  const [selectedDistrictId, setSelectedDistrictId] = useState(member?.district ?? '')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const today = format(new Date(), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: member
      ? {
          fullName: member.fullName,
          fullNameBn: member.fullNameBn,
          institution: member.institution,
          officeAddress: member.officeAddress,
          division: member.division,
          district: member.district,
          upazila: member.upazila,
          mobile: member.mobile,
          whatsapp: member.whatsapp ?? '',
          email: member.email ?? '',
          bloodGroup: member.bloodGroup,
          lastDonateDate: member.lastDonateDate ?? '',
        }
      : undefined,
  })

  const divisionDistricts = selectedDivisionId
    ? getDistrictsByDivisionSlug(selectedDivisionId as Division)
    : []
  const currentDistrict = divisionDistricts.find((d) => d.id === selectedDistrictId)

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error(t('errors.invalidImageType'))
      return
    }
    setIsCompressingPhoto(true)
    try {
      const base64 = await compressProfilePhoto(file)
      setPhotoBase64(base64)
    } catch (err) {
      toast.error(
        err instanceof Error && err.message === 'IMAGE_TOO_LARGE_PROFILE'
          ? t('errors.imageTooLargeProfile')
          : t('errors.imageLoadFailed')
      )
    } finally {
      setIsCompressingPhoto(false)
      e.target.value = ''
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setPhotoBase64(member?.profilePhotoBase64)
    setSelectedDivisionId(member?.division ?? '')
    setSelectedDistrictId(member?.district ?? '')
    reset()
  }

  const onSave = async (values: ProfileEditValues) => {
    try {
      await updateProfile({
        ...values,
        whatsapp: values.whatsapp || '',
        email: values.email || '',
        lastDonateDate: values.lastDonateDate || '',
        profilePhotoBase64: photoBase64 ?? '',
      })
      setIsEditing(false)
      toast.success(t('profile.saved'))
    } catch {
      toast.error(t('errors.networkError'))
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/members`
    if (navigator.share) {
      try {
        await navigator.share({
          title: member?.fullName,
          text: `${member?.fullName} — MedConnect BD`,
          url,
        })
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success(t('common.copied'))
    }
  }

  if (!member) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-4">
      <PageHeader
        title={isEditing ? t('profile.editTitle') : t('profile.title')}
        action={
          !isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-1.5"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">{t('home.shareProfile')}</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5 bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Pencil size={14} />
                {t('common.edit')}
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* ── View mode ── */}
      {!isEditing && (
        <div className="space-y-4">
          {/* Identity card */}
          <Card className="border-zinc-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <ProfileAvatar
                  base64={member.profilePhotoBase64}
                  name={member.fullName}
                  size="xl"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-zinc-900 leading-tight">
                    {member.fullName}
                  </h2>
                  {member.isVerified && <VerifiedBadge size={20} />}
                </div>

                {member.fullNameBn && (
                  <p className="text-sm font-medium text-zinc-600 font-bangla">
                    {member.fullNameBn}
                  </p>
                )}

                <DesignationBadge designation={member.designation} />

                <div className="flex items-center gap-2 mt-1">
                  <Lock size={12} className="text-zinc-400" />
                  <span className="text-xs text-zinc-500">{member.regNumber}</span>
                  <CopyButton text={member.regNumber} size={12} />
                </div>
              </div>
            </div>

            <Separator />

            <CardContent className="p-4 space-y-4">
              {/* Contact */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  {t('profile.contactInfo')}
                </h3>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone size={15} className="text-zinc-400 flex-shrink-0" />
                    <span className="text-sm text-zinc-700">{member.mobile}</span>
                    <CopyButton text={member.mobile} size={13} />
                  </div>
                  <ContactActions
                    mobile={member.mobile}
                    whatsapp={member.whatsapp}
                    email={member.email}
                    name={member.fullName}
                    size="sm"
                  />
                </div>

                {member.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 w-4 text-center">@</span>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-sm text-primary-600 hover:underline truncate"
                    >
                      {member.email}
                    </a>
                  </div>
                )}
              </div>

              <Separator />

              {/* Location */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  {t('profile.locationInfo')}
                </h3>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-zinc-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-600">
                    {t(`divisions.${member.division}` as Parameters<typeof t>[0])}
                    {' › '}
                    {member.district}
                    {' › '}
                    {member.upazila}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 size={14} className="text-zinc-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-700">{member.institution}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{member.officeAddress}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medical info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  {t('profile.professionalInfo')}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Droplets size={14} className="text-zinc-400" />
                    <BloodGroupBadge bloodGroup={member.bloodGroup} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-zinc-400" />
                    <span className="text-xs text-zinc-600">
                      {member.lastDonateDate
                        ? formatDate(member.lastDonateDate, locale as 'en' | 'bn')
                        : t('profile.neverDonated')}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Member since */}
              <p className="text-xs text-zinc-400">
                {t('profile.memberSince')}{' '}
                {formatDate(member.joinedAt, locale as 'en' | 'bn')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Edit mode ── */}
      {isEditing && (
        <form onSubmit={handleSubmit(onSave)} noValidate>
          <Card className="border-zinc-100">
            <CardContent className="p-5 space-y-5">
              {/* Photo edit */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative group">
                  <ProfileAvatar
                    base64={photoBase64}
                    name={member.fullName}
                    size="xl"
                  />

                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isCompressingPhoto}
                    aria-label={t('profile.uploadPhoto')}
                    className={cn(
                      'absolute inset-0 rounded-full flex items-center justify-center',
                      'bg-black/0 group-hover:bg-black/40 transition-all',
                      'focus-visible:bg-black/40 focus-visible:outline-none'
                    )}
                  >
                    {isCompressingPhoto ? (
                      <Loader2 size={20} className="text-white animate-spin" />
                    ) : (
                      <Pencil
                        size={20}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isCompressingPhoto}
                  className="text-xs text-primary-600 hover:underline"
                >
                  {t('profile.uploadPhoto')}
                </button>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              <Separator />

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-fullName">
                    {t('registration.labels.fullName')}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="edit-fullName"
                    className={cn(errors.fullName && 'border-destructive')}
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">
                      {t(errors.fullName.message as Parameters<typeof t>[0])}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-fullNameBn">
                    {t('registration.labels.fullNameBn')}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="edit-fullNameBn"
                    lang="bn"
                    className={cn('font-bangla', errors.fullNameBn && 'border-destructive')}
                    {...register('fullNameBn')}
                  />
                  {errors.fullNameBn && (
                    <p className="text-xs text-destructive">
                      {t(errors.fullNameBn.message as Parameters<typeof t>[0])}
                    </p>
                  )}
                </div>
              </div>

              {/* Read-only reg number */}
              <div className="space-y-1.5">
                <Label>{t('profile.regNumber')}</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-50 border border-zinc-200">
                  <Lock size={13} className="text-zinc-400" />
                  <span className="text-sm text-zinc-500">{member.regNumber}</span>
                  <span className="text-xs text-zinc-400 ml-auto">
                    {t('profile.regNumberReadOnly')}
                  </span>
                </div>
              </div>

              {/* Mobile + WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-mobile">
                    {t('registration.labels.mobile')}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="edit-mobile"
                    type="tel"
                    className={cn(errors.mobile && 'border-destructive')}
                    {...register('mobile')}
                  />
                  {errors.mobile && (
                    <p className="text-xs text-destructive">
                      {t(errors.mobile.message as Parameters<typeof t>[0])}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-whatsapp">
                    {t('registration.labels.whatsapp')}
                    <span className="text-zinc-400 text-xs ml-1">({t('common.optional')})</span>
                  </Label>
                  <Input
                    id="edit-whatsapp"
                    type="tel"
                    className={cn(errors.whatsapp && 'border-destructive')}
                    {...register('whatsapp')}
                  />
                </div>
              </div>

              {/* Email with note */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">
                  {t('registration.labels.email')}
                  <span className="text-zinc-400 text-xs ml-1">({t('common.optional')})</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  className={cn(errors.email && 'border-destructive')}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {t(errors.email.message as Parameters<typeof t>[0])}
                  </p>
                )}
              </div>

              <Separator />

              {/* Division / District / Upazila */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-700">
                  {t('profile.locationInfo')}
                </h3>

                <div className="space-y-1.5">
                  <Label>{t('registration.labels.division')}<span className="text-destructive ml-0.5">*</span></Label>
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
                        <SelectTrigger className={cn(errors.division && 'border-destructive')}>
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t('registration.labels.district')}<span className="text-destructive ml-0.5">*</span></Label>
                    <Controller
                      name="district"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          disabled={!selectedDivisionId}
                          onValueChange={(v) => {
                            field.onChange(v)
                            setSelectedDistrictId(v)
                            setValue('upazila', '')
                          }}
                        >
                          <SelectTrigger className={cn(errors.district && 'border-destructive')}>
                            <SelectValue placeholder={t('registration.selectDistrict')} />
                          </SelectTrigger>
                          <SelectContent>
                            {divisionDistricts.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t('registration.labels.upazila')}<span className="text-destructive ml-0.5">*</span></Label>
                    <Controller
                      name="upazila"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          disabled={!currentDistrict}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className={cn(errors.upazila && 'border-destructive')}>
                            <SelectValue placeholder={t('registration.selectUpazila')} />
                          </SelectTrigger>
                          <SelectContent>
                            {(currentDistrict?.upazilas ?? []).map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Institution + Address */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-institution">
                    {t('registration.labels.institution')}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Input
                    id="edit-institution"
                    className={cn(errors.institution && 'border-destructive')}
                    {...register('institution')}
                  />
                  {errors.institution && (
                    <p className="text-xs text-destructive">
                      {t(errors.institution.message as Parameters<typeof t>[0])}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-officeAddress">
                    {t('registration.labels.officeAddress')}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Textarea
                    id="edit-officeAddress"
                    rows={3}
                    maxLength={300}
                    className={cn('resize-none', errors.officeAddress && 'border-destructive')}
                    {...register('officeAddress')}
                  />
                  {errors.officeAddress && (
                    <p className="text-xs text-destructive">
                      {t(errors.officeAddress.message as Parameters<typeof t>[0])}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Blood group + Last donation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    {t('registration.labels.bloodGroup')}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Controller
                    name="bloodGroup"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as BloodGroup)}
                      >
                        <SelectTrigger className={cn(errors.bloodGroup && 'border-destructive')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_BLOOD_GROUPS.map((bg) => (
                            <SelectItem key={bg} value={bg}>
                              {bg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-lastDonateDate">
                    {t('profile.lastDonate')}
                    <span className="text-zinc-400 text-xs ml-1">({t('common.optional')})</span>
                  </Label>
                  <input
                    id="edit-lastDonateDate"
                    type="date"
                    max={today}
                    className={cn(
                      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
                      'text-sm ring-offset-background',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      errors.lastDonateDate && 'border-destructive'
                    )}
                    {...register('lastDonateDate')}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="flex-1 gap-1.5"
                >
                  <X size={14} />
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating || isCompressingPhoto}
                  className="flex-1 gap-1.5 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {t('profile.saving')}
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      {t('profile.save')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}