"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { Benefit } from "@/lib/types"
import { z } from "zod"

// Benefit claim schema
const claimBenefitSchema = z.object({
  benefitId: z.string().min(1, "Benefit ID is required"),
})

// Get benefits for a member
export async function getMemberBenefits(memberId: number) {
  const supabase = createServerSupabaseClient()

  // Validate member ID
  if (!memberId || isNaN(memberId)) {
    throw new Error("Invalid member ID")
  }

  const { data, error } = await supabase
    .from("benefits")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching benefits:", error)
    throw new Error("Failed to fetch benefits")
  }

  return data as Benefit[]
}

// Get all benefits (for admin)
export async function getAllBenefits() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("benefits")
    .select(`
      *,
      member:members (
        id,
        member_no,
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching benefits:", error)
    throw new Error("Failed to fetch benefits")
  }

  return data as (Benefit & { member?: { id: number; member_no: string; full_name: string } })[]
}

// Claim a benefit
export async function claimBenefit(benefitId: string) {
  const supabase = createServerSupabaseClient()

  // Validate input
  const validation = claimBenefitSchema.safeParse({ benefitId })
  if (!validation.success) {
    throw new Error("Invalid benefit ID")
  }

  // First, get the benefit to check its status and member_id
  const { data: existingBenefit, error: fetchError } = await supabase
    .from("benefits")
    .select("id, status, member_id")
    .eq("id", benefitId)
    .single()

  if (fetchError || !existingBenefit) {
    console.error("Error fetching benefit:", fetchError)
    throw new Error("Benefit not found")
  }

  if (existingBenefit.status !== "available") {
    throw new Error("This benefit has already been claimed")
  }

  const { data, error } = await supabase
    .from("benefits")
    .update({
      status: "claimed",
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", benefitId)
    .eq("status", "available")
    .select()
    .single()

  if (error) {
    console.error("Error claiming benefit:", error)
    throw new Error("Failed to claim benefit")
  }

  revalidatePath(`/members/${existingBenefit.member_id}`)
  return data as Benefit
}

// Create a benefit (for admin)
export async function createBenefit(memberId: number, benefitType: string, amount: number) {
  const supabase = createServerSupabaseClient()

  // Validate inputs
  if (!memberId || isNaN(memberId)) {
    throw new Error("Invalid member ID")
  }
  if (!benefitType) {
    throw new Error("Benefit type is required")
  }
  if (amount <= 0) {
    throw new Error("Amount must be positive")
  }

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("benefits")
    .insert([{
      member_id: memberId,
      benefit_type: benefitType,
      amount: amount,
      status: "available",
      claimed_at: null,
      created_at: now,
      updated_at: now,
    }])
    .select()
    .single()

  if (error) {
    console.error("Error creating benefit:", error)
    throw new Error("Failed to create benefit")
  }

  revalidatePath(`/members/${memberId}`)
  return data as Benefit
}
