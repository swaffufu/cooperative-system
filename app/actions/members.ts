"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import { memberSchema, memberUpdateSchema, validateFormDataSafe } from "@/lib/validation"
import type { Member, Nominee } from "@/lib/types"
import { z } from "zod"

// Get all members with pagination
export async function getMembers(page = 1, limit = 50) {
  const supabase = createServerSupabaseClient()
  const offset = (page - 1) * limit

  const { data, error } = await supabase
    .from("members")
    .select("*", { count: "exact" })
    .order("member_no", { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching members:", error)
    throw new Error("Failed to fetch members")
  }

  return {
    members: data as Member[],
    total: data?.length || 0,
    page,
    limit,
  }
}

// Get all members (legacy function for compatibility)
export async function getMembersLegacy() {
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

  // Validate ID
  if (!id || isNaN(id)) {
    throw new Error("Invalid member ID")
  }

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
    console.error("Error fetching nominee:", nomineeError)
  }

  return {
    ...member,
    nominee: nominee || null,
  } as Member & { nominee: Nominee | null }
}

// Check if member number already exists
async function memberNumberExists(memberNo: string, excludeId?: number) {
  const supabase = createServerSupabaseClient()
  
  let query = supabase.from("members").select("id").eq("member_no", memberNo)
  
  if (excludeId) {
    query = query.neq("id", excludeId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error("Error checking member number:", error)
    return true // Fail safe - assume it exists if we can't check
  }
  
  return (data?.length || 0) > 0
}

// Create new member
export async function createMember(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Validate input
  const validation = validateFormDataSafe(memberSchema, formData)
  if (!validation.success) {
    const errors = validation.errors.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw new Error(`Validation failed: ${errors}`)
  }

  const data = validation.data

  // Check for duplicate member number
  if (await memberNumberExists(data.memberNo)) {
    throw new Error(`Member number "${data.memberNo}" already exists`)
  }

  const now = new Date().toISOString()

  // Insert member
  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert([
      {
        member_no: data.memberNo,
        title: data.title,
        full_name: data.fullName,
        national_id: data.nationalId,
        date_of_birth: data.dateOfBirth || null,
        permanent_address: data.permanentAddress,
        mailing_address: data.mailingAddress,
        phone_number: data.phoneNumber,
        email: data.email || null,
        occupation: data.occupation,
        join_date: data.joinDate || null,
        share_balance: data.initialShare,
        bonus_balance: 0,
        total_balance: data.initialShare,
        status: "active",
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single()

  if (memberError) {
    console.error("Error creating member:", memberError)
    throw new Error("Failed to create member")
  }

  // Insert nominee if provided
  const nomineeName = formData.get("nomineeName") as string
  if (nomineeName) {
    const nomineeRelationship = formData.get("nomineeRelationship") as string
    const nomineeId = formData.get("nomineeId") as string
    const nomineePhone = formData.get("nomineePhone") as string

    const { error: nomineeError } = await supabase.from("nominees").insert([
      {
        member_id: member.id,
        name: nomineeName,
        relationship: nomineeRelationship || null,
        national_id: nomineeId || null,
        phone_number: nomineePhone || null,
        created_at: now,
        updated_at: now,
      },
    ])

    if (nomineeError) {
      console.error("Error creating nominee:", nomineeError)
    }
  }

  // Insert initial transaction if initial share amount is provided
  if (data.initialShare > 0) {
    const { error: transactionError } = await supabase.from("transactions").insert([
      {
        member_id: member.id,
        transaction_date: data.joinDate || now.split("T")[0],
        description: "Initial Share",
        amount_in: data.initialShare,
        amount_out: 0,
        share_balance: data.initialShare,
        bonus_balance: 0,
        total_balance: data.initialShare,
        created_by: "System",
        created_at: now,
      },
    ])

    if (transactionError) {
      console.error("Error creating initial transaction:", transactionError)
    }
  }

  revalidatePath("/members")
  return member
}

// Update member
export async function updateMember(id: number, formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Validate ID
  if (!id || isNaN(id)) {
    throw new Error("Invalid member ID")
  }

  // Get form data for validation
  const formDataObj = Object.fromEntries(formData.entries())
  
  // Validate with partial schema
  const validation = memberUpdateSchema.safeParse({
    ...formDataObj,
    initialShare: undefined,
  })
  
  if (!validation.success) {
    const errors = validation.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw new Error(`Validation failed: ${errors}`)
  }

  const data = validation.data

  // Check for duplicate member number (excluding current member)
  if (data.memberNo && await memberNumberExists(data.memberNo, id)) {
    throw new Error(`Member number "${data.memberNo}" already exists`)
  }

  // Build update object
  const updateObj: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  
  if (data.title) updateObj.title = data.title
  if (data.fullName) updateObj.full_name = data.fullName
  if (data.nationalId) updateObj.national_id = data.nationalId
  if (data.dateOfBirth !== undefined) updateObj.date_of_birth = data.dateOfBirth || null
  if (data.permanentAddress) updateObj.permanent_address = data.permanentAddress
  if (data.mailingAddress) updateObj.mailing_address = data.mailingAddress
  if (data.phoneNumber) updateObj.phone_number = data.phoneNumber
  if (data.email !== undefined) updateObj.email = data.email || null
  if (data.occupation) updateObj.occupation = data.occupation
  if (data.status) updateObj.status = data.status
  if (data.statusDate !== undefined) updateObj.status_date = data.statusDate || null
  if (data.statusNote !== undefined) updateObj.status_note = data.statusNote || null

  // Update member
  const { data: member, error: memberError } = await supabase
    .from("members")
    .update(updateObj)
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

  // Handle nominee updates
  const nomineeName = formData.get("nomineeName") as string
  const nomineeRelationship = formData.get("nomineeRelationship") as string
  const nomineeId = formData.get("nomineeId") as string
  const nomineePhone = formData.get("nomineePhone") as string

  if (nomineeName) {
    if (existingNominee) {
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
      const { error: nomineeInsertError } = await supabase.from("nominees").insert([
        {
          member_id: id,
          name: nomineeName,
          relationship: nomineeRelationship || null,
          national_id: nomineeId || null,
          phone_number: nomineePhone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (nomineeInsertError) {
        console.error("Error creating nominee:", nomineeInsertError)
      }
    }
  } else if (existingNominee) {
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

  // Validate ID
  if (!id || isNaN(id)) {
    throw new Error("Invalid member ID")
  }

  // Delete member (cascade will delete nominees and transactions)
  const { error } = await supabase.from("members").delete().eq("id", id)

  if (error) {
    console.error("Error deleting member:", error)
    throw new Error("Failed to delete member")
  }

  revalidatePath("/members")
  return true
}
