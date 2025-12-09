# Services Catalog & Pricing System

This document describes the modular services architecture and pricing system for TradaHub.

## Overview

TradaHub offers a flexible pricing model that allows customers to either:
1. **Choose a pre-built bundle** (Starter, Growth, Pro) for simplified onboarding
2. **Build a custom plan** by selecting individual services they need

## Architecture

### File Structure

```
src/
├── lib/
│   └── services/
│       └── catalog.ts      # Service definitions, bundles, and pricing logic
└── app/
    └── pricing/
        └── page.tsx        # Public pricing page UI
```

## Service Catalog (`src/lib/services/catalog.ts`)

### Types

#### `ServiceId`
Union type of all available service identifiers:
```typescript
type ServiceId =
  | 'dashboard'
  | 'inventory'
  | 'customers'
  | 'payments'
  | 'airtime'
  | 'bookings'
  | 'deliveries'
  | 'invoices'
  | 'reports'
  | 'orders'
  | 'cart';
```

#### `ServiceCategory`
Groups services into logical categories:
```typescript
type ServiceCategory =
  | 'core'              // Essential business tools
  | 'sales_and_customers' // Sales and CRM tools
  | 'operations'        // Day-to-day operations
  | 'advanced';         // Analytics and professional tools
```

#### `ServiceDefinition`
Complete service metadata:
```typescript
interface ServiceDefinition {
  id: ServiceId;
  name: string;
  slug: string;
  description: string;
  category: ServiceCategory;
  baseMonthlyPrice: number;  // In ZAR
  recommendedFor: string;
  route?: string;            // App route (e.g., '/inventory')
  badge?: 'popular' | 'new' | 'beta';
  features?: string[];
}
```

#### `BundleDefinition`
Pre-configured package:
```typescript
interface BundleDefinition {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;      // In ZAR
  services: ServiceId[];
  badge?: 'best_value' | 'starter' | 'popular';
  recommendedFor: string;
  savings?: number;          // Percentage saved
}
```

### Available Services

| Service | Category | Price (ZAR) | Route |
|---------|----------|-------------|-------|
| Dashboard | Core | Free | `/dashboard` |
| Inventory Management | Core | R79/mo | `/inventory` |
| Customer Management | Sales & Customers | R69/mo | `/customers` |
| Payments & QR | Sales & Customers | R89/mo | `/payments` |
| Airtime & Data | Sales & Customers | R49/mo | `/airtime-data` |
| Bookings & Appointments | Operations | R79/mo | `/bookings` |
| Order Management | Operations | R69/mo | `/orders` |
| Delivery Tracking | Operations | R79/mo | `/deliveries` |
| Invoicing | Advanced | R59/mo | `/invoices` |
| Reports & Analytics | Advanced | R99/mo | `/reports` |
| Cart & Checkout | Sales & Customers | R89/mo | `/cart` |

### Available Bundles

| Bundle | Services | Price | Savings |
|--------|----------|-------|---------|
| **Starter** | Dashboard, Inventory, Customers, Payments | R149/mo | 35% |
| **Growth** | Starter + Airtime, Bookings, Invoices | R349/mo | 30% |
| **Pro** | All 11 services | R549/mo | 40% |

### Helper Functions

#### `calculateCustomPlanPrice(serviceIds: ServiceId[])`
Calculates pricing with automatic discount:
- **10% discount** when selecting 4 or more services

```typescript
const result = calculateCustomPlanPrice(['inventory', 'customers', 'payments', 'bookings']);
// Returns:
// {
//   baseTotal: 316,
//   discount: 32,          // 10% off
//   discountPercentage: 10,
//   finalTotal: 284,
//   serviceCount: 4
// }
```

#### `calculateBundleSavings(bundle: BundleDefinition)`
Shows how much customers save with a bundle vs individual pricing.

#### `getServicesGroupedByCategory()`
Returns services organized by category for UI rendering.

#### `formatPrice(amount: number)`
Formats price in ZAR: `formatPrice(149)` → `"R149"`

#### `generateCustomPlanParams(serviceIds: ServiceId[])`
Generates URL query params for redirects:
```typescript
generateCustomPlanParams(['inventory', 'payments'])
// Returns: "plan=custom&services=inventory,payments"
```

## Pricing Page (`src/app/pricing/page.tsx`)

### Features

1. **Packages Tab**
   - Displays all bundles as cards
   - Shows included services, pricing, and savings
   - "Select" button marks bundle as chosen

2. **Build Your Own Tab**
   - Services grouped by category
   - Toggle switches to add/remove services
   - Real-time price calculation in summary sidebar
   - Automatic 10% discount for 4+ services

### State Management

```typescript
const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
const [selectedServices, setSelectedServices] = useState<ServiceId[]>([]);
```

### Navigation Entry Points

The pricing page is accessible from:
- Landing page (`/onboarding`) - "Pricing" nav link
- Login page (`/login`) - "View pricing plans" link
- Signup page (`/signup`) - "View pricing plans" link
- App sidebar - "Upgrade Plan" menu item

## Future Integration

### Supabase Schema (Implemented)

The database schema is now implemented in `supabase/migrations/002_services_and_features.sql`.

See [Backend Services Documentation](./backend-services.md) for full CRUD operations and usage.

```sql
-- User subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  plan_type VARCHAR(20) NOT NULL, -- 'starter', 'growth', 'pro', 'custom'
  bundle_id VARCHAR(50),
  monthly_price INTEGER NOT NULL,
  status subscription_status DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services in custom plans
CREATE TABLE subscription_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  service_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Service Functions

```typescript
import { 
  getSubscription, 
  getUserActiveServices,
  checkUserHasService 
} from '@/lib/supabase/services';

// Get user's active services for feature gating
const services = await getUserActiveServices(userId);
// Returns: ['dashboard', 'inventory', 'customers', 'payments']

// Check if user has access to a specific service
const hasBookings = await checkUserHasService(userId, 'bookings');
```

### Redirect Implementation

When ready to connect to signup:

```typescript
// In handleBundleSelect:
router.push(`/signup?plan=${bundleId}`);

// In handleCustomPlanContinue:
const params = generateCustomPlanParams(selectedServices);
router.push(`/signup?${params}`);
```

### Signup Page Integration

Parse the URL params in the signup page:

```typescript
import { parseServiceIds } from '@/lib/services/catalog';

const searchParams = useSearchParams();
const plan = searchParams.get('plan');
const servicesParam = searchParams.get('services');

if (plan === 'custom' && servicesParam) {
  const services = parseServiceIds(servicesParam);
  // Use services array
}
```

## Design Decisions

1. **Declarative Catalog**: All service/bundle data is in a single TypeScript file for easy maintenance and type safety.

2. **No Database Dependency**: The catalog works without a database, making it easy to test and deploy.

3. **Progressive Disclosure**: Bundles shown first for simplicity; custom plans for power users.

4. **Discount Strategy**: 10% discount at 4+ services encourages larger subscriptions while keeping flexibility.

5. **ZAR Pricing**: All prices in South African Rand, formatted with `R` prefix.
