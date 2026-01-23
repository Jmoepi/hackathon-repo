/**
 * Stitch Money Payment Service
 * 
 * South African payment gateway with:
 * - Bank Account Verification (BAV)
 * - Disbursements (payouts to merchant bank accounts)
 * - Pay-by-Bank (instant EFT for receiving payments)
 * - GraphQL API
 * 
 * @see https://docs.stitch.money/
 */

// ============================================================================
// Types
// ============================================================================

export interface StitchBank {
  id: string;
  name: string;
  supportsVerification: boolean;
  supportsInstantPayout: boolean;
}

export interface StitchAccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface DisbursementInput {
  amount: {
    quantity: string; // Amount in ZAR (e.g., "100.00")
    currency: "ZAR";
  };
  bankBeneficiary: {
    bankId: string;
    accountNumber: string;
    accountType: "current" | "savings";
    name: string;
  };
  beneficiaryReference: string; // Max 20 chars - shown on beneficiary statement
  externalReference?: string; // Optional - for your internal tracking
  nonce: string; // Unique identifier to prevent duplicates
  type?: "INSTANT" | "DEFAULT"; // INSTANT costs more, DEFAULT is same-day
}

export interface DisbursementResponse {
  id: string;
  created: string;
  amount: {
    quantity: string;
    currency: string;
  };
  nonce: string;
  status: DisbursementStatus;
}

export type DisbursementStatus =
  | { __typename: "DisbursementPending" }
  | { __typename: "DisbursementSubmitted" }
  | { __typename: "DisbursementCompleted"; date: string }
  | { __typename: "DisbursementPaused"; reason: string }
  | { __typename: "DisbursementCancelled"; reason: string }
  | { __typename: "DisbursementReversed"; reason: string }
  | { __typename: "DisbursementError"; reason: string };

export interface BankVerificationInput {
  accountNumber: string;
  bankId: string;
  accountType?: "current" | "savings";
  accountHolder: {
    individual?: {
      initials?: string;
      familyName?: string;
      identifyingDocument: {
        identityDocument?: {
          number: string;
          country: string; // "ZA"
        };
        passport?: {
          number: string;
          country: string;
        };
      };
    };
    business?: {
      name?: string;
      registration: {
        number: string;
        country: string;
      };
    };
  };
}

export interface BankVerificationResult {
  accountVerificationResult: "verified" | "refuted" | "unknown";
  detailedAccountVerificationResults: {
    accountExists: "verified" | "refuted" | "unknown";
    identityDocumentMatch: "verified" | "refuted" | "unknown";
    lastNameMatch: "verified" | "refuted" | "unknown";
    initialMatch?: "verified" | "refuted" | "unknown";
  };
  accountOpen: boolean;
  accountAcceptsCredits: boolean;
  accountHolder?: {
    fullName?: string;
  };
}

// Pay-by-Bank Types (for receiving payments)
export interface PaymentRequestInput {
  amount: {
    quantity: string; // Amount in ZAR (e.g., "199.00")
    currency: "ZAR";
  };
  payerReference: string; // Max 12 chars - shown on payer's bank statement
  beneficiaryReference: string; // Max 20 chars - shown on your bank statement
  beneficiaryName: string; // Max 20 chars - your business name
  externalReference?: string; // For your internal tracking (e.g., order_id or subscription_id)
  expireAt?: string; // ISO 8601 date - when the payment link expires
}

export interface PaymentRequestResponse {
  paymentInitiationRequest: {
    id: string;
    url: string; // Redirect user here to complete payment
  };
}

export type PaymentStatus = 
  | "PaymentInitiationRequestCompleted"
  | "PaymentInitiationRequestCancelled"
  | "PaymentInitiationRequestExpired"
  | "PaymentInitiationRequestPending";

export interface PaymentStatusResponse {
  id: string;
  externalReference?: string;
  amount: {
    quantity: string;
    currency: string;
  };
  payerReference: string;
  beneficiaryReference: string;
  status: {
    __typename: PaymentStatus;
    reason?: string;
  };
  created: string;
  expires?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const STITCH_TOKEN_URL = "https://secure.stitch.money/connect/token";
const STITCH_API_URL = "https://api.stitch.money/graphql";

// Platform commission for split payments (5%)
export const PLATFORM_COMMISSION_PERCENT = 5;

// South African banks supported by Stitch
export const SA_BANKS: StitchBank[] = [
  { id: "absa", name: "ABSA", supportsVerification: true, supportsInstantPayout: true },
  { id: "african_bank", name: "African Bank", supportsVerification: true, supportsInstantPayout: true },
  { id: "capitec", name: "Capitec Bank", supportsVerification: true, supportsInstantPayout: true },
  { id: "discovery_bank", name: "Discovery Bank", supportsVerification: true, supportsInstantPayout: true },
  { id: "fnb", name: "First National Bank (FNB)", supportsVerification: true, supportsInstantPayout: true },
  { id: "grindrod_bank", name: "Grindrod Bank", supportsVerification: true, supportsInstantPayout: false },
  { id: "investec", name: "Investec", supportsVerification: true, supportsInstantPayout: true },
  { id: "nedbank", name: "Nedbank", supportsVerification: true, supportsInstantPayout: true },
  { id: "sasfin_bank", name: "Sasfin Bank", supportsVerification: true, supportsInstantPayout: true },
  { id: "standard_bank", name: "Standard Bank", supportsVerification: true, supportsInstantPayout: true },
  { id: "tymebank", name: "TymeBank", supportsVerification: true, supportsInstantPayout: true },
  { id: "za_bidvest", name: "Bidvest Bank", supportsVerification: true, supportsInstantPayout: true },
  { id: "za_access_bank", name: "Access Bank", supportsVerification: false, supportsInstantPayout: true },
  { id: "za_bank_zero", name: "Bank Zero", supportsVerification: false, supportsInstantPayout: true },
  { id: "za_capitec_business", name: "Capitec Business", supportsVerification: false, supportsInstantPayout: true },
  { id: "za_postbank", name: "Postbank", supportsVerification: false, supportsInstantPayout: true },
  { id: "za_hsbc", name: "HSBC South Africa", supportsVerification: false, supportsInstantPayout: true },
  { id: "za_olympus_mobile", name: "Olympus Mobile", supportsVerification: false, supportsInstantPayout: false },
];

// ============================================================================
// Token Management
// ============================================================================

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get a client access token from Stitch
 * Tokens are cached until expiry
 */
export async function getAccessToken(scopes: string[]): Promise<string> {
  const now = Date.now();
  
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  const clientId = process.env.STITCH_CLIENT_ID;
  const clientSecret = process.env.STITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Stitch credentials not configured. Set STITCH_CLIENT_ID and STITCH_CLIENT_SECRET.");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: scopes.join(" "),
    audience: STITCH_TOKEN_URL,
  });

  const response = await fetch(STITCH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Stitch token error:", errorText);
    throw new Error(`Failed to get Stitch access token: ${response.status}`);
  }

  const data: StitchAccessToken = await response.json();

  // Cache the token
  cachedToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

// ============================================================================
// GraphQL Helper
// ============================================================================

async function executeGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  scopes: string[]
): Promise<T> {
  const token = await getAccessToken(scopes);

  const response = await fetch(STITCH_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Stitch API error:", errorText);
    throw new Error(`Stitch API error: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    const error = result.errors[0];
    console.error("GraphQL error:", error);
    throw new Error(error.message || "GraphQL error");
  }

  return result.data;
}

// ============================================================================
// Bank Functions
// ============================================================================

/**
 * Get list of South African banks
 */
export function getSouthAfricanBanks(): StitchBank[] {
  return SA_BANKS;
}

/**
 * Get bank by ID
 */
export function getBankById(bankId: string): StitchBank | undefined {
  return SA_BANKS.find((bank) => bank.id === bankId);
}

// ============================================================================
// Bank Account Verification
// ============================================================================

const VERIFY_BANK_ACCOUNT_QUERY = `
query BankAccountVerification(
  $accountNumber: String!,
  $bankId: BankAccountVerificationBankIdInput!,
  $accountType: AccountType,
  $initials: String,
  $familyName: String,
  $identityDocument: IdentityDocumentInput!
) {
  client {
    verifyBankAccountDetails(input: {
      accountNumber: $accountNumber,
      bankId: $bankId,
      accountType: $accountType,
      accountHolder: {
        individual: {
          initials: $initials,
          familyName: $familyName,
          identifyingDocument: {
            identityDocument: $identityDocument
          }
        }
      }
    }) {
      accountVerificationResult
      detailedAccountVerificationResults {
        accountExists
        identityDocumentMatch
        lastNameMatch
        initialMatch
      }
      accountOpen
      accountAcceptsCredits
      accountHolder {
        ... on VerifiedAccountHolderIndividual {
          fullName
        }
      }
    }
  }
}`;

/**
 * Verify a bank account belongs to a specific person
 * Uses SA ID number for verification
 */
export async function verifyBankAccount(
  accountNumber: string,
  bankId: string,
  idNumber: string,
  familyName?: string,
  initials?: string,
  accountType?: "current" | "savings"
): Promise<BankVerificationResult> {
  const variables = {
    accountNumber,
    bankId,
    accountType: accountType || null,
    initials: initials || null,
    familyName: familyName || null,
    identityDocument: {
      number: idNumber,
      country: "ZA",
    },
  };

  const data = await executeGraphQL<{
    client: { verifyBankAccountDetails: BankVerificationResult };
  }>(VERIFY_BANK_ACCOUNT_QUERY, variables, ["client_bankaccountverification"]);

  return data.client.verifyBankAccountDetails;
}

// ============================================================================
// Disbursements (Payouts)
// ============================================================================

const CREATE_DISBURSEMENT_MUTATION = `
mutation CreateDisbursement(
  $amount: MoneyInput!,
  $type: DisbursementType!,
  $nonce: String!,
  $externalReference: String,
  $beneficiaryReference: String!,
  $name: String!,
  $accountNumber: String!,
  $accountType: AccountType!,
  $bankId: DisbursementBankBeneficiaryBankId!
) {
  clientDisbursementCreate(input: {
    amount: $amount,
    type: $type,
    nonce: $nonce,
    externalReference: $externalReference,
    beneficiaryReference: $beneficiaryReference,
    bankBeneficiary: {
      name: $name,
      accountNumber: $accountNumber,
      accountType: $accountType,
      bankId: $bankId
    }
  }) {
    disbursement {
      id
      created
      amount {
        quantity
        currency
      }
      nonce
      status {
        __typename
        ... on DisbursementPending {
          __typename
        }
        ... on DisbursementSubmitted {
          date
        }
        ... on DisbursementCompleted {
          date
        }
        ... on DisbursementError {
          reason
        }
        ... on DisbursementPaused {
          reason
        }
      }
    }
  }
}`;

/**
 * Create a disbursement (payout) to a merchant's bank account
 * 
 * @param amountCents - Amount in cents (will be converted to ZAR)
 * @param bankId - Stitch bank ID (e.g., "fnb", "absa")
 * @param accountNumber - Bank account number
 * @param accountName - Account holder name
 * @param accountType - "current" or "savings"
 * @param reference - Reference shown on statement (max 20 chars)
 * @param externalReference - Your internal reference (optional)
 */
export async function createDisbursement(
  amountCents: number,
  bankId: string,
  accountNumber: string,
  accountName: string,
  accountType: "current" | "savings" = "current",
  reference: string,
  externalReference?: string
): Promise<DisbursementResponse> {
  // Calculate merchant amount after platform commission
  const platformFeeCents = Math.round(amountCents * (PLATFORM_COMMISSION_PERCENT / 100));
  const merchantAmountCents = amountCents - platformFeeCents;
  
  // Convert cents to ZAR (e.g., 10000 cents = 100.00 ZAR)
  const merchantAmountZAR = (merchantAmountCents / 100).toFixed(2);
  
  // Generate unique nonce for idempotency
  const nonce = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const variables = {
    amount: {
      quantity: merchantAmountZAR,
      currency: "ZAR",
    },
    type: "DEFAULT", // Use same-day clearing (cheaper than INSTANT)
    nonce,
    externalReference: externalReference || null,
    beneficiaryReference: reference.substring(0, 20), // Max 20 chars
    name: accountName,
    accountNumber,
    accountType,
    bankId,
  };

  const data = await executeGraphQL<{
    clientDisbursementCreate: { disbursement: DisbursementResponse };
  }>(CREATE_DISBURSEMENT_MUTATION, variables, ["client_disbursement"]);

  return data.clientDisbursementCreate.disbursement;
}

// ============================================================================
// Disbursement Status
// ============================================================================

const GET_DISBURSEMENT_STATUS_QUERY = `
query GetDisbursementStatus($disbursementId: ID!) {
  node(id: $disbursementId) {
    ... on Disbursement {
      id
      created
      amount {
        quantity
        currency
      }
      nonce
      externalReference
      beneficiaryReference
      status {
        __typename
        ... on DisbursementPending {
          __typename
        }
        ... on DisbursementSubmitted {
          date
        }
        ... on DisbursementCompleted {
          date
        }
        ... on DisbursementError {
          reason
        }
        ... on DisbursementPaused {
          reason
        }
        ... on DisbursementCancelled {
          reason
        }
        ... on DisbursementReversed {
          reason
        }
      }
    }
  }
}`;

/**
 * Get the status of a disbursement by ID
 */
export async function getDisbursementStatus(disbursementId: string): Promise<DisbursementResponse | null> {
  const data = await executeGraphQL<{
    node: DisbursementResponse | null;
  }>(GET_DISBURSEMENT_STATUS_QUERY, { disbursementId }, ["client_disbursement"]);

  return data.node;
}

// ============================================================================
// Webhook Helpers
// ============================================================================

/**
 * Verify a Stitch webhook signature
 * 
 * Stitch signs webhooks with HMAC-SHA256
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  
  return signature === expectedSignature;
}

/**
 * Parse disbursement status from webhook
 */
export function parseDisbursementStatusFromWebhook(
  status: DisbursementStatus
): {
  isComplete: boolean;
  isFailed: boolean;
  isPending: boolean;
  message: string;
} {
  switch (status.__typename) {
    case "DisbursementCompleted":
      return { isComplete: true, isFailed: false, isPending: false, message: "Payout completed successfully" };
    case "DisbursementError":
      return { isComplete: false, isFailed: true, isPending: false, message: `Payout failed: ${status.reason}` };
    case "DisbursementReversed":
      return { isComplete: false, isFailed: true, isPending: false, message: `Payout reversed: ${status.reason}` };
    case "DisbursementCancelled":
      return { isComplete: false, isFailed: true, isPending: false, message: `Payout cancelled: ${status.reason}` };
    case "DisbursementPaused":
      return { isComplete: false, isFailed: false, isPending: true, message: `Payout paused: ${status.reason}` };
    case "DisbursementPending":
    case "DisbursementSubmitted":
    default:
      return { isComplete: false, isFailed: false, isPending: true, message: "Payout is processing" };
  }
}

// ============================================================================
// Pay-by-Bank (Instant EFT - Receiving Payments)
// ============================================================================

const CREATE_PAYMENT_REQUEST_MUTATION = `
mutation CreatePaymentRequest(
  $amount: MoneyInput!,
  $payerReference: String!,
  $beneficiaryReference: String!,
  $beneficiaryName: String!,
  $externalReference: String,
  $expireAt: Date
) {
  clientPaymentInitiationRequestCreate(input: {
    amount: $amount,
    payerReference: $payerReference,
    beneficiaryReference: $beneficiaryReference,
    beneficiaryName: $beneficiaryName,
    externalReference: $externalReference,
    expireAt: $expireAt
  }) {
    paymentInitiationRequest {
      id
      url
    }
  }
}`;

/**
 * Create a Pay-by-Bank payment request
 * 
 * User will be redirected to Stitch-hosted UI to select bank and complete payment.
 * After payment, user is redirected back with status in query params.
 * 
 * @param amountCents - Amount in cents (e.g., 19900 for R199.00)
 * @param payerReference - Reference shown on payer's statement (max 12 chars)
 * @param beneficiaryReference - Reference shown on your statement (max 20 chars)
 * @param beneficiaryName - Your business name (max 20 chars)
 * @param externalReference - Your internal reference (e.g., order_123 or sub_456)
 * @param expireAt - When payment link expires (optional, ISO 8601 date)
 */
export async function createPaymentRequest(
  amountCents: number,
  payerReference: string,
  beneficiaryReference: string,
  beneficiaryName: string = "TradaHub",
  externalReference?: string,
  expireAt?: Date
): Promise<{ id: string; url: string }> {
  // Convert cents to ZAR
  const amountZAR = (amountCents / 100).toFixed(2);

  const variables = {
    amount: {
      quantity: amountZAR,
      currency: "ZAR",
    },
    payerReference: payerReference.substring(0, 12), // Max 12 chars
    beneficiaryReference: beneficiaryReference.substring(0, 20), // Max 20 chars
    beneficiaryName: beneficiaryName.substring(0, 20), // Max 20 chars
    externalReference: externalReference || null,
    expireAt: expireAt ? expireAt.toISOString().split("T")[0] : null, // Format: YYYY-MM-DD
  };

  const data = await executeGraphQL<{
    clientPaymentInitiationRequestCreate: PaymentRequestResponse;
  }>(CREATE_PAYMENT_REQUEST_MUTATION, variables, ["client_paymentrequest"]);

  return data.clientPaymentInitiationRequestCreate.paymentInitiationRequest;
}

const GET_PAYMENT_STATUS_QUERY = `
query GetPaymentStatus($paymentRequestId: ID!) {
  node(id: $paymentRequestId) {
    ... on PaymentInitiationRequest {
      id
      externalReference
      amount {
        quantity
        currency
      }
      payerReference
      beneficiaryReference
      status {
        __typename
        ... on PaymentInitiationRequestCompleted {
          date
        }
        ... on PaymentInitiationRequestCancelled {
          reason
        }
        ... on PaymentInitiationRequestExpired {
          reason
        }
      }
      created
      expires
    }
  }
}`;

/**
 * Get the status of a payment request
 */
export async function getPaymentRequestStatus(paymentRequestId: string): Promise<PaymentStatusResponse | null> {
  const data = await executeGraphQL<{
    node: PaymentStatusResponse | null;
  }>(GET_PAYMENT_STATUS_QUERY, { paymentRequestId }, ["client_paymentrequest"]);

  return data.node;
}

/**
 * Parse payment status from callback URL parameters
 * 
 * After payment, user is redirected to your callback URL with:
 * ?id=<paymentRequestId>&status=<complete|closed|failed>&externalReference=<yourRef>
 */
export function parsePaymentCallback(searchParams: URLSearchParams): {
  id: string;
  status: "complete" | "closed" | "failed";
  externalReference?: string;
} {
  return {
    id: searchParams.get("id") || "",
    status: (searchParams.get("status") as "complete" | "closed" | "failed") || "failed",
    externalReference: searchParams.get("externalReference") || undefined,
  };
}

/**
 * Parse payment status from webhook
 */
export function parsePaymentStatusFromWebhook(
  typename: PaymentStatus
): {
  isComplete: boolean;
  isFailed: boolean;
  isPending: boolean;
  message: string;
} {
  switch (typename) {
    case "PaymentInitiationRequestCompleted":
      return { isComplete: true, isFailed: false, isPending: false, message: "Payment completed successfully" };
    case "PaymentInitiationRequestCancelled":
      return { isComplete: false, isFailed: true, isPending: false, message: "Payment was cancelled" };
    case "PaymentInitiationRequestExpired":
      return { isComplete: false, isFailed: true, isPending: false, message: "Payment link expired" };
    case "PaymentInitiationRequestPending":
    default:
      return { isComplete: false, isFailed: false, isPending: true, message: "Payment is pending" };
  }
}

// ============================================================================
// Subscription Helpers
// ============================================================================

export type SubscriptionPlan = "starter" | "growth" | "pro";

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, { 
  name: string; 
  priceMonthly: number; // cents
  features: string[];
}> = {
  starter: {
    name: "Starter",
    priceMonthly: 0, // Free tier
    features: ["Up to 50 products", "Basic analytics", "Email support"],
  },
  growth: {
    name: "Growth",
    priceMonthly: 19900, // R199/month
    features: ["Unlimited products", "Advanced analytics", "Priority support", "QR Payments"],
  },
  pro: {
    name: "Pro",
    priceMonthly: 49900, // R499/month
    features: ["Everything in Growth", "API access", "Dedicated support", "Custom branding", "Multi-store"],
  },
};

/**
 * Create a subscription payment request
 */
export async function createSubscriptionPayment(
  plan: SubscriptionPlan,
  userId: string,
  shopName: string
): Promise<{ id: string; url: string }> {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  
  if (planDetails.priceMonthly === 0) {
    throw new Error("Cannot create payment for free tier");
  }

  // Generate references
  const payerReference = `TH${plan.substring(0, 3).toUpperCase()}`; // Max 12 chars: e.g., "THGRO"
  const beneficiaryReference = `SUB-${userId.substring(0, 8)}`; // Max 20 chars
  const externalReference = `subscription_${userId}_${plan}`;

  // Expire in 24 hours
  const expireAt = new Date();
  expireAt.setHours(expireAt.getHours() + 24);

  return createPaymentRequest(
    planDetails.priceMonthly,
    payerReference,
    beneficiaryReference,
    "TradaHub",
    externalReference,
    expireAt
  );
}

// ============================================================================
// Test Mode Helpers
// ============================================================================

/**
 * For test mode, Stitch uses specific values to simulate scenarios:
 * 
 * Successful disbursement:
 * - accountNumber must end in 0
 * - amount.quantity must be less than 400
 * 
 * Failed disbursement (bank_processing_error): amount = 400
 * Failed disbursement (inactive_account): amount = 401
 * Failed disbursement (invalid_account): amount = 402
 * Paused disbursement (insufficient_funds): amount > 404
 */
export function isTestMode(): boolean {
  return process.env.STITCH_TEST_MODE === "true" || 
         !process.env.STITCH_CLIENT_ID?.startsWith("live_");
}
