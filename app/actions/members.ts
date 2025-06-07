"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { Member, Nominee } from "@/lib/types"

// Get all members
export async function getMembers() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("members").select("*").order("member_no", { ascending: true })

  if (error) {
    console.error("Error fetching members:", error)
    throw new Error("Failed to fetch members")
  }

  return data as Member[]
}

// Get member by ID
export async function getMemberById(id: number) {
  const supabase = createServerSupabaseClient()

  // Get member
  const { data: member, error: memberError } = await supabase.from("members").select("*").eq("id", id).single()

  if (memberError) {
    console.error("Error fetching member:", memberError)
    throw new Error("Failed to fetch member")
  }

  // Get nominee
  const { data: nominee, error: nomineeError } = await supabase
    .from("nominees")
    .select("*")
    .eq("member_id", id)
    .single()

  if (nomineeError && nomineeError.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    console.error("Error fetching nominee:", nomineeError)
  }

  return {
    ...member,
    nominee: nominee || null,
  } as Member & { nominee: Nominee | null }
}

// Create new member
export async function createMember(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Extract member data
  const memberNo = formData.get("memberNo") as string
  const title = formData.get("title") as string
  const fullName = formData.get("fullName") as string
  const nationalId = formData.get("nationalId") as string
  const dateOfBirth = formData.get("dateOfBirth") as string
  const permanentAddress = formData.get("permanentAddress") as string
  const mailingAddress = formData.get("mailingAddress") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const email = formData.get("email") as string
  const occupation = formData.get("occupation") as string
  const joinDate = formData.get("joinDate") as string
  const initialShare = Number.parseFloat(formData.get("initialShare") as string) || 0

  // Extract nominee data
  const nomineeName = formData.get("nomineeName") as string
  const nomineeRelationship = formData.get("nomineeRelationship") as string
  const nomineeId = formData.get("nomineeId") as string
  const nomineePhone = formData.get("nomineePhone") as string

  // Insert member
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert([
      {
        member_no: memberNo,
        title,
        full_name: fullName,
        national_id: nationalId,
        date_of_birth: dateOfBirth || null,
        permanent_address: permanentAddress,
        mailing_address: mailingAddress,
        phone_number: phoneNumber,
        email: email,
        occupation,
        join_date: joinDate || null,
        share_balance: initialShare,
        bonus_balance: 0,
        total_balance: initialShare,
        status: "active",
      },
    ])
    .select()
    .single()

  if (memberError) {
    console.error("Error creating member:", memberError)
    throw new Error("Failed to create member")
  }

  // Insert nominee if provided
  if (nomineeName) {
    const { error: nomineeError } = await supabase.from("nominees").insert([
      {
        member_id: member.id,
        name: nomineeName,
        relationship: nomineeRelationship || null,
        national_id: nomineeId || null,
        phone_number: nomineePhone || null,
      },
    ])

    if (nomineeError) {
      console.error("Error creating nominee:", nomineeError)
      // Continue even if nominee creation fails
    }
  }

  // Insert initial transaction if initial share amount is provided
  if (initialShare > 0) {
    const { error: transactionError } = await supabase.from("transactions").insert([
      {
        member_id: member.id,
        transaction_date: joinDate || new Date().toISOString().split("T")[0],
        description: "Initial Share",
        amount_in: initialShare,
        amount_out: 0,
        share_balance: initialShare,
        bonus_balance: 0,
        total_balance: initialShare,
        created_by: "System",
      },
    ])

    if (transactionError) {
      console.error("Error creating initial transaction:", transactionError)
      // Continue even if transaction creation fails
    }
  }

  revalidatePath("/members")
  return member
}

// Update member
export async function updateMember(id: number, formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Extract member data
  const title = formData.get("title") as string
  const fullName = formData.get("fullName") as string
  const nationalId = formData.get("nationalId") as string
  const dateOfBirth = formData.get("dateOfBirth") as string
  const permanentAddress = formData.get("permanentAddress") as string
  const mailingAddress = formData.get("mailingAddress") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const email = formData.get("email") as string
  const occupation = formData.get("occupation") as string
  const status = formData.get("status") as "active" | "resigned" | "deceased"
  const statusDate = formData.get("statusDate") as string
  const statusNote = formData.get("statusNote") as string

  // Extract nominee data
  const nomineeName = formData.get("nomineeName") as string
  const nomineeRelationship = formData.get("nomineeRelationship") as string
  const nomineeId = formData.get("nomineeId") as string
  const nomineePhone = formData.get("nomineePhone") as string

  // Update member
  const { data: member, error: memberError } = await supabase
    .from("members")
    .update({
      title,
      full_name: fullName,
      national_id: nationalId,
      date_of_birth: dateOfBirth || null,
      permanent_address: permanentAddress,
      mailing_address: mailingAddress,
      phone_number: phoneNumber,
      email: email,
      occupation,
      status,
      status_date: statusDate || null,
      status_note: statusNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (memberError) {
    console.error("Error updating member:", memberError)
    throw new Error("Failed to update member")
  }

  // Check if nominee exists
  const { data: existingNominee, error: nomineeCheckError } = await supabase
    .from("nominees")
    .select("id")
    .eq("member_id", id)
    .single()

  if (nomineeCheckError && nomineeCheckError.code !== "PGRST116") {
    console.error("Error checking nominee:", nomineeCheckError)
  }

  // Update or insert nominee
  if (nomineeName) {
    if (existingNominee) {
      // Update existing nominee
      const { error: nomineeUpdateError } = await supabase
        .from("nominees")
        .update({
          name: nomineeName,
          relationship: nomineeRelationship || null,
          national_id: nomineeId || null,
          phone_number: nomineePhone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingNominee.id)

      if (nomineeUpdateError) {
        console.error("Error updating nominee:", nomineeUpdateError)
      }
    } else {
      // Insert new nominee
      const { error: nomineeInsertError } = await supabase.from("nominees").insert([
        {
          member_id: id,
          name: nomineeName,
          relationship: nomineeRelationship || null,
          national_id: nomineeId || null,
          phone_number: nomineePhone || null,
        },
      ])

      if (nomineeInsertError) {
        console.error("Error creating nominee:", nomineeInsertError)
      }
    }
  } else if (existingNominee) {
    // Delete nominee if name is empty
    const { error: nomineeDeleteError } = await supabase.from("nominees").delete().eq("id", existingNominee.id)

    if (nomineeDeleteError) {
      console.error("Error deleting nominee:", nomineeDeleteError)
    }
  }

  revalidatePath(`/members/${id}`)
  revalidatePath("/members")
  return member
}

// Delete member
export async function deleteMember(id: number) {
  const supabase = createServerSupabaseClient()

  // Delete member (cascade will delete nominees and transactions)
  const { error } = await supabase.from("members").delete().eq("id", id)

  if (error) {
    console.error("Error deleting member:", error)
    throw new Error("Failed to delete member")
  }

  revalidatePath("/members")
  return true
}
