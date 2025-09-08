
# local Trader Toolkit

local Trader Toolkit is a modern, mobile-friendly business management app for small businesses and street vendors. Built with Next.js, React, and Tailwind CSS, it provides:

- **Inventory Management**: Track products, update stock, and get low-stock alerts.
- **Payments**: Generate QR codes for digital payments, with a realistic mock payment provider (pending → webhook → paid) for demos. Easily swap to Paystack/Flutterwave later.
- **Dashboard**: Visualize sales, revenue, and best-sellers with live charts.
- **Customer Engagement**: Manage customer lists and send promotional SMS.
- **Onboarding**: Guided onboarding flow for new users.
- **Theme & Accessibility**: Dark/light mode, responsive design, and accessible UI.

## Demo Payment Provider


The app supports both a local mock payment gateway and real Paystack integration:
- Generates QR codes for payments.
- Simulates real payment flow (pending, webhook, paid) with auto-settle or manual simulation.
- API routes for payment creation, status polling, and webhook simulation.
- Easily swap to Paystack by changing one env variable.
- Paystack integration supports real payment flows, webhooks, and callback URLs for production/demo.

## Getting Started

This project uses [pnpm](https://pnpm.io/) for package management. If you don't have pnpm installed, run:

```bash
npm install -g pnpm
```

### Common commands

- Install dependencies:
	```bash
	pnpm install
	```
- Start development server:
	```bash
	pnpm dev
	```
- Build for production:
	```bash
	pnpm build
	```

## Environment Setup

Add to `.env.local` for demo payments:

```
PROVIDER_PAYMENTS=MOCK
PAYMENT_AUTO_SETTLE_SECONDS=8
```

## Folder Structure

- `src/app/` — Main app pages and API routes
- `src/components/` — UI components
- `src/lib/` — Payment provider logic, store, and adapters

## How to Test Payments


### Mock Provider (Demo)
1. Go to the Payments page, enter an amount, and generate a QR code.
2. The payment will auto-settle after 8 seconds (or use the manual simulator API).
3. Dashboard updates in real time when payment is received.

### Paystack Provider (Live/Test)
1. Set `PROVIDER_PAYMENTS=PAYSTACK` in your `.env.local` and add your Paystack API key.
2. Deploy to Vercel or run locally with ngrok for webhook/callback testing.
3. In your Paystack dashboard, set:
	- **Webhook URL:** `https://your-vercel-domain/api/webhooks/paystack`
	- **Callback URL:** `https://your-vercel-domain/(app)/payments/callback`
4. Go to the Payments page, enter an amount, and generate a QR code.
5. Complete the payment using Paystack’s test card or QR flow.
6. After payment, Paystack will POST to your webhook URL, updating payment status.
7. You’ll be redirected to the callback page.
8. Dashboard and recent transactions will update in real time.

## Swapping Providers


To use Paystack, set `PROVIDER_PAYMENTS=PAYSTACK` and add your API key in `.env.local`. For mock/demo, use `PROVIDER_PAYMENTS=MOCK`.

---


## Deployment

Deploy easily to Vercel for public access and webhook/callback support:
- Vercel domain: `https://your-vercel-domain`
- No need for ngrok when deployed.

For more details, see the code in `src/app/`, `src/lib/payments/`, and `src/lib/store.ts`.
