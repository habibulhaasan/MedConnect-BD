import { z } from 'zod'

const bdMobileRegex = /^(\+880|880|0)1[3-9]\d{8}$/

export const step4Schema = z.object({
  method: z.enum(['bkash', 'nagad', 'rocket', 'cash', 'bank']),
  transactionId: z.string().default(''),
  senderNumber: z.string().default(''),
  screenshotBase64: z.string().optional(),
}).refine((data) => {
  if (data.method === 'bkash') {
    return !data.transactionId || (/^[A-Z0-9]+$/.test(data.transactionId) && data.transactionId.length >= 8 && data.transactionId.length <= 12)
  }
  if (data.method === 'nagad' || data.method === 'rocket') {
    return !data.transactionId || /^[0-9]{10,12}$/.test(data.transactionId)
  }
  return true
}, { message: 'errors.invalidTrxId' }).refine((data) => {
  if (['bkash', 'nagad', 'rocket'].includes(data.method)) {
    return !data.senderNumber || bdMobileRegex.test(data.senderNumber)
  }
  return true
}, { message: 'errors.invalidMobile' })

export const paymentSubmissionSchema = z.object({
  method: z.enum(['bkash', 'nagad', 'rocket', 'cash', 'bank']),
  amount: z.number().default(0),
  transactionId: z.string().default(''),
  senderNumber: z.string().default(''),
  screenshotBase64: z.string().optional(),
}).refine((data) => {
  if (data.method === 'bkash') {
    return !data.transactionId || (/^[A-Z0-9]+$/.test(data.transactionId) && data.transactionId.length >= 8 && data.transactionId.length <= 12)
  }
  if (['nagad', 'rocket'].includes(data.method)) {
    return !data.transactionId || /^[0-9]{10,12}$/.test(data.transactionId)
  }
  return true
}, { message: 'errors.invalidTrxId' }).refine((data) => {
  if (['bkash', 'nagad', 'rocket'].includes(data.method)) {
    return !data.senderNumber || bdMobileRegex.test(data.senderNumber)
  }
  return true
}, { message: 'errors.invalidMobile' })

export const adminPaymentActionSchema = z.object({
  paymentId: z.string().min(1),
  uid: z.string().min(1),
  action: z.enum(['verified', 'rejected']),
  adminNote: z.string().max(500).optional(),
})

export type Step4Values = z.infer<typeof step4Schema>
export type Step4InputValues = z.input<typeof step4Schema>
export type PaymentSubmissionInputValues = z.input<typeof paymentSubmissionSchema>
export type PaymentSubmissionValues = z.output<typeof paymentSubmissionSchema>
export type AdminPaymentActionValues = z.infer<typeof adminPaymentActionSchema>