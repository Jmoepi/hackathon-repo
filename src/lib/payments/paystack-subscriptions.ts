import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const BASE_URL = "https://api.paystack.co";

// ============================================================================
// Types
// ============================================================================

export interface PaystackPlan {
  id: number;
  name: string;
  plan_code: string;
  amount: number; // in kobo/cents
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually';
  currency: string;
}

export interface PaystackSubscription {
  id: number;
  subscription_code: string;
  customer: number;
  plan: PaystackPlan;
  status: 'active' | 'non-renewing' | 'attention' | 'completed' | 'cancelled';
  amount: number;
  next_payment_date: string;
  email_token: string;
}

export interface PaystackCustomer {
  id: number;
  customer_code: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface InitializeTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

// ============================================================================
// Helpers
// ============================================================================

async function paystackRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: Record<string, unknown>
): Promise<T> {
  const response = await axios({
    method,
    url: `${BASE_URL}${endpoint}`,
    data,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.data.status) {
    throw new Error(response.data.message || 'Paystack request failed');
  }

  return response.data.data;
}

/**
 * Convert ZAR amount to cents (Paystack format)
 */
export function toPaystackAmount(zarAmount: number): number {
  return Math.round(zarAmount * 100);
}

/**
 * Convert Paystack cents to ZAR
 */
export function fromPaystackAmount(cents: number): number {
  return cents / 100;
}

/**
 * Generate a unique reference
 */
export function generateReference(prefix: string = 'TH'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

// ============================================================================
// Customer Management
// ============================================================================

/**
 * Create or get a Paystack customer
 */
export async function createOrGetCustomer(
  email: string,
  firstName?: string,
  lastName?: string,
  phone?: string
): Promise<PaystackCustomer> {
  try {
    // Try to fetch existing customer
    const existing = await paystackRequest<PaystackCustomer>('GET', `/customer/${email}`);
    return existing;
  } catch {
    // Customer doesn't exist, create new one
    const customer = await paystackRequest<PaystackCustomer>('POST', '/customer', {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
    });
    return customer;
  }
}

// ============================================================================
// Plan Management
// ============================================================================

/**
 * Create a subscription plan in Paystack
 */
export async function createPlan(
  name: string,
  amount: number, // in ZAR
  interval: PaystackPlan['interval'] = 'monthly',
  description?: string
): Promise<PaystackPlan> {
  const plan = await paystackRequest<PaystackPlan>('POST', '/plan', {
    name,
    amount: toPaystackAmount(amount),
    interval,
    description,
    currency: 'ZAR',
  });
  return plan;
}

/**
 * Get all plans
 */
export async function listPlans(): Promise<PaystackPlan[]> {
  const plans = await paystackRequest<PaystackPlan[]>('GET', '/plan');
  return plans;
}

/**
 * Get a specific plan by code
 */
export async function getPlan(planCode: string): Promise<PaystackPlan> {
  const plan = await paystackRequest<PaystackPlan>('GET', `/plan/${planCode}`);
  return plan;
}

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Initialize a subscription transaction
 * Returns a URL to redirect the user to complete payment
 */
export async function initializeSubscription(
  email: string,
  planCode: string,
  callbackUrl: string,
  metadata?: Record<string, unknown>
): Promise<InitializeTransactionResponse> {
  const reference = generateReference('SUB');
  
  const response = await paystackRequest<InitializeTransactionResponse>(
    'POST',
    '/transaction/initialize',
    {
      email,
      plan: planCode,
      callback_url: callbackUrl,
      reference,
      metadata: {
        ...metadata,
        subscription: true,
      },
    }
  );

  return response;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionCode: string): Promise<PaystackSubscription> {
  const subscription = await paystackRequest<PaystackSubscription>(
    'GET',
    `/subscription/${subscriptionCode}`
  );
  return subscription;
}

/**
 * List all subscriptions for a customer
 */
export async function listCustomerSubscriptions(customerCode: string): Promise<PaystackSubscription[]> {
  const subscriptions = await paystackRequest<PaystackSubscription[]>(
    'GET',
    `/subscription?customer=${customerCode}`
  );
  return subscriptions;
}

/**
 * Enable a subscription (reactivate)
 */
export async function enableSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<void> {
  await paystackRequest('POST', '/subscription/enable', {
    code: subscriptionCode,
    token: emailToken,
  });
}

/**
 * Disable a subscription (pause/cancel)
 */
export async function disableSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<void> {
  await paystackRequest('POST', '/subscription/disable', {
    code: subscriptionCode,
    token: emailToken,
  });
}

// ============================================================================
// One-time Payment (for custom plans)
// ============================================================================

/**
 * Initialize a one-time payment transaction
 */
export async function initializePayment(
  email: string,
  amount: number, // in ZAR
  callbackUrl: string,
  metadata?: Record<string, unknown>
): Promise<InitializeTransactionResponse> {
  const reference = generateReference('PAY');
  
  const response = await paystackRequest<InitializeTransactionResponse>(
    'POST',
    '/transaction/initialize',
    {
      email,
      amount: toPaystackAmount(amount),
      currency: 'ZAR',
      callback_url: callbackUrl,
      reference,
      metadata,
    }
  );

  return response;
}

/**
 * Verify a transaction
 */
export async function verifyTransaction(reference: string): Promise<{
  status: 'success' | 'failed' | 'pending';
  amount: number;
  customer: PaystackCustomer;
  metadata?: Record<string, unknown>;
  paidAt?: string;
  channel?: string;
  authorization?: {
    authorization_code: string;
    card_type: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    bank: string;
    reusable: boolean;
  };
}> {
  const data = await paystackRequest<any>('GET', `/transaction/verify/${reference}`);
  
  return {
    status: data.status === 'success' ? 'success' : data.status === 'failed' ? 'failed' : 'pending',
    amount: fromPaystackAmount(data.amount),
    customer: data.customer,
    metadata: data.metadata,
    paidAt: data.paid_at,
    channel: data.channel,
    authorization: data.authorization,
  };
}

// ============================================================================
// Webhook Handling
// ============================================================================

export type WebhookEvent = 
  | 'charge.success'
  | 'subscription.create'
  | 'subscription.disable'
  | 'subscription.not_renew'
  | 'invoice.create'
  | 'invoice.payment_failed'
  | 'invoice.update';

export interface WebhookPayload {
  event: WebhookEvent;
  data: {
    reference?: string;
    subscription_code?: string;
    customer?: PaystackCustomer;
    plan?: PaystackPlan;
    amount?: number;
    status?: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Parse and validate webhook payload
 */
export function parseWebhook(body: any): WebhookPayload | null {
  if (!body?.event || !body?.data) {
    return null;
  }

  return {
    event: body.event as WebhookEvent,
    data: body.data,
  };
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string = PAYSTACK_SECRET_KEY || ''
): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

// ============================================================================
// TradaHub Plan Codes (to be created in Paystack dashboard)
// ============================================================================

export const TRADAHUB_PLANS = {
  starter: {
    name: 'Starter',
    code: process.env.PAYSTACK_PLAN_STARTER || 'PLN_starter',
    amount: 149,
  },
  growth: {
    name: 'Growth',
    code: process.env.PAYSTACK_PLAN_GROWTH || 'PLN_growth',
    amount: 349,
  },
  pro: {
    name: 'Pro',
    code: process.env.PAYSTACK_PLAN_PRO || 'PLN_pro',
    amount: 549,
  },
} as const;

export type TradaHubPlanId = keyof typeof TRADAHUB_PLANS;
