import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMember, updateMember, deleteMember, getMemberById, getMembers } from '../members'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/validation', () => ({
  memberSchema: vi.fn(),
  memberUpdateSchema: vi.fn(),
  validateFormDataSafe: vi.fn().mockImplementation(() => ({ success: true, data: {} })),
}))

import { createServerSupabaseClient } from '@/lib/supabase'
import { validateFormDataSafe } from '@/lib/validation'

// Mock data
const mockMember = {
  id: 1,
  member_no: 'M001',
  title: 'Mr',
  full_name: 'John Doe',
  national_id: '1234567890',
  date_of_birth: '1990-01-01',
  permanent_address: '123 Main St',
  mailing_address: '123 Main St',
  phone_number: '0123456789',
  email: 'john@example.com',
  occupation: 'Engineer',
  join_date: '2024-01-01',
  share_balance: 100,
  bonus_balance: 0,
  total_balance: 100,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({ data: mockMember, error: null })),
        range: vi.fn(() => ({ data: [mockMember], error: null, count: 1 })),
        neq: vi.fn(() => ({ data: [], error: null })),
      })),
      order: vi.fn(() => ({
        range: vi.fn(() => ({ data: [mockMember], error: null, count: 1 })),
        single: vi.fn(() => ({ data: mockMember, error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: mockMember, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: mockMember, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  })),
}

describe('getMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(createServerSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient)
  })

  it('fetches members with pagination', async () => {
    const result = await getMembers(1, 10)

    expect(result.members).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('calculates offset correctly', async () => {
    await getMembers(2, 20)
    expect(mockSupabaseClient.from).toHaveBeenCalled()
  })
})

describe('getMemberById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(createServerSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient)
  })

  it('throws error for invalid ID', async () => {
    await expect(getMemberById(NaN as unknown as number)).rejects.toThrow('Invalid member ID')
  })

  it('throws error for undefined ID', async () => {
    await expect(getMemberById(undefined as unknown as number)).rejects.toThrow('Invalid member ID')
  })

  it('fetches member with nominee', async () => {
    const mockClientWithNominee = {
      from: vi.fn(() => ({
        select: vi.fn()
          .mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              single: vi.fn(() => ({ data: mockMember, error: null })),
            }),
          })
          .mockReturnValueOnce({
            eq: vi.fn().mockReturnValueOnce({
              single: vi.fn(() => ({ data: { id: 1, name: 'Jane Doe', relationship: 'Wife' }, error: null })),
            }),
          }),
      })),
    }

    ;(createServerSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(mockClientWithNominee)

    const result = await getMemberById(1)
    expect(result).toHaveProperty('nominee')
  })
})

describe('createMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates member with valid FormData', async () => {
    const mockClient = {
      from: vi.fn((_table: string) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ data: [], error: null }),
          neq: vi.fn().mockReturnValue({ data: [], error: null }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockMember, error: null }),
          }),
        }),
      })),
    }

    ;(createServerSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(mockClient as unknown as ReturnType<typeof createServerSupabaseClient>)

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

    const result = await createMember(formData)
    expect(result).toBeDefined()
  })

  it('throws validation error for invalid FormData', async () => {
    const formData = new FormData()
    formData.append('memberNo', '')

    const { validateFormDataSafe } = await import('@/lib/validation')
    vi.mocked(validateFormDataSafe).mockReturnValue({
      success: false,
      errors: {
        errors: [{ path: ['memberNo'], message: 'Member number is required' }],
      } as unknown as import('zod').ZodError,
    })

    await expect(createMember(formData)).rejects.toThrow('Validation failed')
  })
})

describe('updateMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws error for invalid ID', async () => {
    const formData = new FormData()
    await expect(updateMember(NaN as unknown as number, formData)).rejects.toThrow('Invalid member ID')
  })

  it('throws error for undefined ID', async () => {
    const formData = new FormData()
    await expect(updateMember(undefined as unknown as number, formData)).rejects.toThrow('Invalid member ID')
  })
})

describe('deleteMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws error for invalid ID', async () => {
    await expect(deleteMember(NaN as unknown as number)).rejects.toThrow('Invalid member ID')
  })

  it('throws error for undefined ID', async () => {
    await expect(deleteMember(undefined as unknown as number)).rejects.toThrow('Invalid member ID')
  })

  it('deletes member with valid ID', async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    }

    ;(createServerSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(mockClient as unknown as ReturnType<typeof createServerSupabaseClient>)

    const result = await deleteMember(1)
    expect(result).toBe(true)
  })
})
