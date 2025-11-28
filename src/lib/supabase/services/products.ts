import { createClient } from "@/lib/supabase/client"
import type { Product, ProductInsert, ProductUpdate } from "@/lib/supabase/types"

// Get Supabase client
const getClient = () => createClient()

// Fetch all products for a user
export async function getProducts(userId: string): Promise<Product[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    throw error
  }

  return data || []
}

// Fetch a single product by ID
export async function getProduct(productId: string): Promise<Product | null> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data
}

// Create a new product
export async function createProduct(product: ProductInsert): Promise<Product> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()

  if (error) {
    console.error("Error creating product:", error)
    throw error
  }

  return data
}

// Update a product
export async function updateProduct(productId: string, updates: ProductUpdate): Promise<Product> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select()
    .single()

  if (error) {
    console.error("Error updating product:", error)
    throw error
  }

  return data
}

// Delete a product
export async function deleteProduct(productId: string): Promise<void> {
  const supabase = getClient()
  
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)

  if (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// Update product stock
export async function updateProductStock(productId: string, quantity: number): Promise<Product> {
  const supabase = getClient()
  
  // First get current stock
  const { data: current, error: fetchError } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single()

  if (fetchError || !current) {
    throw fetchError || new Error("Product not found")
  }

  const newStock = Math.max(0, (current.stock || 0) + quantity)

  const { data, error } = await supabase
    .from("products")
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select()
    .single()

  if (error) {
    console.error("Error updating stock:", error)
    throw error
  }

  return data
}

// Increment units sold
export async function incrementUnitsSold(productId: string, quantity: number): Promise<void> {
  const supabase = getClient()
  
  const { data: current, error: fetchError } = await supabase
    .from("products")
    .select("units_sold, stock")
    .eq("id", productId)
    .single()

  if (fetchError || !current) {
    throw fetchError || new Error("Product not found")
  }

  const { error } = await supabase
    .from("products")
    .update({
      units_sold: (current.units_sold || 0) + quantity,
      stock: Math.max(0, (current.stock || 0) - quantity),
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)

  if (error) {
    console.error("Error incrementing units sold:", error)
    throw error
  }
}

// Get low stock products
export async function getLowStockProducts(userId: string): Promise<Product[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching low stock products:", error)
    throw error
  }

  // Filter products where stock is below threshold
  return (data || []).filter(product => 
    product.stock !== null && 
    product.low_stock_threshold !== null && 
    product.stock <= product.low_stock_threshold
  )
}

// Search products
export async function searchProducts(userId: string, query: string): Promise<Product[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .ilike("name", `%${query}%`)
    .order("name")

  if (error) {
    console.error("Error searching products:", error)
    throw error
  }

  return data || []
}

// Get products by category
export async function getProductsByCategory(userId: string, category: string): Promise<Product[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .order("name")

  if (error) {
    console.error("Error fetching products by category:", error)
    throw error
  }

  return data || []
}

// Get product categories for a user
export async function getProductCategories(userId: string): Promise<string[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("user_id", userId)
    .not("category", "is", null)

  if (error) {
    console.error("Error fetching categories:", error)
    throw error
  }

  // Get unique categories
  const categories = [...new Set((data || []).map(p => p.category).filter(Boolean))]
  return categories as string[]
}
