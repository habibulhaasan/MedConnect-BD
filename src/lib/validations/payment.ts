import { z } from 'zod'

export const paymentSubmissionSchema = z.object({
  bkashTrxId: z
    .string()
    .min(8, 'errors.invalidTrxId')
    .max(20, 'errors.invalidTrxId')
    .regex(/^[A-Z0-9]+$/, 'errors.invalidTrxIdFormat'),
  bkashSenderNumber: z
    .string()
    .regex(/^01[3-9]\d{8}$/, 'errors.invalidMobile'),
  amount: z.number().positive('errors.required'),
})

export type PaymentSubmissionValues = z.infer<typeof paymentSubmissionSchema>