import { z } from 'zod'

const bdMobileRegex = /^(\+880|880|0)1[3-9]\d{8}$/

export const step4Schema = z.object({
  bkashTrxId: z
    .string()
    .min(1, 'errors.required')
    .min(8, 'errors.invalidTrxId')
    .max(12, 'errors.invalidTrxId')
    .regex(/^[A-Z0-9]+$/, 'errors.invalidTrxIdFormat'),
  bkashSenderNumber: z
    .string()
    .min(1, 'errors.required')
    .regex(bdMobileRegex, 'errors.invalidMobile'),
  screenshotBase64: z.string().optional(),
})

export const adminPaymentActionSchema = z.object({
  paymentId: z.string().min(1),
  uid: z.string().min(1),
  action: z.enum(['verified', 'rejected']),
  adminNote: z.string().max(500).optional(),
})

export type Step4Values = z.infer<typeof step4Schema>
export type AdminPaymentActionValues = z.infer<typeof adminPaymentActionSchema>