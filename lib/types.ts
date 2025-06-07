export type Member = {
  id: number
  member_no: string
  title: string
  full_name: string
  national_id: string
  date_of_birth: string | null
  permanent_address: string | null
  mailing_address: string | null
  phone_number: string | null
  email: string | null
  occupation: string | null
  join_date: string | null
  approval_date: string | null
  status: "active" | "resigned" | "deceased"
  status_note: string | null
  status_date: string | null
  share_balance: number
  bonus_balance: number
  total_balance: number
  created_at: string
  updated_at: string
}

export type Nominee = {
  id: number
  member_id: number
  name: string
  relationship: string | null
  national_id: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: number
  member_id: number
  transaction_date: string
  description: string | null
  receipt_no: string | null
  year: string | null
  amount_in: number
  amount_out: number
  share_balance: number
  bonus_balance: number
  total_balance: number
  remarks: string | null
  created_by: string | null
  created_at: string
  member?: Member
}

export type Cooperative = {
  id: number
  name: string
  registration_number: string | null
  address: string | null
  email: string | null
  phone: string | null
  fax: string | null
  created_at: string
  updated_at: string
}

export type Benefit = {
  id: string
  member_id: number
  benefit_type: string
  amount: number
  status: "available" | "claimed"
  claimed_at: string | null
  created_at: string
  updated_at: string
}
