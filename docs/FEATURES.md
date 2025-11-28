# TradaHub Features Documentation

## Overview

TradaHub is a comprehensive business toolkit designed for township traders and small business owners. This document outlines the key features and their implementation details.

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Profile](#user-profile)
3. [Settings](#settings)
4. [Dashboard](#dashboard)
5. [Storage](#storage)
6. [Database Schema](#database-schema)

---

## Authentication

### Implementation
- **Provider**: Supabase Auth
- **Methods Supported**:
  - Email/Password signup with OTP verification
  - Google OAuth
  - Magic link (email)

### Auth Flow
1. User signs up with email/password
2. OTP sent to email for verification
3. User verifies OTP on `/verify-otp` page
4. Profile created automatically on first sign-in
5. User redirected to `/onboarding` or `/dashboard`

### Key Files
- `src/context/AuthContext.tsx` - Main auth context with all auth methods
- `src/app/login/page.tsx` - Login page with Suspense boundary
- `src/app/signup/page.tsx` - Signup page
- `src/app/verify-otp/page.tsx` - OTP verification with Suspense boundary
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/middleware.ts` - Route protection middleware

### Protected Routes
All routes under `/(app)/*` are protected and require authentication.

---

## User Profile

### Features
- View and edit personal information
- Upload profile picture (avatar)
- Track transaction history
- View account statistics

### Profile Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key (from auth.users) |
| `email` | string | User's email address |
| `full_name` | string | Display name |
| `phone` | string | Phone number |
| `business_name` | string | Business/shop name |
| `business_type` | string | Type of business |
| `location` | string | Business location |
| `id_number` | string | National ID number |
| `date_of_birth` | date | User's date of birth |
| `avatar_url` | string | URL to profile picture |
| `created_at` | timestamp | Account creation date |
| `updated_at` | timestamp | Last profile update |

### Avatar Upload
- **Storage Bucket**: `avatars`
- **Max Size**: 5MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Fallback**: User initials displayed when no avatar

### Key Files
- `src/app/(app)/profile/page.tsx` - Profile page component
- `src/lib/supabase/services/storage.ts` - Avatar upload functions
- `src/lib/supabase/services/profiles.ts` - Profile CRUD operations

---

## Settings

### Features
- Notification preferences (push & email)
- Receipt customization
- Payment preferences
- Theme toggle (light/dark)
- Auto-save on change

### Settings Fields
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `notifications_push` | boolean | true | Enable push notifications |
| `notifications_email` | boolean | true | Enable email notifications |
| `receipt_show_business_name` | boolean | true | Show business name on receipts |
| `receipt_show_address` | boolean | true | Show address on receipts |
| `receipt_show_phone` | boolean | true | Show phone on receipts |
| `payment_default_method` | string | 'cash' | Default payment method |
| `payment_enable_partial` | boolean | false | Allow partial payments |
| `theme` | string | 'system' | UI theme preference |

### Key Files
- `src/app/(app)/settings/page.tsx` - Settings page component
- `src/lib/supabase/services/settings.ts` - Settings CRUD operations

### Auto-Save Behavior
Settings are automatically saved to Supabase when changed. Theme changes also persist to localStorage for immediate application.

---

## Dashboard

### Features
- Business metrics overview
- Sales chart visualization
- Recent transactions
- Low stock alerts
- Profile completion banner

### Profile Completion Banner
Shows a progress indicator and lists missing profile fields to encourage users to complete their profile.

**Tracked Fields**:
- Full name
- Phone number
- Business name
- Business type
- Location
- Avatar

### Key Files
- `src/app/(app)/dashboard/page.tsx` - Dashboard page
- `src/app/(app)/dashboard/components/sales-chart.tsx` - Sales visualization
- `src/components/profile-completion-banner.tsx` - Completion reminder

---

## Storage

### Supabase Storage Buckets

#### Avatars Bucket
- **Name**: `avatars`
- **Public**: Yes
- **Max File Size**: 5MB
- **Allowed Types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Path Pattern**: `{user_id}/{filename}`

#### Products Bucket
- **Name**: `products`
- **Public**: Yes
- **Max File Size**: 10MB
- **Allowed Types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- **Path Pattern**: `{user_id}/{filename}`

### Storage Functions

```typescript
// Upload avatar
uploadAvatar(userId: string, file: File): Promise<string | null>

// Delete avatar
deleteAvatar(userId: string, fileName: string): Promise<boolean>

// Get avatar URL
getAvatarUrl(path: string): string

// Upload product image
uploadProductImage(userId: string, file: File): Promise<string | null>
```

### Key Files
- `src/lib/supabase/services/storage.ts` - All storage operations
- `supabase/storage.sql` - SQL setup for buckets and RLS policies

---

## Database Schema

### Tables

#### profiles
Stores user profile information.
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  phone TEXT,
  business_name TEXT,
  business_type TEXT,
  location TEXT,
  id_number TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### settings
Stores user preferences.
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  notifications_push BOOLEAN DEFAULT true,
  notifications_email BOOLEAN DEFAULT true,
  receipt_show_business_name BOOLEAN DEFAULT true,
  receipt_show_address BOOLEAN DEFAULT true,
  receipt_show_phone BOOLEAN DEFAULT true,
  payment_default_method TEXT DEFAULT 'cash',
  payment_enable_partial BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only read their own data
- Users can only update their own data
- Users can only insert their own data
- Users can only delete their own data

---

## Environment Variables

Required environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Payments (optional)
PAYSTACK_SECRET_KEY=your_paystack_secret
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public
```

---

## Build & Development

### Development
```bash
pnpm dev        # Standard dev server
pnpm dev --turbo  # Faster with Turbopack
```

### Production Build
```bash
pnpm build
pnpm start
```

### Build Optimizations
- TypeScript checking skipped during build
- ESLint skipped during build
- SWC minification enabled
- Source maps disabled in production

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.3.3 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Supabase |
| Auth | Supabase Auth |
| Database | PostgreSQL (via Supabase) |
| Storage | Supabase Storage |
| Payments | Paystack |
| Package Manager | pnpm |

---

## File Structure

```
src/
├── app/
│   ├── (app)/           # Protected routes
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── customers/
│   │   ├── payments/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── airtime-data/
│   ├── api/             # API routes
│   ├── auth/            # Auth callback
│   ├── login/
│   ├── signup/
│   ├── verify-otp/
│   └── onboarding/
├── components/
│   ├── ui/              # shadcn components
│   └── ...              # App components
├── context/
│   └── AuthContext.tsx
├── hooks/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── types.ts
│   │   └── services/
│   │       ├── profiles.ts
│   │       ├── settings.ts
│   │       └── storage.ts
│   └── ...
└── types/
```

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm build` to ensure no build errors
4. Submit a pull request

---

## License

MIT License - See LICENSE file for details.
