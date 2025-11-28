import { createClient } from "@/lib/supabase/client"
import type { Customer, CustomerInsert, CustomerUpdate } from "@/lib/supabase/types"

// Get Supabase client
const getClient = () => createClient()

// Fetch all customers for a user
export async function getCustomers(userId: string): Promise<Customer[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching customers:", error)
    throw error
  }

  return data || []
}

// Fetch a single customer by ID
export async function getCustomer(customerId: string): Promise<Customer | null> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single()

  if (error) {
    console.error("Error fetching customer:", error)
    return null
  }

  return data
}

// Fetch customer by phone number
export async function getCustomerByPhone(userId: string, phone: string): Promise<Customer | null> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .eq("phone", phone)
    .single()

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
    console.error("Error fetching customer by phone:", error)
  }

  return data || null
}

// Create a new customer
export async function createCustomer(customer: CustomerInsert): Promise<Customer> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single()

  if (error) {
    console.error("Error creating customer:", error)
    throw error
  }

  return data
}

// Update a customer
export async function updateCustomer(customerId: string, updates: CustomerUpdate): Promise<Customer> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("customers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", customerId)
    .select()
    .single()

  if (error) {
    console.error("Error updating customer:", error)
    throw error
  }

  return data
}

// Delete a customer
export async function deleteCustomer(customerId: string): Promise<void> {
  const supabase = getClient()
  
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)

  if (error) {
    console.error("Error deleting customer:", error)
    throw error
  }
}

// Update customer purchase stats after a sale
export async function updateCustomerPurchaseStats(
  customerId: string,
  purchaseAmount: number
): Promise<Customer> {
  const supabase = getClient()
  
  // Get current stats
  const { data: current, error: fetchError } = await supabase
    .from("customers")
    .select("total_purchases")
    .eq("id", customerId)
    .single()

  if (fetchError || !current) {
    throw fetchError || new Error("Customer not found")
  }

  const { data, error } = await supabase
    .from("customers")
    .update({
      total_purchases: (current.total_purchases || 0) + purchaseAmount,
      last_purchase: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId)
    .select()
    .single()

  if (error) {
    console.error("Error updating customer purchase stats:", error)
    throw error
  }

  return data
}

// Search customers
export async function searchCustomers(userId: string, query: string): Promise<Customer[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .order("name")

  if (error) {
    console.error("Error searching customers:", error)
    throw error
  }

  return data || []
}

// Get top customers by total purchases
export async function getTopCustomers(userId: string, limit: number = 10): Promise<Customer[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("total_purchases", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching top customers:", error)
    throw error
  }

  return data || []
}

// Get recent customers (recently added)
export async function getRecentCustomers(userId: string, limit: number = 10): Promise<Customer[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent customers:", error)
    throw error
  }

  return data || []
}

// Get active customers (purchased recently)
export async function getActiveCustomers(userId: string, daysAgo: number = 30): Promise<Customer[]> {
  const supabase = getClient()
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .gte("last_purchase", cutoffDate.toISOString())
    .order("last_purchase", { ascending: false })

  if (error) {
    console.error("Error fetching active customers:", error)
    throw error
  }

  return data || []
}

// Get customer count
export async function getCustomerCount(userId: string): Promise<number> {
  const supabase = getClient()
  
  const { count, error } = await supabase
    .from("customers")
    .select("id", { count: "exact" })
    .eq("user_id", userId)

  if (error) {
    console.error("Error counting customers:", error)
    throw error
  }

  return count || 0
}

// Get or create customer
export async function getOrCreateCustomer(
  userId: string,
  phone: string,
  name?: string,
  email?: string
): Promise<Customer> {
  // Try to find existing customer
  const existing = await getCustomerByPhone(userId, phone)
  
  if (existing) {
    return existing
  }

  // Create new customer
  return createCustomer({
    user_id: userId,
    phone,
    name: name || "Unknown Customer",
    email: email || null,
    total_spent: 0,
  })
}
