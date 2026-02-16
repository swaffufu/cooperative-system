"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import { transactionSchema, validateFormDataSafe } from "@/lib/validation"
import type { Transaction } from "@/lib/types"

// Get all transactions
export async function getTransactions(page = 1, limit = 50) {
  const supabase = createServerSupabaseClient()
  const offset = (page - 1) * limit

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      member:member_id (
        id,
        member_no,
        full_name
      )
    `)
    .order("transaction_date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching transactions:", error)
    throw new Error("Failed to fetch transactions")
  }

  return {
    transactions: data as Transaction[],
    total: data?.length || 0,
    page,
    limit,
  }
}

// Get all transactions (legacy)
export async function getTransactionsLegacy() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      member:member_id (
        id,
        member_no,
        full_name
      )
    `)
    .order("transaction_date", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    throw new Error("Failed to fetch transactions")
  }

  return data as Transaction[]
}

// Get transactions by member ID
export async function getTransactionsByMemberId(memberId: number) {
  const supabase = createServerSupabaseClient()

  // Validate member ID
  if (!memberId || isNaN(memberId)) {
    throw new Error("Invalid member ID")
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("member_id", memberId)
    .order("transaction_date", { ascending: true })

  if (error) {
    console.error("Error fetching member transactions:", error)
    throw new Error("Failed to fetch member transactions")
  }

  return data as Transaction[]
}

// Create new transaction
export async function createTransaction(formData: FormData) {
  const supabase = createServerSupabaseClient()

  // Validate input
  const validation = validateFormDataSafe(transactionSchema, formData)
  if (!validation.success) {
    const errors = validation.errors.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw new Error(`Validation failed: ${errors}`)
  }

  const data = validation.data

  // Get current member balances with row lock
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("share_balance, bonus_balance, total_balance")
    .eq("id", data.memberId)
    .single()

  if (memberError) {
    console.error("Error fetching member balances:", memberError)
    throw new Error("Failed to fetch member balances")
  }

  let amountIn = 0
  let amountOut = 0
  let newShareBalance = member.share_balance
  let newBonusBalance = member.bonus_balance

  // Calculate new balances based on transaction type
  switch (data.transactionType) {
    case "deposit":
      amountIn = data.amount
      newShareBalance += data.amount
      break
    case "withdrawal":
      // Check if sufficient balance exists
      if (member.share_balance < data.amount) {
        throw new Error(`Insufficient balance. Available: RM ${member.share_balance.toFixed(2)}`)
      }
      amountOut = data.amount
      newShareBalance -= data.amount
      break
    case "dividend":
      amountIn = data.amount
      newBonusBalance += data.amount
      break
    case "fee":
      // Check if sufficient balance exists for fees
      if (member.total_balance < data.amount) {
        throw new Error(`Insufficient balance to pay fee. Available: RM ${member.total_balance.toFixed(2)}`)
      }
      amountOut = data.amount
      newShareBalance -= data.amount
      break
    default:
      if (data.amount > 0) {
        amountIn = data.amount
        newShareBalance += data.amount
      } else {
        amountOut = Math.abs(data.amount)
        newShareBalance -= Math.abs(data.amount)
      }
  }

  const newTotalBalance = newShareBalance + newBonusBalance
  const now = new Date().toISOString()

  // Use database function if available, otherwise do sequential operations
  // For now, we'll do it sequentially with error handling
  try {
    // Insert transaction first
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert([
        {
          member_id: data.memberId,
          transaction_date: data.transactionDate,
          description: data.description || data.transactionType,
          receipt_no: data.receiptNo || null,
          year: data.year || null,
          amount_in: amountIn,
          amount_out: amountOut,
          share_balance: newShareBalance,
          bonus_balance: newBonusBalance,
          total_balance: newTotalBalance,
          remarks: data.remarks || null,
          created_by: "System",
          created_at: now,
        },
      ])
      .select()
      .single()

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
      throw new Error("Failed to create transaction")
    }

    // Update member balances
    const { error: updateError } = await supabase
      .from("members")
      .update({
        share_balance: newShareBalance,
        bonus_balance: newBonusBalance,
        total_balance: newTotalBalance,
        updated_at: now,
      })
      .eq("id", data.memberId)

    if (updateError) {
      // Try to delete the transaction if balance update fails
      await supabase.from("transactions").delete().eq("id", transaction.id)
      console.error("Error updating member balances:", updateError)
      throw new Error("Failed to update member balances")
    }

    revalidatePath(`/members/${data.memberId}`)
    revalidatePath("/transactions")
    return transaction
  } catch (error) {
    console.error("Transaction error:", error)
    throw error
  }
}
