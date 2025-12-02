// Service Catalog Module - Declarative service definitions for TradaHub

// ============================================================================
// Type Definitions
// ============================================================================

export type ServiceId =
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

export type ServiceCategory =
  | 'core'
  | 'sales_and_customers'
  | 'operations'
  | 'advanced';

export type ServiceBadge = 'popular' | 'new' | 'beta';

export type BundleBadge = 'best_value' | 'starter' | 'popular';

export interface ServiceDefinition {
  id: ServiceId;
  name: string;
  slug: string;
  description: string;
  category: ServiceCategory;
  baseMonthlyPrice: number; // ZAR
  recommendedFor: string;
  route?: string;
  badge?: ServiceBadge;
  features?: string[];
}

export interface BundleDefinition {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number; // ZAR
  services: ServiceId[];
  badge?: BundleBadge;
  recommendedFor: string;
  savings?: number; // Percentage saved compared to individual pricing
}

// ============================================================================
// Service Catalog
// ============================================================================

export const SERVICES: ServiceDefinition[] = [
  // Core Services
  {
    id: 'dashboard',
    name: 'Dashboard',
    slug: 'dashboard',
    description: 'Central hub with business overview, analytics, and quick actions.',
    category: 'core',
    baseMonthlyPrice: 0, // Free with any plan
    recommendedFor: 'All businesses',
    route: '/dashboard',
    features: [
      'Business overview',
      'Quick stats & metrics',
      'Recent activity feed',
      'Quick action shortcuts',
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    slug: 'inventory',
    description: 'Track stock levels, manage products, and get low-stock alerts.',
    category: 'core',
    baseMonthlyPrice: 79,
    recommendedFor: 'Retail shops, wholesalers',
    route: '/inventory',
    badge: 'popular',
    features: [
      'Product catalog',
      'Stock tracking',
      'Low stock alerts',
      'Barcode scanning',
      'Bulk import/export',
    ],
  },
  {
    id: 'customers',
    name: 'Customer Management',
    slug: 'customers',
    description: 'Build customer relationships with CRM, loyalty tracking, and communications.',
    category: 'sales_and_customers',
    baseMonthlyPrice: 69,
    recommendedFor: 'Service businesses, retail',
    route: '/customers',
    features: [
      'Customer database',
      'Purchase history',
      'Loyalty points',
      'SMS/Email campaigns',
      'Customer segments',
    ],
  },
  {
    id: 'payments',
    name: 'Payments & QR',
    slug: 'payments',
    description: 'Accept payments via QR codes, track transactions, and manage payouts.',
    category: 'sales_and_customers',
    baseMonthlyPrice: 89,
    recommendedFor: 'All businesses accepting payments',
    route: '/payments',
    badge: 'popular',
    features: [
      'QR code payments',
      'Transaction history',
      'Payment links',
      'Payout management',
      'Receipt generation',
    ],
  },
  {
    id: 'airtime',
    name: 'Airtime & Data',
    slug: 'airtime-data',
    description: 'Sell airtime, data bundles, and electricity with instant commission.',
    category: 'sales_and_customers',
    baseMonthlyPrice: 49,
    recommendedFor: 'Spaza shops, convenience stores',
    route: '/airtime-data',
    badge: 'new',
    features: [
      'Airtime sales',
      'Data bundles',
      'Electricity tokens',
      'Instant commission',
      'Transaction reports',
    ],
  },
  {
    id: 'bookings',
    name: 'Bookings & Appointments',
    slug: 'bookings',
    description: 'Online booking system for appointments, services, and reservations.',
    category: 'operations',
    baseMonthlyPrice: 79,
    recommendedFor: 'Salons, clinics, consultants',
    route: '/bookings',
    features: [
      'Online booking page',
      'Calendar management',
      'SMS reminders',
      'Staff scheduling',
      'Service menu',
    ],
  },
  {
    id: 'orders',
    name: 'Order Management',
    slug: 'orders',
    description: 'Manage customer orders, kitchen display, and order status tracking.',
    category: 'operations',
    baseMonthlyPrice: 69,
    recommendedFor: 'Restaurants, food vendors',
    route: '/orders',
    features: [
      'Order queue',
      'Kitchen display',
      'Status tracking',
      'Order history',
      'Table management',
    ],
  },
  {
    id: 'deliveries',
    name: 'Delivery Tracking',
    slug: 'deliveries',
    description: 'Track deliveries, manage drivers, and provide customer tracking links.',
    category: 'operations',
    baseMonthlyPrice: 79,
    recommendedFor: 'Delivery businesses, e-commerce',
    route: '/deliveries',
    features: [
      'Live tracking',
      'Driver management',
      'Route optimization',
      'Customer notifications',
      'Proof of delivery',
    ],
  },
  {
    id: 'invoices',
    name: 'Invoicing',
    slug: 'invoices',
    description: 'Create professional invoices, quotes, and track payment status.',
    category: 'advanced',
    baseMonthlyPrice: 59,
    recommendedFor: 'Freelancers, B2B businesses',
    route: '/invoices',
    features: [
      'Invoice templates',
      'Quote generation',
      'Payment tracking',
      'Tax calculations',
      'Client portal',
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    slug: 'reports',
    description: 'Comprehensive business reports, insights, and data exports.',
    category: 'advanced',
    baseMonthlyPrice: 99,
    recommendedFor: 'Growing businesses needing insights',
    route: '/reports',
    badge: 'popular',
    features: [
      'Sales reports',
      'Revenue analytics',
      'Customer insights',
      'Inventory reports',
      'Export to Excel/PDF',
    ],
  },
  {
    id: 'cart',
    name: 'Cart & Checkout',
    slug: 'cart',
    description: 'Online store cart, checkout flow, and abandoned cart recovery.',
    category: 'sales_and_customers',
    baseMonthlyPrice: 89,
    recommendedFor: 'Online stores, e-commerce',
    route: '/cart',
    badge: 'new',
    features: [
      'Shopping cart',
      'Checkout flow',
      'Abandoned cart recovery',
      'Discount codes',
      'Order confirmation',
    ],
  },
];

// ============================================================================
// Bundle Definitions
// ============================================================================

export const BUNDLES: BundleDefinition[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Essential tools to get your business running. Perfect for new entrepreneurs.',
    monthlyPrice: 149,
    services: ['dashboard', 'inventory', 'customers', 'payments'],
    badge: 'starter',
    recommendedFor: 'New businesses, side hustles',
    savings: 35,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Everything in Starter plus tools to scale your operations and reach more customers.',
    monthlyPrice: 349,
    services: ['dashboard', 'inventory', 'customers', 'payments', 'airtime', 'bookings', 'invoices'],
    badge: 'popular',
    recommendedFor: 'Established SMEs, growing retailers',
    savings: 30,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'The complete TradaHub toolkit. All services included for serious business owners.',
    monthlyPrice: 549,
    services: ['dashboard', 'inventory', 'customers', 'payments', 'airtime', 'bookings', 'orders', 'deliveries', 'invoices', 'reports', 'cart'],
    badge: 'best_value',
    recommendedFor: 'Multi-location businesses, franchises',
    savings: 40,
  },
];

// ============================================================================
// Category Metadata
// ============================================================================

export const SERVICE_CATEGORIES: Record<ServiceCategory, { name: string; description: string }> = {
  core: {
    name: 'Core',
    description: 'Essential business management tools',
  },
  sales_and_customers: {
    name: 'Sales & Customers',
    description: 'Tools to sell more and build relationships',
  },
  operations: {
    name: 'Operations',
    description: 'Streamline your daily operations',
  },
  advanced: {
    name: 'Advanced',
    description: 'Analytics and professional tools',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a service definition by ID
 */
export function getServiceById(id: ServiceId): ServiceDefinition | undefined {
  return SERVICES.find((service) => service.id === id);
}

/**
 * Get multiple service definitions by IDs
 */
export function getServicesByIds(ids: ServiceId[]): ServiceDefinition[] {
  return ids
    .map((id) => getServiceById(id))
    .filter((service): service is ServiceDefinition => service !== undefined);
}

/**
 * Get a bundle definition by ID
 */
export function getBundleById(id: string): BundleDefinition | undefined {
  return BUNDLES.find((bundle) => bundle.id === id);
}

/**
 * Get services grouped by category
 */
export function getServicesGroupedByCategory(): Record<ServiceCategory, ServiceDefinition[]> {
  return SERVICES.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    },
    {} as Record<ServiceCategory, ServiceDefinition[]>
  );
}

/**
 * Calculate the price for a custom plan with discount logic
 * - 10% discount when selecting 4 or more services
 */
export function calculateCustomPlanPrice(serviceIds: ServiceId[]): {
  baseTotal: number;
  discount: number;
  discountPercentage: number;
  finalTotal: number;
  serviceCount: number;
} {
  const services = getServicesByIds(serviceIds);
  const baseTotal = services.reduce((sum, service) => sum + service.baseMonthlyPrice, 0);
  
  // Apply 10% discount for 4+ services
  const discountPercentage = serviceIds.length >= 4 ? 10 : 0;
  const discount = Math.round((baseTotal * discountPercentage) / 100);
  const finalTotal = baseTotal - discount;

  return {
    baseTotal,
    discount,
    discountPercentage,
    finalTotal,
    serviceCount: serviceIds.length,
  };
}

/**
 * Calculate savings for a bundle compared to individual pricing
 */
export function calculateBundleSavings(bundle: BundleDefinition): {
  individualTotal: number;
  bundlePrice: number;
  savings: number;
  savingsPercentage: number;
} {
  const services = getServicesByIds(bundle.services);
  const individualTotal = services.reduce((sum, service) => sum + service.baseMonthlyPrice, 0);
  const savings = individualTotal - bundle.monthlyPrice;
  const savingsPercentage = Math.round((savings / individualTotal) * 100);

  return {
    individualTotal,
    bundlePrice: bundle.monthlyPrice,
    savings,
    savingsPercentage,
  };
}

/**
 * Format price in ZAR
 */
export function formatPrice(amount: number): string {
  return `R${amount.toLocaleString('en-ZA')}`;
}

/**
 * Generate URL params for custom plan selection
 */
export function generateCustomPlanParams(serviceIds: ServiceId[]): string {
  return `plan=custom&services=${serviceIds.join(',')}`;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isValidServiceId(id: string): id is ServiceId {
  return SERVICES.some((service) => service.id === id);
}

export function parseServiceIds(serviceString: string): ServiceId[] {
  return serviceString
    .split(',')
    .filter(isValidServiceId);
}
