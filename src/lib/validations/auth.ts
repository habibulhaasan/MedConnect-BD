import { z } from 'zod'

const bdMobileRegex = /^(\+880|880|0)1[3-9]\d{8}$/

export const step1Schema = z
  .object({
    fullName: z
      .string()
      .min(3, 'errors.required')
      .max(100, 'errors.tooLong')
      .regex(/^[a-zA-Z\s.'-]+$/, 'errors.invalidName'),
    fullNameBn: z
      .string()
      .min(3, 'errors.required')
      .max(100, 'errors.tooLong'),
    designation: z.enum(
      [
        'mt_laboratory',
        'mt_dental',
        'mt_radiology',
        'mt_radiotherapy',
        'mt_physiotherapy',
        'pharmacist',
      ] as const,
      { error: 'errors.required' }
    ),
    regNumber: z
      .string()
      .min(1, 'errors.required')
      .max(50, 'errors.tooLong'),
    mobile: z
      .string()
      .regex(bdMobileRegex, 'errors.invalidMobile'),
    email: z
      .string()
      .email('errors.invalidEmail')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'errors.passwordTooShort')
      .regex(/[A-Z]/, 'errors.passwordNeedsUppercase')
      .regex(/[0-9]/, 'errors.passwordNeedsNumber'),
    confirmPassword: z.string().min(1, 'errors.required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'errors.passwordMismatch',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.invalidEmail'),
  password: z.string().min(1, 'errors.required'),
})

export const passwordResetSchema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.invalidEmail'),
})

export const registerStep1Schema = z
  .object({
    email: z.string().min(1, 'errors.required').email('errors.invalidEmail'),
    password: z
      .string()
      .min(8, 'errors.passwordTooShort')
      .regex(/[A-Z]/, 'errors.passwordNeedsUppercase')
      .regex(/[0-9]/, 'errors.passwordNeedsNumber'),
    confirmPassword: z.string().min(1, 'errors.required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'errors.passwordMismatch',
    path: ['confirmPassword'],
  })

export type Step1Values = z.infer<typeof step1Schema>
export type LoginValues = z.infer<typeof loginSchema>
export type PasswordResetValues = z.infer<typeof passwordResetSchema>
export type RegisterStep1Values = z.infer<typeof registerStep1Schema>