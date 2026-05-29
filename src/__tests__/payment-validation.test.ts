import { step4Schema } from '@/lib/validations/payment'

describe('step4Schema (payment)', () => {
  const validData = {
    bkashTrxId: 'AB12345678',
    bkashSenderNumber: '01712345678',
  }

  it('accepts valid TrxID and sender number', () => {
    expect(() => step4Schema.parse(validData)).not.toThrow()
  })

  it('rejects TrxID shorter than 8 chars', () => {
    expect(() =>
      step4Schema.parse({ ...validData, bkashTrxId: 'AB123' })
    ).toThrow()
  })

  it('rejects TrxID longer than 12 chars', () => {
    expect(() =>
      step4Schema.parse({ ...validData, bkashTrxId: 'AB123456789012' })
    ).toThrow()
  })

  it('rejects lowercase TrxID', () => {
    expect(() =>
      step4Schema.parse({ ...validData, bkashTrxId: 'ab12345678' })
    ).toThrow()
  })

  it('rejects TrxID with special characters', () => {
    expect(() =>
      step4Schema.parse({ ...validData, bkashTrxId: 'AB!234567' })
    ).toThrow()
  })

  it('rejects invalid BD mobile number', () => {
    expect(() =>
      step4Schema.parse({ ...validData, bkashSenderNumber: '12345678901' })
    ).toThrow()
  })

  it('accepts +880 prefix mobile number', () => {
    expect(() =>
      step4Schema.parse({ ...validData, bkashSenderNumber: '+8801712345678' })
    ).not.toThrow()
  })
})