# Stitch Money Integration

## Overview

**Stitch Money** is the South African payment infrastructure that handles both **customer payments** (Pay-by-Bank) and **merchant payouts** (disbursements) in TradaHub. It enables:

1. **Pay-by-Bank**: Customers pay for products via instant EFT
2. **Subscriptions**: Platform subscription payments for merchants
3. **Disbursements**: Automatic payouts to merchant bank accounts

## Why Stitch Money?

We chose Stitch Money over other payment providers (like Paystack) because:

| Feature | Stitch Money | Paystack |
|---------|--------------|----------|
| SA Bank Support | ✅ 18+ banks | ❌ Returns empty list |
| SA Bank Verification | ✅ With ID number | ❌ Not supported |
| ZAR Payouts | ✅ Same-day/Instant | ❌ Not available |
| Pay-by-Bank | ✅ Instant EFT | ❌ Not available in SA |
| SA-focused | ✅ Built for SA | ❌ Nigeria-focused |

## Payment Flow

### Customer Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    1. INITIATE PAYMENT                              │
│  Merchant selects products → Creates payment request                │
│  QR code displayed with Stitch payment URL                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    2. CUSTOMER PAYS                                 │
│  Customer scans QR or clicks link → Stitch Pay-by-Bank UI          │
│  Selects bank → Completes instant EFT → Money in platform account   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    3. PLATFORM SPLIT (5%)                           │
│  Total: R100                                                        │
│  ├── Platform Fee (5%): R5 → TradaHub keeps this                    │
│  └── Merchant Amount (95%): R95 → Goes to merchant                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    4. AUTOMATIC PAYOUT                              │
│  Stitch sends R95 to merchant's SA bank account                     │
│  (FNB, ABSA, Standard Bank, Nedbank, Capitec, etc.)                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Subscription Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MERCHANT UPGRADES PLAN                           │
│  Clicks upgrade → Selects plan (Growth R199 or Pro R499)            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STITCH PAY-BY-BANK                               │
│  Redirect to Stitch → Instant EFT → Payment complete                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION ACTIVATED                           │
│  Webhook received → Subscription status = "active"                  │
│  Features unlocked for merchant                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Features Used

| Feature | Purpose | File |
|---------|---------|------|
| **Pay-by-Bank** | Customer payments via instant EFT | `src/lib/payments/stitch.ts` |
| **Subscriptions** | Platform subscription payments | `src/app/api/subscriptions/route.ts` |
| **Bank List** | Provides list of 18 SA banks for merchants to select | `src/lib/payments/stitch.ts` |
| **Bank Details Form** | Merchants save their bank details in settings | `src/app/(app)/settings/components/stitch-bank-details-form.tsx` |
| **Disbursements** | Automatically pays out 95% to merchant after each sale | `src/lib/payments/stitch.ts` |
| **Webhooks** | Notifies TradaHub when payments/payouts complete/fail | `src/app/api/webhooks/stitch/route.ts` |

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | Free | Up to 50 products, Basic analytics, Email support |
| **Growth** | R199/month | Unlimited products, Advanced analytics, Priority support, QR Payments |
| **Pro** | R499/month | Everything in Growth, API access, Dedicated support, Custom branding, Multi-store |

## Supported South African Banks

| Bank ID | Bank Name |
|---------|-----------|
| `absa` | ABSA |
| `african_bank` | African Bank |
| `capitec` | Capitec Bank |
| `discovery_bank` | Discovery Bank |
| `fnb` | First National Bank (FNB) |
| `grindrod_bank` | Grindrod Bank |
| `investec` | Investec |
| `nedbank` | Nedbank |
| `sasfin_bank` | Sasfin Bank |
| `standard_bank` | Standard Bank |
| `tymebank` | TymeBank |
| `za_bidvest` | Bidvest Bank |
| `za_access_bank` | Access Bank |
| `za_bank_zero` | Bank Zero |
| `za_capitec_business` | Capitec Business |
| `za_postbank` | Postbank |
| `za_hsbc` | HSBC South Africa |
| `za_olympus_mobile` | Olympus Mobile |

## Environment Variables

```env
# Payment Provider Mode
PAYMENT_PROVIDER=STITCH  # Set to MOCK for testing, STITCH for real payments

# Stitch Money Configuration
STITCH_CLIENT_ID=your_client_id
STITCH_CLIENT_SECRET=your_client_secret
STITCH_WEBHOOK_SECRET=your_webhook_secret
STITCH_TEST_MODE=true  # Set to false for production
```

## API Endpoints

### Customer Payments
- **POST** `/api/payments/create` - Create a new payment request
- **GET** `/api/payments/[id]` - Get payment status
- **GET** `/api/payments/callback` - Handle payment redirect callback

### Subscriptions
- **POST** `/api/subscriptions` - Create a new subscription payment
- **GET** `/api/subscriptions` - Get current subscription status
- **GET** `/api/subscriptions/callback` - Handle subscription payment callback

### Bank Details API
- **GET** `/api/merchant/stitch-bank?action=banks` - Get list of SA banks
- **GET** `/api/merchant/stitch-bank` - Get merchant's saved bank details
- **POST** `/api/merchant/stitch-bank` - Save merchant's bank details

### Webhook Endpoint
- **POST** `/api/webhooks/stitch` - Receives Stitch webhook events

## Webhook Events

### Payment Events

| Status | Description |
|--------|-------------|
| `PaymentInitiationRequestCompleted` | ✅ Payment successful |
| `PaymentInitiationRequestCancelled` | 🚫 Customer cancelled payment |
| `PaymentInitiationRequestExpired` | ⏰ Payment link expired |

### Disbursement Events

| Status | Description |
|--------|-------------|
| `DisbursementPending` | Payout is queued |
| `DisbursementSubmitted` | Payout sent to bank |
| `DisbursementCompleted` | ✅ Payout successful |
| `DisbursementError` | ❌ Payout failed |
| `DisbursementPaused` | ⏸️ Insufficient funds in float |
| `DisbursementCancelled` | 🚫 Payout was cancelled |
| `DisbursementReversed` | ↩️ Bank reversed the payout |

## Testing Webhooks

### Local Testing with curl

```bash
# Test successful disbursement
curl -X POST http://localhost:3000/api/webhooks/stitch \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "type": "disbursement",
    "data": {
      "id": "disbursement-001",
      "created": "2026-01-23T10:00:00Z",
      "amount": {"quantity": "100.00", "currency": "ZAR"},
      "nonce": "nonce-123",
      "beneficiaryReference": "TradaHub Payout",
      "status": {"__typename": "DisbursementCompleted", "date": "2026-01-23T10:05:00Z"}
    }
  }'

# Test failed disbursement
curl -X POST http://localhost:3000/api/webhooks/stitch \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-456",
    "type": "disbursement",
    "data": {
      "id": "disbursement-002",
      "created": "2026-01-23T10:00:00Z",
      "amount": {"quantity": "100.00", "currency": "ZAR"},
      "nonce": "nonce-456",
      "beneficiaryReference": "TradaHub Payout",
      "status": {"__typename": "DisbursementError", "reason": "invalid_account"}
    }
  }'
```

### Testing with ngrok (for Stitch dashboard)

```bash
# Install ngrok
npm install -g ngrok

# Start dev server
pnpm dev

# Expose localhost
ngrok http 3000

# Use the ngrok URL in Stitch dashboard:
# https://abc123.ngrok.io/api/webhooks/stitch
```

## Stitch API Reference

- **Documentation**: https://docs.stitch.money/
- **GraphQL API**: https://api.stitch.money/graphql
- **Token Endpoint**: https://secure.stitch.money/connect/token
- **Dashboard**: https://stitch.money/

## Files Structure

```
src/
├── lib/
│   └── payments/
│       ├── stitch.ts              # Stitch service (auth, Pay-by-Bank, disbursements)
│       ├── mock.ts                # Mock payments for testing
│       └── index.ts               # Payment exports
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   ├── create/
│   │   │   │   └── route.ts       # Create payment request
│   │   │   ├── callback/
│   │   │   │   └── route.ts       # Payment callback handler
│   │   │   └── [id]/
│   │   │       └── route.ts       # Get payment status
│   │   ├── subscriptions/
│   │   │   ├── route.ts           # Create/get subscription
│   │   │   └── callback/
│   │   │       └── route.ts       # Subscription callback handler
│   │   ├── merchant/
│   │   │   └── stitch-bank/
│   │   │       └── route.ts       # Bank details API
│   │   └── webhooks/
│   │       └── stitch/
│   │           └── route.ts       # Webhook handler
│   └── (app)/
│       ├── payments/
│       │   └── components/
│       │       └── qr-code-dialog.tsx  # Payment QR dialog
│       └── settings/
│           └── components/
│               └── stitch-bank-details-form.tsx  # Bank form UI
└── supabase/
    └── migrations/
        ├── 20260123_stitch_bank_columns.sql      # Bank details migration
        └── 20260124_subscriptions_and_payments.sql  # Payments tables
```

## Platform Commission

TradaHub takes a **5% commission** on all transactions:

```typescript
// From src/lib/payments/stitch.ts
export const PLATFORM_COMMISSION_PERCENT = 5;

// Calculation example:
// Customer pays: R100.00
// Platform fee (5%): R5.00
// Merchant receives: R95.00
```

## Security

- **OAuth2 Authentication**: Client credentials flow with token caching
- **Webhook Signature Verification**: HMAC-SHA256 signature validation
- **Secure Storage**: Bank details stored in Supabase with RLS policies

## Contact

- **Stitch Support**: support@stitch.money
- **API Status**: https://status.stitch.money/
