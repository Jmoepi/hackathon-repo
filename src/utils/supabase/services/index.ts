// Export all Supabase services
export * from "./products"
export * from "./transactions"
export * from "./customers"
export * from "./notifications"
export * from "./subscriptions"
export * from "./bookings"
export * from "./orders"
export * from "./deliveries"
export * from "./invoices"
export * from "./settings"
export * from "./storage"

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
  // Subscriptions
  Subscription,
  SubscriptionInsert,
  SubscriptionUpdate,
  SubscriptionService,
  SubscriptionServiceInsert,
  // Bookings
  StaffMember,
  StaffMemberInsert,
  StaffMemberUpdate,
  BookingService,
  BookingServiceInsert,
  BookingServiceUpdate,
  Booking,
  BookingInsert,
  BookingUpdate,
  // Orders
  MenuItem,
  MenuItemInsert,
  MenuItemUpdate,
  Order,
  OrderInsert,
  OrderUpdate,
  OrderItem,
  OrderItemInsert,
  // Deliveries
  Driver,
  DriverInsert,
  DriverUpdate,
  Delivery,
  DeliveryInsert,
  DeliveryUpdate,
  DeliveryStatusHistory,
  DeliveryStatusHistoryInsert,
  // Invoices
  Invoice,
  InvoiceInsert,
  InvoiceUpdate,
  InvoiceItem,
  InvoiceItemInsert,
} from "@/lib/supabase/types"
