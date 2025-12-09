# Backend Services Documentation

This document describes the Supabase backend services for TradaHub's modular feature system.

## Overview

The backend services provide CRUD operations, analytics, and business logic for all TradaHub features. Each service module is designed to be:

- **Type-safe**: Full TypeScript support with generated types from Supabase
- **Modular**: Each feature has its own service file
- **Secure**: Uses Supabase RLS (Row Level Security) for multi-tenant isolation
- **Performant**: Optimized queries with proper filtering and pagination

## File Structure

```
src/lib/supabase/
├── client.ts           # Supabase client initialization
├── types.ts            # TypeScript type definitions
└── services/
    ├── index.ts        # Central export file
    ├── subscriptions.ts # User subscriptions & plan management
    ├── bookings.ts     # Appointments & staff scheduling
    ├── orders.ts       # Restaurant order management
    ├── deliveries.ts   # Delivery & driver tracking
    ├── invoices.ts     # Invoicing & billing
    ├── products.ts     # Inventory management
    ├── customers.ts    # Customer CRM
    ├── transactions.ts # Payment transactions
    ├── notifications.ts # Push notifications
    ├── settings.ts     # User settings
    └── storage.ts      # File storage
```

## Database Schema

The migration file `supabase/migrations/002_services_and_features.sql` creates all required tables with RLS policies.

### Core Tables

| Table | Purpose |
|-------|---------|
| `subscriptions` | User subscription plans |
| `subscription_services` | Services included in custom plans |
| `staff_members` | Staff for bookings |
| `booking_services` | Services offered (haircuts, etc.) |
| `bookings` | Appointment records |
| `menu_items` | Restaurant menu |
| `orders` | Customer orders |
| `order_items` | Items in each order |
| `drivers` | Delivery drivers |
| `deliveries` | Delivery tracking |
| `delivery_status_history` | Delivery status timeline |
| `invoices` | Customer invoices |
| `invoice_items` | Line items on invoices |

---

## Subscriptions Service

**File**: `src/lib/supabase/services/subscriptions.ts`

Manages user subscriptions to TradaHub services.

### Functions

#### `getSubscription(userId: string)`
Get the user's current subscription.

```typescript
const subscription = await getSubscription(userId);
// Returns: Subscription | null
```

#### `createSubscription(subscription: SubscriptionInsert)`
Create a new subscription for a user.

```typescript
const subscription = await createSubscription({
  user_id: userId,
  plan_type: 'growth',
  bundle_id: 'growth',
  monthly_price: 349,
  status: 'active',
});
```

#### `updateSubscription(id: string, updates: SubscriptionUpdate)`
Update subscription details (plan changes, status, etc.).

#### `cancelSubscription(id: string)`
Cancel a subscription (sets status to 'cancelled').

#### `addServiceToSubscription(subscriptionId: string, serviceId: string)`
Add an individual service to a custom plan.

#### `removeServiceFromSubscription(subscriptionId: string, serviceId: string)`
Remove a service from a custom plan.

#### `getSubscriptionServices(subscriptionId: string)`
Get all services included in a subscription.

#### `getUserActiveServices(userId: string)`
Get list of active service IDs for feature gating.

```typescript
const services = await getUserActiveServices(userId);
// Returns: ['dashboard', 'inventory', 'customers', 'payments']
```

#### `checkUserHasService(userId: string, serviceId: string)`
Check if user has access to a specific service.

```typescript
const hasAccess = await checkUserHasService(userId, 'bookings');
// Returns: boolean
```

---

## Bookings Service

**File**: `src/lib/supabase/services/bookings.ts`

Manages appointments, staff, and booking services for salons, consultants, etc.

### Staff Management

#### `getStaffMembers(userId: string)`
Get all active staff members.

#### `createStaffMember(staff: StaffMemberInsert)`
Add a new staff member.

```typescript
const staff = await createStaffMember({
  user_id: userId,
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+27123456789',
  role: 'stylist',
  color: '#10B981', // Calendar color
});
```

#### `updateStaffMember(id: string, updates: StaffMemberUpdate)`
Update staff details.

#### `deleteStaffMember(id: string)`
Soft-delete a staff member (sets `is_active: false`).

### Booking Services

#### `getBookingServices(userId: string)`
Get all services offered (haircuts, consultations, etc.).

#### `createBookingService(service: BookingServiceInsert)`
Add a new service offering.

```typescript
const service = await createBookingService({
  user_id: userId,
  name: 'Haircut',
  description: 'Standard haircut',
  duration_minutes: 30,
  price: 150,
  category: 'Hair',
});
```

### Bookings

#### `getBookings(userId: string, options?)`
Get bookings with filters.

```typescript
const bookings = await getBookings(userId, {
  status: 'confirmed',
  staffId: 'staff-uuid',
  startDate: '2025-12-01',
  endDate: '2025-12-31',
  limit: 50,
});
```

#### `createBooking(booking: BookingInsert)`
Create a new appointment.

```typescript
const booking = await createBooking({
  user_id: userId,
  customer_id: customerId,
  staff_id: staffId,
  service_id: serviceId,
  start_time: '2025-12-05T10:00:00Z',
  end_time: '2025-12-05T10:30:00Z',
  status: 'pending',
});
```

#### `updateBookingStatus(id: string, status: BookingStatus)`
Update booking status (pending → confirmed → completed).

#### `cancelBooking(id: string, reason?: string)`
Cancel a booking with optional reason.

### Analytics

#### `getBookingAnalytics(userId: string)`
Get booking statistics.

```typescript
const stats = await getBookingAnalytics(userId);
// Returns:
// {
//   todayBookings: 8,
//   upcomingBookings: 23,
//   completedThisMonth: 145,
//   cancelledThisMonth: 5,
//   revenueThisMonth: 21750
// }
```

---

## Orders Service

**File**: `src/lib/supabase/services/orders.ts`

Manages restaurant orders, menu items, and order tracking.

### Menu Management

#### `getMenuItems(userId: string, options?)`
Get menu items with filters.

```typescript
const items = await getMenuItems(userId, {
  category: 'Main Course',
  available: true,
});
```

#### `createMenuItem(item: MenuItemInsert)`
Add a new menu item.

```typescript
const item = await createMenuItem({
  user_id: userId,
  name: 'Bunny Chow',
  description: 'Quarter loaf with curry',
  price: 65,
  category: 'Main Course',
  is_available: true,
  preparation_time_minutes: 15,
});
```

#### `updateMenuItem(id: string, updates: MenuItemUpdate)`
Update menu item (price, availability, etc.).

#### `deleteMenuItem(id: string)`
Soft-delete a menu item.

### Orders

#### `getOrders(userId: string, options?)`
Get orders with filters.

```typescript
const orders = await getOrders(userId, {
  status: ['pending', 'preparing'],
  orderType: 'dine_in',
  startDate: '2025-12-04',
});
```

#### `createOrder(order: OrderInsert, items: OrderItemInsert[])`
Create a new order with items.

```typescript
const order = await createOrder(
  {
    user_id: userId,
    customer_name: 'John',
    order_type: 'dine_in',
    table_number: '5',
  },
  [
    { menu_item_id: item1Id, quantity: 2, unit_price: 65 },
    { menu_item_id: item2Id, quantity: 1, unit_price: 35 },
  ]
);
```

#### `updateOrderStatus(id: string, status: OrderStatus)`
Update order status through workflow.

**Status Flow**: `pending` → `confirmed` → `preparing` → `ready` → `served` → `completed`

#### `getOrderItems(orderId: string)`
Get all items in an order.

### Analytics

#### `getOrderAnalytics(userId: string)`
Get order statistics.

```typescript
const stats = await getOrderAnalytics(userId);
// Returns:
// {
//   todayOrders: 42,
//   pendingOrders: 5,
//   revenueToday: 3250,
//   avgOrderValue: 77
// }
```

---

## Deliveries Service

**File**: `src/lib/supabase/services/deliveries.ts`

Manages delivery drivers, tracking, and status history.

### Driver Management

#### `getDrivers(userId: string)`
Get all active drivers.

#### `getAvailableDrivers(userId: string)`
Get drivers currently available for assignment.

#### `createDriver(driver: DriverInsert)`
Add a new driver.

```typescript
const driver = await createDriver({
  user_id: userId,
  name: 'Mike Driver',
  phone: '+27123456789',
  vehicle_type: 'motorcycle',
  vehicle_registration: 'ABC 123 GP',
  is_available: true,
});
```

#### `updateDriverAvailability(id: string, isAvailable: boolean)`
Toggle driver availability.

#### `updateDriverLocation(id: string, location: { lat: number; lng: number })`
Update driver's current GPS location.

### Deliveries

#### `getDeliveries(userId: string, options?)`
Get deliveries with filters.

```typescript
const deliveries = await getDeliveries(userId, {
  status: ['pending', 'in_transit'],
  driverId: 'driver-uuid',
  startDate: '2025-12-01',
});
```

#### `createDelivery(delivery: DeliveryInsert)`
Create a new delivery (auto-generates tracking number).

```typescript
const delivery = await createDelivery({
  user_id: userId,
  order_id: orderId,
  pickup_address: '123 Shop Street',
  delivery_address: '456 Customer Ave',
  customer_name: 'Customer Name',
  customer_phone: '+27123456789',
  estimated_delivery_time: '2025-12-04T14:30:00Z',
});
// tracking_number auto-generated: "TRK-XXXXXX"
```

#### `assignDriver(deliveryId: string, driverId: string)`
Assign a driver to a delivery.

#### `updateDeliveryStatus(id: string, status: DeliveryStatus, location?, notes?)`
Update delivery status with optional GPS and notes.

**Status Flow**: `pending` → `assigned` → `picked_up` → `in_transit` → `delivered`

#### `markDeliveryAsDelivered(id: string, proofPhotoUrl?, signatureUrl?, notes?)`
Complete a delivery with proof of delivery.

#### `rateDelivery(id: string, rating: number, feedback?: string)`
Customer rates the delivery (1-5 stars).

### Status History

#### `getDeliveryStatusHistory(deliveryId: string)`
Get full timeline of delivery status changes.

#### `getDeliveryByTrackingNumber(trackingNumber: string)`
Look up delivery by tracking number (for customers).

### Analytics

#### `getDeliveryStats(userId: string)`
Get delivery statistics.

```typescript
const stats = await getDeliveryStats(userId);
// Returns:
// {
//   todayDeliveries: 15,
//   activeDeliveries: 4,
//   completedToday: 11,
//   avgDeliveryTime: 28  // minutes
// }
```

---

## Invoices Service

**File**: `src/lib/supabase/services/invoices.ts`

Manages professional invoicing with tax calculations.

### Invoices

#### `getInvoices(userId: string, options?)`
Get invoices with filters.

```typescript
const invoices = await getInvoices(userId, {
  status: ['sent', 'overdue'],
  customerId: 'customer-uuid',
  overdue: true,
});
```

#### `createInvoice(invoice: InvoiceInsert, items: InvoiceItemInsert[])`
Create invoice with line items (auto-generates invoice number).

```typescript
const invoice = await createInvoice(
  {
    user_id: userId,
    customer_id: customerId,
    customer_name: 'ABC Company',
    customer_email: 'accounts@abc.com',
    due_date: '2025-12-15',
    tax_rate: 15, // VAT %
    notes: 'Thank you for your business',
  },
  [
    { description: 'Web Design', quantity: 1, unit_price: 5000, total: 5000 },
    { description: 'Hosting (1 year)', quantity: 1, unit_price: 1200, total: 1200 },
  ]
);
// invoice_number auto-generated: "INV-000001"
```

#### `updateInvoice(id: string, updates: InvoiceUpdate)`
Update invoice details.

#### `deleteInvoice(id: string)`
Delete invoice and all items.

### Invoice Actions

#### `markInvoiceAsSent(id: string)`
Mark invoice as sent to customer.

#### `markInvoiceAsViewed(id: string)`
Mark invoice as viewed (for email tracking).

#### `markInvoiceAsPaid(id: string, paymentMethod?: string)`
Mark invoice as fully paid.

#### `recordPartialPayment(id: string, amount: number, paymentMethod?: string)`
Record a partial payment (updates balance_due).

#### `cancelInvoice(id: string)`
Cancel an invoice.

### Invoice Items

#### `getInvoiceItems(invoiceId: string)`
Get all line items for an invoice.

#### `addInvoiceItem(item: InvoiceItemInsert)`
Add a line item (auto-recalculates totals).

#### `updateInvoiceItem(id: string, updates: Partial<InvoiceItemInsert>)`
Update a line item (auto-recalculates totals).

#### `deleteInvoiceItem(id: string, invoiceId: string)`
Remove a line item (auto-recalculates totals).

### Analytics

#### `getInvoiceStats(userId: string)`
Get invoicing statistics.

```typescript
const stats = await getInvoiceStats(userId);
// Returns:
// {
//   totalOutstanding: 45000,
//   overdueCount: 3,
//   overdueAmount: 12500,
//   paidThisMonth: 87500,
//   totalInvoicesThisMonth: 12
// }
```

#### `getOverdueInvoices(userId: string)`
Get all overdue invoices.

---

## Usage in Components

### Import Services

```typescript
import {
  getBookings,
  createBooking,
  getOrders,
  getDeliveryStats,
  getInvoiceStats,
} from '@/lib/supabase/services';
```

### With React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, createBooking } from '@/lib/supabase/services';

function BookingsPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', userId],
    queryFn: () => getBookings(userId),
  });

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
    },
  });

  // ...
}
```

### Error Handling

All service functions throw errors on failure. Use try-catch:

```typescript
try {
  const booking = await createBooking(bookingData);
  toast.success('Booking created!');
} catch (error) {
  console.error('Failed to create booking:', error);
  toast.error('Could not create booking');
}
```

---

## Feature Gating

Use the subscription service to gate features:

```typescript
import { checkUserHasService } from '@/lib/supabase/services';

async function BookingsPage() {
  const hasAccess = await checkUserHasService(userId, 'bookings');
  
  if (!hasAccess) {
    return <UpgradePrompt service="bookings" />;
  }

  // Render bookings UI
}
```

---

## Security (RLS Policies)

All tables have Row Level Security policies that:

1. **SELECT**: Users can only read their own data (`user_id = auth.uid()`)
2. **INSERT**: Users can only create records with their own `user_id`
3. **UPDATE**: Users can only modify their own records
4. **DELETE**: Users can only delete their own records

The RLS policies are defined in the migration file.

---

## Type Definitions

All TypeScript types are generated from the database schema and exported from `src/lib/supabase/types.ts`:

```typescript
import type {
  Booking,
  BookingInsert,
  Order,
  Delivery,
  Invoice,
  // ... etc
} from '@/lib/supabase/types';
```

---

## Related Documentation

- [Services & Pricing](./services-and-pricing.md) - Pricing model and service catalog
- [Blueprint](./blueprint.md) - Overall project architecture
