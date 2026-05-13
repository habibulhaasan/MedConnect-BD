import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.invalidEmail'),
  password: z.string().min(6, 'errors.passwordTooShort'),
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

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'errors.required').email('errors.invalidEmail'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterStep1Values = z.infer<typeof registerStep1Schema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>