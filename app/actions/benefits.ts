"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { Benefit } from "@/lib/types"

// Get benefits for a member
export async function getMemberBenefits(memberId: number) {
  const supabase = createServerSupabaseClient()

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

// Claim a benefit
export async function claimBenefit(benefitId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("benefits")
    .update({
      status: "claimed",
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", benefitId)
    .eq("status", "available") // Only allow claiming if status is available
    .select()
    .single()

  if (error) {
    console.error("Error claiming benefit:", error)
    throw new Error("Failed to claim benefit")
  }

  revalidatePath(`/members/${data.member_id}`)
  return data as Benefit
}
