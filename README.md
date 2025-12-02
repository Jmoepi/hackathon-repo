# TradaHub

_TradaHub is your all-in-one business command center in your pocket._

It’s a mobile-friendly business toolkit for **small businesses, township traders, and side hustlers**.  
Manage products, customers, payments, and insights — all from one simple, powerful app built on **Next.js + Supabase**.

---

## ✨ Key Features

### 1. Authentication & Security

- **Supabase Auth** with:
  - Email/password signup + **OTP verification**
  - **Google OAuth** sign-in
  - Magic link (email-based) login
- Authenticated routing:
  - All routes under `/(app)/*` are protected
  - Middleware ensures only logged-in users can access app pages
- First-time login flow:
  - User signs up → verifies OTP → profile created → redirected to `/onboarding` or `/dashboard`

**Key Files:**

- `src/context/AuthContext.tsx` – Central auth context (login, signup, logout, session)
- `src/app/login/page.tsx` – Login page
- `src/app/signup/page.tsx` – Signup page
- `src/app/verify-otp/page.tsx` – OTP verification
- `src/app/auth/callback/route.ts` – OAuth callback route
- `src/middleware.ts` – Route protection

---

### 2. User Profile (My Business)

Give each user a proper **business identity** inside the app.

- View & edit:
  - Full name, email, phone number
  - Business name, business type, location
  - ID number, date of birth (optional)
- Avatar upload with initials fallback
- Future-friendly: plug in transaction history & stats on this page

**Profile Schema (`profiles`):**

| Field          | Type      | Description                        |
|----------------|-----------|------------------------------------|
| `id`           | UUID      | Primary key (from `auth.users`)    |
| `email`        | text      | User email                         |
| `full_name`    | text      | Display name                       |
| `phone`        | text      | Phone number                       |
| `business_name`| text      | Business/shop name                 |
| `business_type`| text      | Type of business                   |
| `location`     | text      | Business location                  |
| `id_number`    | text      | National ID number                 |
| `date_of_birth`| date      | Date of birth                      |
| `avatar_url`   | text      | Profile image path                 |
| `created_at`   | timestamptz | Created timestamp                |
| `updated_at`   | timestamptz | Last updated timestamp           |

**Key Files:**

- `src/app/(app)/profile/page.tsx`
- `src/lib/supabase/services/profiles.ts`

---

### 3. Settings

Let users control how TradaHub behaves for **their** business.

- Notification preferences:
  - `notifications_push` (push)
  - `notifications_email` (email)
- Receipt preferences:
  - Show/hide business name, address, phone
- Payment preferences:
  - Default payment method (e.g. `cash`)
  - Allow / disallow partial payments
- UI theme:
  - `light` / `dark` / `system`
- **Auto-save on change** – no manual "Save" button required

**Settings Schema (`settings`):**

| Field                         | Type      | Default    |
|------------------------------|-----------|------------|
| `id`                         | UUID      | generated  |
| `user_id`                    | UUID      | references `auth.users` |
| `notifications_push`         | boolean   | `true`     |
| `notifications_email`        | boolean   | `true`     |
| `receipt_show_business_name` | boolean   | `true`     |
| `receipt_show_address`       | boolean   | `true`     |
| `receipt_show_phone`         | boolean   | `true`     |
| `payment_default_method`     | text      | `'cash'`   |
| `payment_enable_partial`     | boolean   | `false`    |
| `theme`                      | text      | `'system'` |
| `created_at`                 | timestamptz | `now()`  |
| `updated_at`                 | timestamptz | `now()`  |

**Key Files:**

- `src/app/(app)/settings/page.tsx`
- `src/lib/supabase/services/settings.ts`

---

### 4. Dashboard

A clean daily **snapshot** of the business.

- Business metrics overview
- Sales chart visualisation (e.g. last 7 / 30 days)
- Recent transactions (hooked to your future transactions table)
- Low stock alerts (integrated with inventory)
- Profile completion banner:
  - Shows missing fields and progress to encourage profile completion

**Key Files:**

- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/dashboard/components/sales-chart.tsx`
- `src/components/profile-completion-banner.tsx`

---

### 5. Storage (Avatars & Products)

Using **Supabase Storage** for media:

#### Buckets

- **`avatars`**  
  - Public: **Yes**  
  - Max size: 5MB  
  - Types: JPEG, PNG, GIF, WebP  
  - Path: `{user_id}/{filename}`  
- **`products`**  
  - Public: **Yes**  
  - Max size: 10MB  
  - Types: JPEG, PNG, GIF, WebP  
  - Path: `{user_id}/{filename}`  

#### Storage Service

```ts
// Upload avatar
uploadAvatar(userId: string, file: File): Promise<string | null>

// Delete avatar
deleteAvatar(userId: string, fileName: string): Promise<boolean>

// Get avatar URL
getAvatarUrl(path: string): string

// Upload product image
uploadProductImage(userId: string, file: File): Promise<string | null>
