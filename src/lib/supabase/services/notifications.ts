import { createClient } from "@/lib/supabase/client"
import type { Notification, NotificationInsert } from "@/lib/supabase/types"

// Get Supabase client
const getClient = () => createClient()

// Fetch all notifications for a user
export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }

  return data || []
}

// Fetch unread notifications
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("read", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching unread notifications:", error)
    throw error
  }

  return data || []
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = getClient()
  
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) {
    console.error("Error counting unread notifications:", error)
    throw error
  }

  return count || 0
}

// Create a new notification
export async function createNotification(notification: NotificationInsert): Promise<Notification> {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single()

  if (error) {
    console.error("Error creating notification:", error)
    throw error
  }

  return data
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const supabase = getClient()
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)

  if (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = getClient()
  
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = getClient()
  
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)

  if (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

// Delete all read notifications
export async function deleteReadNotifications(userId: string): Promise<void> {
  const supabase = getClient()
  
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId)
    .eq("read", true)

  if (error) {
    console.error("Error deleting read notifications:", error)
    throw error
  }
}

// Create notification helpers for different types
export async function createSaleNotification(
  userId: string,
  amount: number,
  productName?: string
): Promise<Notification> {
  return createNotification({
    user_id: userId,
    type: "sale",
    title: "New Sale",
    message: productName 
      ? `You sold ${productName} for R${amount.toFixed(2)}`
      : `You made a sale of R${amount.toFixed(2)}`,
    action_url: "/payments",
  })
}

export async function createLowStockNotification(
  userId: string,
  productName: string,
  currentStock: number
): Promise<Notification> {
  return createNotification({
    user_id: userId,
    type: "inventory",
    title: "Low Stock Alert",
    message: `${productName} is running low (${currentStock} remaining)`,
    action_url: "/inventory",
  })
}

export async function createPaymentNotification(
  userId: string,
  amount: number,
  reference: string,
  success: boolean
): Promise<Notification> {
  return createNotification({
    user_id: userId,
    type: "payment",
    title: success ? "Payment Received" : "Payment Failed",
    message: success
      ? `Payment of R${amount.toFixed(2)} received (Ref: ${reference})`
      : `Payment of R${amount.toFixed(2)} failed (Ref: ${reference})`,
    action_url: "/payments",
  })
}

export async function createCustomerNotification(
  userId: string,
  customerName: string,
  isNew: boolean
): Promise<Notification> {
  return createNotification({
    user_id: userId,
    type: "customer",
    title: isNew ? "New Customer" : "Returning Customer",
    message: isNew
      ? `${customerName} just made their first purchase!`
      : `${customerName} made another purchase`,
    action_url: "/customers",
  })
}

export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<Notification> {
  return createNotification({
    user_id: userId,
    type: "system",
    title,
    message,
    action_url: actionUrl || null,
  })
}
