"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { Cooperative } from "@/lib/types"

// Get cooperative information
export async function getCooperativeInfo() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("cooperative").select("*").single()

  if (error) {
    console.error("Error fetching cooperative info:", error)
    throw new Error("Failed to fetch cooperative info")
  }

  return data as Cooperative
}

// Update cooperative information
export async function updateCooperativeInfo(formData: FormData) {
  const supabase = createServerSupabaseClient()

  const name = formData.get("name") as string
  const registrationNumber = formData.get("regNumber") as string
  const address = formData.get("address") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const fax = formData.get("fax") as string

  const { data, error } = await supabase
    .from("cooperative")
    .update({
      name,
      registration_number: registrationNumber,
      address,
      email,
      phone,
      fax,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1) // Assuming there's only one cooperative record
    .select()
    .single()

  if (error) {
    console.error("Error updating cooperative info:", error)
    throw new Error("Failed to update cooperative info")
  }

  revalidatePath("/settings")
  return data as Cooperative
}
