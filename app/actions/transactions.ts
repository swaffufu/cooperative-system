"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { Transaction } from "@/lib/types"

// Get all transactions
export async function getTransactions() {
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

  // Extract transaction data
  const memberId = Number.parseInt(formData.get("memberId") as string)
  const transactionDate = formData.get("transactionDate") as string
  const transactionType = formData.get("transactionType") as string
  const description = (formData.get("description") as string) || transactionType
  const receiptNo = formData.get("receiptNo") as string
  const year = formData.get("year") as string
  const amount = Number.parseFloat(formData.get("amount") as string) || 0
  const remarks = formData.get("remarks") as string

  // Get current member balances
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("share_balance, bonus_balance, total_balance")
    .eq("id", memberId)
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
  switch (transactionType) {
    case "deposit":
      amountIn = amount
      newShareBalance += amount
      break
    case "withdrawal":
      amountOut = amount
      newShareBalance -= amount
      break
    case "dividend":
      amountIn = amount
      newBonusBalance += amount
      break
    case "fee":
      amountOut = amount
      newShareBalance -= amount
      break
    default:
      if (amount > 0) {
        amountIn = amount
        newShareBalance += amount
      } else {
        amountOut = Math.abs(amount)
        newShareBalance -= Math.abs(amount)
      }
  }

  const newTotalBalance = newShareBalance + newBonusBalance

  // Insert transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert([
      {
        member_id: memberId,
        transaction_date: transactionDate,
        description,
        receipt_no: receiptNo || null,
        year: year || null,
        amount_in: amountIn,
        amount_out: amountOut,
        share_balance: newShareBalance,
        bonus_balance: newBonusBalance,
        total_balance: newTotalBalance,
        remarks: remarks || null,
        created_by: "System",
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)

  if (updateError) {
    console.error("Error updating member balances:", updateError)
    throw new Error("Failed to update member balances")
  }

  revalidatePath(`/members/${memberId}`)
  revalidatePath("/transactions")
  return transaction
}
