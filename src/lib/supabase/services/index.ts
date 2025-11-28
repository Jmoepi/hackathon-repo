// Export all Supabase services
export * from "./products"
export * from "./transactions"
export * from "./customers"
export * from "./notifications"

// Re-export types for convenience
export type {
  Product,
  ProductInsert,
  ProductUpdate,
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  Customer,
  CustomerInsert,
  CustomerUpdate,
  Notification,
  NotificationInsert,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  SmsCampaign,
  SmsCampaignInsert,
  SmsCampaignUpdate,
} from "@/lib/supabase/types"
