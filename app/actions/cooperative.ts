"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import { cooperativeSchema, validateFormDataSafe } from "@/lib/validation"
import type { Cooperative } from "@/lib/types"

// Get cooperative information
export async function getCooperativeInfo() {
  const supabase = createServerSupabaseClient()

  // Try to get existing cooperative, or create default if none exists
  const { data: existing, error: fetchError } = await supabase
    .from("cooperative")
    .select("*")
    .limit(1)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching cooperative info:", fetchError)
    throw new Error("Failed to fetch cooperative info")
  }

  // If no cooperative exists, create a default one
  if (!existing) {
    const { data: created, error: createError } = await supabase
      .from("cooperative")
      .insert([{
        name: "My Cooperative",
        registration_number: null,
        address: null,
        email: null,
        phone: null,
        fax: null,
      }])
      .select()
      .single()

    if (createError) {
      console.error("Error creating cooperative:", createError)
      throw new Error("Failed to create cooperative")
    }

    return created as Cooperative
  }

  return existing as Cooperative
}

// Get cooperative by ID (safer than hardcoding)
export async function getCooperativeById(id: number) {
  const supabase = createServerSupabaseClient()

  if (!id || isNaN(id)) {
    throw new Error("Invalid cooperative ID")
  }

  const { data, error } = await supabase
    .from("cooperative")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching cooperative info:", error)
    throw new Error("Failed to fetch cooperative info")
  }

  return data as Cooperative
}

// Update cooperative information
export async function updateCooperativeInfo(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Validate input
  const validation = validateFormDataSafe(cooperativeSchema, formData)
  if (!validation.success) {
    const errors = validation.errors.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw new Error(`Validation failed: ${errors}`)
  }

  const data = validation.data
  const cooperativeId = formData.get("cooperativeId") as string

  // Get the cooperative ID to update (from form or find first)
  let targetId: number

  if (cooperativeId && !isNaN(Number(cooperativeId))) {
    targetId = Number(cooperativeId)
  } else {
    // Get the first cooperative
    const { data: existing, error: fetchError } = await supabase
      .from("cooperative")
      .select("id")
      .limit(1)
      .single()

    if (fetchError) {
      console.error("Error finding cooperative:", fetchError)
      throw new Error("Failed to find cooperative")
    }

    targetId = existing.id
  }

  const { data: result, error } = await supabase
    .from("cooperative")
    .update({
      name: data.name,
      registration_number: data.regNumber || null,
      address: data.address || null,
      email: data.email || null,
      phone: data.phone || null,
      fax: data.fax || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId)
    .select()
    .single()

  if (error) {
    console.error("Error updating cooperative info:", error)
    throw new Error("Failed to update cooperative info")
  }

  revalidatePath("/settings")
  return result as Cooperative
}
