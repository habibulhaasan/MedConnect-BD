import { z } from 'zod'

export const registerStep2Schema = z.object({
  fullName: z
    .string()
    .min(3, 'errors.required')
    .max(100, 'errors.tooLong'),
  fullNameBn: z
    .string()
    .min(3, 'errors.required')
    .max(100, 'errors.tooLong'),
  designation: z.enum([
    'mt_laboratory',
    'mt_dental',
    'mt_radiology',
    'mt_radiotherapy',
    'mt_physiotherapy',
    'pharmacist',
  ], { required_error: 'errors.required' }),
  regNumber: z
    .string()
    .min(1, 'errors.required')
    .max(50, 'errors.tooLong'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    required_error: 'errors.required',
  }),
})

export const registerStep3Schema = z.object({
  mobile: z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'errors.invalidMobile'),
  whatsapp: z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'errors.invalidMobile')
    .optional()
    .or(z.literal('')),
  division: z.enum([
    'dhaka', 'chattogram', 'rajshahi', 'khulna',
    'barishal', 'sylhet', 'rangpur', 'mymensingh',
  ], { required_error: 'errors.required' }),
  district: z.string().min(1, 'errors.required'),
  upazila: z.string().min(1, 'errors.required'),
  institution: z.string().min(2, 'errors.required').max(200, 'errors.tooLong'),
  officeAddress: z.string().min(5, 'errors.required').max(500, 'errors.tooLong'),
})

export const profileEditSchema = z.object({
  fullName: z.string().min(3, 'errors.required').max(100, 'errors.tooLong'),
  fullNameBn: z.string().min(3, 'errors.required').max(100, 'errors.tooLong'),
  institution: z.string().min(2, 'errors.required').max(200, 'errors.tooLong'),
  officeAddress: z.string().min(5, 'errors.required').max(500, 'errors.tooLong'),
  division: z.enum([
    'dhaka', 'chattogram', 'rajshahi', 'khulna',
    'barishal', 'sylhet', 'rangpur', 'mymensingh',
  ], { required_error: 'errors.required' }),
  district: z.string().min(1, 'errors.required'),
  upazila: z.string().min(1, 'errors.required'),
  mobile: z.string().regex(/^01[3-9]\d{8}$/, 'errors.invalidMobile'),
  whatsapp: z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'errors.invalidMobile')
    .optional()
    .or(z.literal('')),
  email: z.string().email('errors.invalidEmail').optional().or(z.literal('')),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    required_error: 'errors.required',
  }),
  lastDonateDate: z.string().optional(),
})

export type RegisterStep2Values = z.infer<typeof registerStep2Schema>
export type RegisterStep3Values = z.infer<typeof registerStep3Schema>
export type ProfileEditValues = z.infer<typeof profileEditSchema>