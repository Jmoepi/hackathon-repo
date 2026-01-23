# TradaHub - Copilot Instructions

## Project Overview
TradaHub is a mobile-first business toolkit for South African SMEs built with **Next.js 15 (App Router)**, **Supabase** (PostgreSQL + Auth), and **Stitch Money** for payments. The app uses a modular service-based architecture where features are gated by subscription plans.

## Tech Stack & Key Dependencies
- **Framework**: Next.js 15 with Turbopack (`pnpm dev`)
- **Database/Auth**: Supabase (PostgreSQL + Row Level Security)
- **Payments**: Stitch Money (SA Pay-by-Bank, disbursements)
- **UI**: Tailwind CSS + shadcn/ui + Radix primitives
- **State**: React Context (`AuthContext`, `ShopContext`, `SubscriptionContext`)
- **Icons**: Lucide React

## Architecture Patterns

### Route Structure
```
src/app/
├── (app)/           # Protected routes (dashboard, inventory, etc.)
├── api/             # API routes (subscriptions, webhooks, payments)
├── auth/            # OAuth callbacks, password reset
├── login|signup/    # Public auth pages
```
- **All `(app)/*` routes are protected** - enforced by `src/middleware.ts`
- Protected routes are wrapped with `<ProtectedRoute>` from [src/components/auth/protected-route.tsx](src/components/auth/protected-route.tsx)

### Service Layer Pattern
Each feature has a dedicated service file in [src/lib/supabase/services/](src/lib/supabase/services/):
```typescript
// Example: src/lib/supabase/services/products.ts
export async function getProducts(userId: string): Promise<Product[]>
export async function createProduct(product: ProductInsert): Promise<Product>
```
- Services use the Supabase client from `src/lib/supabase/client.ts`
- Types are defined in `src/lib/supabase/types.ts`
- RLS policies ensure multi-tenant data isolation

### Context Providers (in order of nesting)
1. `AuthContext` - User auth state, login/logout, profile management
2. `SubscriptionContext` - Plan/service access, feature gating
3. `ShopContext` - Products, transactions, customers for current user

### Feature Gating
Services are gated using `<ServiceGate serviceId="...">` wrapper:
```tsx
// src/app/(app)/inventory/page.tsx
<ServiceGate serviceId="inventory">
  <InventoryContent />
</ServiceGate>
```
Service definitions live in [src/lib/services/catalog.ts](src/lib/services/catalog.ts) with IDs like `dashboard`, `inventory`, `customers`, `payments`, `bookings`, etc.

## Database Conventions

### Migrations
Located in `supabase/migrations/`. Key files:
- `002_services_and_features.sql` - Core business tables
- `20260124_subscriptions_and_payments.sql` - Subscriptions & payments

### Standard Table Patterns
- All tables use `UUID` primary keys with `gen_random_uuid()`
- Include `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- Timestamps: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at` with trigger
- Enable RLS: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- Standard policies: `auth.uid() = user_id` for SELECT/INSERT/UPDATE

### Amounts
Store monetary values in **cents** (INTEGER): `amount_cents`, `platform_fee_cents`

## Stitch Money Integration
- Client library: [src/lib/payments/stitch.ts](src/lib/payments/stitch.ts)
- Webhooks: [src/app/api/webhooks/stitch/route.ts](src/app/api/webhooks/stitch/route.ts)
- Platform takes 5% fee on customer payments, 95% disbursed to merchant
- Subscription plans: Starter (Free), Growth (R199), Pro (R499)

## Key Commands
```bash
pnpm dev              # Start dev server with Turbopack on port 3000
pnpm build            # Production build
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check (tsc --noEmit)
```

## UI Component Patterns
- Use shadcn/ui components from `src/components/ui/`
- Form handling: `react-hook-form` + `@hookform/resolvers` + `zod`
- Toast notifications: `useToast()` hook from `src/hooks/use-toast.ts`
- Mobile detection: `useMobile()` hook, responsive sidebar + bottom nav

## File Naming
- React components: `kebab-case.tsx` (e.g., `sidebar-nav.tsx`)
- Services: `{feature}.ts` in `src/lib/supabase/services/`
- API routes: `route.ts` in appropriate `src/app/api/` subfolder

## Important Files to Know
| Purpose | Location |
|---------|----------|
| Auth logic | [src/context/AuthContext.tsx](src/context/AuthContext.tsx) |
| Route protection | [src/middleware.ts](src/middleware.ts) |
| Feature gating | [src/components/service-gate.tsx](src/components/service-gate.tsx) |
| Service catalog | [src/lib/services/catalog.ts](src/lib/services/catalog.ts) |
| Supabase client | [src/lib/supabase/client.ts](src/lib/supabase/client.ts) |
| Stitch payments | [src/lib/payments/stitch.ts](src/lib/payments/stitch.ts) |
| DB schema | [supabase/schema.sql](supabase/schema.sql), [migrations/](supabase/migrations/) |
