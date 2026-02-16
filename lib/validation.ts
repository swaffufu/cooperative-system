import { z } from "zod"

// Member validation schemas
export const memberSchema = z.object({
  memberNo: z.string().min(1, "Member number is required"),
  title: z.string().min(1, "Title is required"),
  fullName: z.string().min(1, "Full name is required"),
  nationalId: z.string().min(1, "National ID is required"),
  dateOfBirth: z.string().optional(),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  mailingAddress: z.string().min(1, "Mailing address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  occupation: z.string().min(1, "Occupation is required"),
  joinDate: z.string().optional(),
  initialShare: z.coerce.number().min(0, "Initial share must be positive"),
})

export const memberUpdateSchema = memberSchema.extend({
  status: z.enum(["active", "resigned", "deceased"]),
  statusDate: z.string().optional(),
  statusNote: z.string().optional(),
}).partial().omit({ initialShare: true })

// Transaction validation schemas
export const transactionSchema = z.object({
  memberId: z.coerce.number().int().positive("Valid member is required"),
  transactionDate: z.string().min(1, "Transaction date is required"),
  transactionType: z.enum(["deposit", "withdrawal", "dividend", "fee"]),
  description: z.string().optional(),
  receiptNo: z.string().optional(),
  year: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  remarks: z.string().optional(),
})

// Cooperative validation schemas
export const cooperativeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  regNumber: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  fax: z.string().optional(),
})

// Helper function to validate form data
export function validateFormData<T extends z.ZodSchema>(
  schema: T,
  formData: FormData
): z.infer<T> {
  const data = Object.fromEntries(formData.entries())
  return schema.parse(data)
}

// Helper function to validate and return errors
export function validateFormDataSafe<T extends z.ZodSchema>(
  schema: T,
  formData: FormData
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const data = Object.fromEntries(formData.entries())
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}
