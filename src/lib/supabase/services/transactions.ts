import { createClient } from "@/lib/supabase/client"
import type { Transaction, TransactionInsert, TransactionUpdate } from "@/lib/supabase/types"

// Get Supabase client
const getClient = () => createClient()

// Fetch all transactions for a user
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    throw error
  }

  return data || []
}

// Fetch a single transaction by ID
export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .single()

  if (error) {
    console.error("Error fetching transaction:", error)
    return null
  }

  return data
}

// Fetch transaction by reference
export async function getTransactionByReference(reference: string): Promise<Transaction | null> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("reference", reference)
    .single()

  if (error) {
    console.error("Error fetching transaction by reference:", error)
    return null
  }

  return data
}

// Create a new transaction
export async function createTransaction(transaction: TransactionInsert): Promise<Transaction> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .insert(transaction)
    .select()
    .single()

  if (error) {
    console.error("Error creating transaction:", error)
    throw error
  }

  return data
}

// Update a transaction
export async function updateTransaction(transactionId: string, updates: TransactionUpdate): Promise<Transaction> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", transactionId)
    .select()
    .single()

  if (error) {
    console.error("Error updating transaction:", error)
    throw error
  }

  return data
}

// Update transaction status
export async function updateTransactionStatus(
  transactionId: string, 
  status: "pending" | "completed" | "failed" | "refunded"
): Promise<Transaction> {
  return updateTransaction(transactionId, { status })
}

// Delete a transaction
export async function deleteTransaction(transactionId: string): Promise<void> {
  const supabase = getClient()
  
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)

  if (error) {
    console.error("Error deleting transaction:", error)
    throw error
  }
}

// Get transactions by date range
export async function getTransactionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions by date range:", error)
    throw error
  }

  return data || []
}

// Get transactions by status
export async function getTransactionsByStatus(
  userId: string,
  status: "pending" | "completed" | "failed" | "refunded"
): Promise<Transaction[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions by status:", error)
    throw error
  }

  return data || []
}

// Get recent transactions (last N transactions)
export async function getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent transactions:", error)
    throw error
  }

  return data || []
}

// Get today's transactions
export async function getTodayTransactions(userId: string): Promise<Transaction[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return getTransactionsByDateRange(
    userId,
    today.toISOString(),
    tomorrow.toISOString()
  )
}

// Get total sales for a period
export async function getTotalSales(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<number> {
  const supabase = getClient()
  
  let query = supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("status", "completed")

  if (startDate) {
    query = query.gte("created_at", startDate)
  }
  if (endDate) {
    query = query.lte("created_at", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error calculating total sales:", error)
    throw error
  }

  return (data || []).reduce((sum, t) => sum + (t.amount || 0), 0)
}

// Get transaction count for a period
export async function getTransactionCount(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<number> {
  const supabase = getClient()
  
  let query = supabase
    .from("transactions")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed")

  if (startDate) {
    query = query.gte("created_at", startDate)
  }
  if (endDate) {
    query = query.lte("created_at", endDate)
  }

  const { count, error } = await query

  if (error) {
    console.error("Error counting transactions:", error)
    throw error
  }

  return count || 0
}

// Get sales by payment method
export async function getSalesByPaymentMethod(userId: string): Promise<Record<string, number>> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("transactions")
    .select("payment_method, amount")
    .eq("user_id", userId)
    .eq("status", "completed")

  if (error) {
    console.error("Error fetching sales by payment method:", error)
    throw error
  }

  const result: Record<string, number> = {}
  
  for (const transaction of data || []) {
    const method = transaction.payment_method || "other"
    result[method] = (result[method] || 0) + (transaction.amount || 0)
  }

  return result
}

// Generate unique reference
export function generateTransactionReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TH-${timestamp}-${random}`
}
