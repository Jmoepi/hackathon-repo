
# Township Trader Toolkit

Township Trader Toolkit is a modern, mobile-friendly business management app for small businesses and street vendors. Built with Next.js, React, and Tailwind CSS, it provides:

- **Inventory Management**: Track products, update stock, and get low-stock alerts.
- **Payments**: Generate QR codes for digital payments, with a realistic mock payment provider (pending → webhook → paid) for demos. Easily swap to Paystack/Flutterwave later.
- **Dashboard**: Visualize sales, revenue, and best-sellers with live charts.
- **Customer Engagement**: Manage customer lists and send promotional SMS.
- **Onboarding**: Guided onboarding flow for new users.
- **Theme & Accessibility**: Dark/light mode, responsive design, and accessible UI.

## Demo Payment Provider

The app includes a local mock payment gateway:
- Generates QR codes for payments.
- Simulates real payment flow (pending, webhook, paid) with auto-settle or manual simulation.
- API routes for payment creation, status polling, and webhook simulation.
- Provider-agnostic: swap to Paystack/Flutterwave by changing one env variable.

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

1. Go to the Payments page, enter an amount, and generate a QR code.
2. The payment will auto-settle after 8 seconds (or use the manual simulator API).
3. Dashboard updates in real time when payment is received.

## Swapping Providers

To use a real gateway (Paystack/Flutterwave), implement the provider adapter and change `PROVIDER_PAYMENTS` in `.env.local`.

---

For more details, see the code in `src/app/`, `src/lib/payments/`, and `src/lib/store.ts`.
