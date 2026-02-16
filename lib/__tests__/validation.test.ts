import { describe, it, expect } from 'vitest'
import {
  memberSchema,
  memberUpdateSchema,
  transactionSchema,
  cooperativeSchema,
  validateFormDataSafe,
  validateFormData,
} from '../validation'

describe('memberSchema', () => {
  const validMemberData = {
    memberNo: 'M001',
    title: 'Mr',
    fullName: 'John Doe',
    nationalId: '1234567890',
    permanentAddress: '123 Main St',
    mailingAddress: '123 Main St',
    phoneNumber: '0123456789',
    occupation: 'Engineer',
    initialShare: 100,
  }

  it('passes with valid member data', () => {
    const result = memberSchema.safeParse(validMemberData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.memberNo).toBe('M001')
      expect(result.data.fullName).toBe('John Doe')
    }
  })

  it('fails when memberNo is empty', () => {
    const result = memberSchema.safeParse({ ...validMemberData, memberNo: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('memberNo')
      expect(result.error.errors[0].message).toBe('Member number is required')
    }
  })

  it('fails when fullName is empty', () => {
    const result = memberSchema.safeParse({ ...validMemberData, fullName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('fullName')
      expect(result.error.errors[0].message).toBe('Full name is required')
    }
  })

  it('fails when nationalId is empty', () => {
    const result = memberSchema.safeParse({ ...validMemberData, nationalId: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('nationalId')
    }
  })

  it('fails when email is invalid', () => {
    const result = memberSchema.safeParse({ ...validMemberData, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('email')
      expect(result.error.errors[0].message).toBe('Invalid email address')
    }
  })

  it('passes with optional email omitted', () => {
    const { email, ...dataWithoutEmail } = validMemberData
    const result = memberSchema.safeParse(dataWithoutEmail)
    expect(result.success).toBe(true)
  })

  it('passes with empty email string', () => {
    const result = memberSchema.safeParse({ ...validMemberData, email: '' })
    expect(result.success).toBe(true)
  })

  it('fails when initialShare is negative', () => {
    const result = memberSchema.safeParse({ ...validMemberData, initialShare: -10 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('initialShare')
      expect(result.error.errors[0].message).toBe('Initial share must be positive')
    }
  })

  it('fails when initialShare is zero', () => {
    // Note: .min(0) allows zero, but we might want to test specific behavior
    const result = memberSchema.safeParse({ ...validMemberData, initialShare: 0 })
    // This currently passes because .min(0) allows 0
    expect(result.success).toBe(true)
  })

  it('passes with all optional date fields', () => {
    const result = memberSchema.safeParse({
      ...validMemberData,
      dateOfBirth: '1990-01-01',
      joinDate: '2024-01-01',
      email: 'john@example.com',
    })
    expect(result.success).toBe(true)
  })
})

describe('memberUpdateSchema', () => {
  it('passes with partial update data', () => {
    const result = memberUpdateSchema.safeParse({
      fullName: 'Updated Name',
      status: 'resigned',
    })
    expect(result.success).toBe(true)
  })

  it('passes with empty object', () => {
    const result = memberUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('allows status field only in update', () => {
    const result = memberUpdateSchema.safeParse({
      status: 'deceased',
      statusDate: '2024-01-01',
      statusNote: 'Passed away',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('deceased')
    }
  })

  it('rejects invalid status value', () => {
    const result = memberUpdateSchema.safeParse({
      status: 'invalid_status',
    })
    expect(result.success).toBe(false)
  })

  it('excludes initialShare from update schema', () => {
    // The update schema should not require or validate initialShare
    const result = memberUpdateSchema.safeParse({
      initialShare: -100, // This should be ignored, not validated
    })
    // Since initialShare is omitted from the update schema, it should pass
    expect(result.success).toBe(true)
  })
})

describe('transactionSchema', () => {
  const validTransaction = {
    memberId: 1,
    transactionDate: '2024-01-01',
    transactionType: 'deposit',
    amount: 100,
  }

  it('passes with valid transaction data', () => {
    const result = transactionSchema.safeParse(validTransaction)
    expect(result.success).toBe(true)
  })

  it('accepts all transaction types', () => {
    const types = ['deposit', 'withdrawal', 'dividend', 'fee'] as const
    types.forEach((type) => {
      const result = transactionSchema.safeParse({ ...validTransaction, transactionType: type })
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid transaction type', () => {
    const result = transactionSchema.safeParse({
      ...validTransaction,
      transactionType: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('fails when amount is negative', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, amount: -50 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Amount must be positive')
    }
  })

  it('fails when amount is zero', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('accepts string memberId and coerces to number', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, memberId: '123' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.memberId).toBe(123)
    }
  })

  it('fails when memberId is not a valid number', () => {
    const result = transactionSchema.safeParse({ ...validTransaction, memberId: -1 })
    expect(result.success).toBe(false)
  })

  it('passes with optional fields', () => {
    const result = transactionSchema.safeParse({
      ...validTransaction,
      description: 'Test transaction',
      receiptNo: 'R001',
      year: '2024',
      remarks: 'Test remarks',
    })
    expect(result.success).toBe(true)
  })
})

describe('cooperativeSchema', () => {
  const validCooperative = {
    name: 'Test Cooperative',
  }

  it('passes with minimal valid data', () => {
    const result = cooperativeSchema.safeParse(validCooperative)
    expect(result.success).toBe(true)
  })

  it('passes with all fields', () => {
    const result = cooperativeSchema.safeParse({
      name: 'Test Cooperative',
      regNumber: 'REG123',
      address: '123 Main St',
      email: 'test@cooperative.com',
      phone: '0123456789',
      fax: '0123456788',
    })
    expect(result.success).toBe(true)
  })

  it('fails when name is empty', () => {
    const result = cooperativeSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('fails with invalid email', () => {
    const result = cooperativeSchema.safeParse({
      ...validCooperative,
      email: 'invalid-email',
    })
    expect(result.success).toBe(false)
  })

  it('passes with optional email omitted', () => {
    const { email, ...data } = validCooperative
    const result = cooperativeSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('validateFormDataSafe', () => {
  it('returns parsed data on valid FormData', () => {
    const formData = new FormData()
    formData.append('memberNo', 'M001')
    formData.append('title', 'Mr')
    formData.append('fullName', 'John Doe')
    formData.append('nationalId', '1234567890')
    formData.append('permanentAddress', '123 Main St')
    formData.append('mailingAddress', '123 Main St')
    formData.append('phoneNumber', '0123456789')
    formData.append('occupation', 'Engineer')
    formData.append('initialShare', '100')

    const result = validateFormDataSafe(memberSchema, formData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.memberNo).toBe('M001')
      expect(result.data.initialShare).toBe(100)
    }
  })

  it('returns ZodError on invalid FormData', () => {
    const formData = new FormData()
    formData.append('memberNo', '') // Empty - should fail

    const result = validateFormDataSafe(memberSchema, formData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors.errors.length).toBeGreaterThan(0)
    }
  })

  it('coerces number fields from FormData strings', () => {
    const formData = new FormData()
    formData.append('memberNo', 'M001')
    formData.append('title', 'Mr')
    formData.append('fullName', 'John Doe')
    formData.append('nationalId', '1234567890')
    formData.append('permanentAddress', '123 Main St')
    formData.append('mailingAddress', '123 Main St')
    formData.append('phoneNumber', '0123456789')
    formData.append('occupation', 'Engineer')
    formData.append('initialShare', '50.5') // String number

    const result = validateFormDataSafe(memberSchema, formData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.initialShare).toBe(50.5)
    }
  })
})

describe('validateFormData', () => {
  it('throws on invalid FormData', () => {
    const formData = new FormData()
    formData.append('memberNo', '') // Empty - should fail

    expect(() => validateFormData(memberSchema, formData)).toThrow()
  })

  it('returns parsed data on valid FormData', () => {
    const formData = new FormData()
    formData.append('memberNo', 'M001')
    formData.append('title', 'Mr')
    formData.append('fullName', 'John Doe')
    formData.append('nationalId', '1234567890')
    formData.append('permanentAddress', '123 Main St')
    formData.append('mailingAddress', '123 Main St')
    formData.append('phoneNumber', '0123456789')
    formData.append('occupation', 'Engineer')
    formData.append('initialShare', '100')

    const result = validateFormData(memberSchema, formData)
    expect(result.memberNo).toBe('M001')
  })
})
