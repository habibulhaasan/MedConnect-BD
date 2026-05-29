import { z } from 'zod'

const bdMobileRegex = /^(\+880|880|0)1[3-9]\d{8}$/

export const step2Schema = z.object({
  division: z.enum(
    ['dhaka', 'chattogram', 'rajshahi', 'khulna', 'barishal', 'sylhet', 'rangpur', 'mymensingh'] as const,
    { error: 'errors.required' }
  ),
  district: z.string().min(1, 'errors.required'),
  upazila: z.string().min(1, 'errors.required'),
  institution: z
    .string()
    .min(2, 'errors.required')
    .max(200, 'errors.tooLong'),
  officeAddress: z
    .string()
    .min(5, 'errors.required')
    .max(300, 'errors.tooLong'),
  whatsapp: z
    .string()
    .regex(bdMobileRegex, 'errors.invalidMobile')
    .optional()
    .or(z.literal('')),
  sameAsMobile: z.boolean(),
})

export const step3Schema = z.object({
  bloodGroup: z.enum(
    ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const,
    { error: 'errors.required' }
  ),
  lastDonateDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        return new Date(val) <= new Date()
      },
      { message: 'errors.futureDateNotAllowed' }
    ),
  profilePhotoBase64: z.string().optional(),
})

export const profileEditSchema = z.object({
  fullName: z.string().min(3, 'errors.required').max(100, 'errors.tooLong'),
  fullNameBn: z.string().min(3, 'errors.required').max(100, 'errors.tooLong'),
  institution: z.string().min(2, 'errors.required').max(200, 'errors.tooLong'),
  officeAddress: z.string().min(5, 'errors.required').max(300, 'errors.tooLong'),
  division: z.enum(
    ['dhaka', 'chattogram', 'rajshahi', 'khulna', 'barishal', 'sylhet', 'rangpur', 'mymensingh'] as const,
    { error: 'errors.required' }
  ),
  district: z.string().min(1, 'errors.required'),
  upazila: z.string().min(1, 'errors.required'),
  mobile: z.string().regex(bdMobileRegex, 'errors.invalidMobile'),
  whatsapp: z
    .string()
    .regex(bdMobileRegex, 'errors.invalidMobile')
    .optional()
    .or(z.literal('')),
  email: z.string().email('errors.invalidEmail').optional().or(z.literal('')),
  bloodGroup: z.enum(
    ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const,
    { error: 'errors.required' }
  ),
  lastDonateDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        return new Date(val) <= new Date()
      },
      { message: 'errors.futureDateNotAllowed' }
    ),
})

export const registerStep2Schema = z.object({
  fullName: z.string().min(3, 'errors.required').max(100, 'errors.tooLong'),
  fullNameBn: z.string().min(3, 'errors.required').max(100, 'errors.tooLong'),
  designation: z.enum(
    ['mt_laboratory', 'mt_dental', 'mt_radiology', 'mt_radiotherapy', 'mt_physiotherapy', 'pharmacist'] as const,
    { error: 'errors.required' }
  ),
  regNumber: z.string().min(1, 'errors.required').max(50, 'errors.tooLong'),
  bloodGroup: z.enum(
    ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const,
    { error: 'errors.required' }
  ),
})

export const registerStep3Schema = z.object({
  mobile: z.string().regex(bdMobileRegex, 'errors.invalidMobile'),
  whatsapp: z
    .string()
    .regex(bdMobileRegex, 'errors.invalidMobile')
    .optional()
    .or(z.literal('')),
  division: z.enum(
    ['dhaka', 'chattogram', 'rajshahi', 'khulna', 'barishal', 'sylhet', 'rangpur', 'mymensingh'] as const,
    { error: 'errors.required' }
  ),
  district: z.string().min(1, 'errors.required'),
  upazila: z.string().min(1, 'errors.required'),
  institution: z.string().min(2, 'errors.required').max(200, 'errors.tooLong'),
  officeAddress: z.string().min(5, 'errors.required').max(300, 'errors.tooLong'),
})

export type Step2Values = z.infer<typeof step2Schema>
export type Step3Values = z.infer<typeof step3Schema>
export type ProfileEditValues = z.infer<typeof profileEditSchema>
export type RegisterStep2Values = z.infer<typeof registerStep2Schema>
export type RegisterStep3Values = z.infer<typeof registerStep3Schema>