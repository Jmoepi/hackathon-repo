# **App Name**: TradaHub - Business OS for Modern Entrepreneurs

## Overview

TradaHub is an all-in-one business toolkit designed for African SMEs, side hustlers, and entrepreneurs. Whether you run a corner shop, salon, online store, restaurant, or freelance business — manage everything from one simple, powerful app.

## Target Segments

- **Retail Shops** - Spaza shops, supermarkets, convenience stores
- **Salons** - Hair & beauty, barbershops, nail studios
- **Restaurants** - Takeaways, fast food, cafés
- **Delivery Services** - Couriers, local delivery
- **Freelancers** - Designers, consultants, service providers
- **Online Stores** - E-commerce, social sellers

## Core Features

### Dashboard
Real-time overview of key business metrics including daily revenue, top products/services, and activity feed.

### Inventory Management
Digital catalog for products with stock tracking, low-stock alerts, barcode scanning, and bulk import/export.

### Customer Management (CRM)
Customer database with purchase history, loyalty points, segmentation, and SMS/email campaigns.

### Digital Payments
Generate QR codes for secure cashless transactions, payment links, and transaction history.

### Airtime & Data Sales
Sell airtime, data bundles, and electricity tokens with instant commission tracking.

### Bookings & Appointments
Online booking system with calendar management, SMS reminders, and staff scheduling.

### Order Management
Order queue, kitchen display system, status tracking, and table management for food businesses.

### Delivery Tracking
Live delivery tracking, driver management, route optimization, and proof of delivery.

### Invoicing
Professional invoice templates, quotes, payment tracking, and tax calculations.

### Reports & Analytics
Comprehensive business reports, revenue analytics, customer insights, and data exports.

### Cart & Checkout
Shopping cart, checkout flow, abandoned cart recovery, and discount codes for online stores.

## Pricing Model

TradaHub uses a flexible pricing model:

### Pre-built Bundles
- **Starter** (R149/mo) - Dashboard, Inventory, Customers, Payments
- **Growth** (R349/mo) - Starter + Airtime, Bookings, Invoices
- **Pro** (R549/mo) - All services included

### Custom Plans
Users can select individual services (R49-R99/mo each) with a 10% discount when choosing 4+ services.

See [Services & Pricing Documentation](./services-and-pricing.md) for details.

## Backend Architecture

TradaHub uses Supabase for the backend with a modular service layer.

### Database Tables

| Feature | Tables |
|---------|--------|
| Subscriptions | `subscriptions`, `subscription_services` |
| Bookings | `staff_members`, `booking_services`, `bookings` |
| Orders | `menu_items`, `orders`, `order_items` |
| Deliveries | `drivers`, `deliveries`, `delivery_status_history` |
| Invoices | `invoices`, `invoice_items` |

### Service Layer

Each feature has a dedicated service file in `src/lib/supabase/services/`:

- **subscriptions.ts** - Plan management, feature gating
- **bookings.ts** - Appointments, staff, calendar
- **orders.ts** - Menu items, order workflow
- **deliveries.ts** - Driver management, tracking
- **invoices.ts** - Billing, payments, tax calculations

See [Backend Services Documentation](./backend-services.md) for API reference.

## Style Guidelines

- **Primary color**: Emerald green (#10B981) representing growth and prosperity
- **Background**: Light neutral with gradient accents
- **Accent colors**: Teal, purple, amber for feature differentiation
- **Typography**: Clean, modern sans-serif for accessibility
- **Icons**: Lucide React icon set for consistency
- **Layout**: Responsive sidebar navigation with mobile bottom nav

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Supabase Auth (email, OTP, Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Paystack integration
- **Deployment**: Firebase App Hosting