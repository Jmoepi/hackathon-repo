
import * as Mock from "./mock";
import * as Stitch from "./stitch";

// Use STITCH for real payments, MOCK for testing
const provider = process.env.PAYMENT_PROVIDER || "MOCK";
const isTestMode = provider === "MOCK" || process.env.STITCH_TEST_MODE === "true";

// Re-export Stitch functions for direct use
export {
  getSouthAfricanBanks,
  getBankById,
  createDisbursement,
  getDisbursementStatus,
  verifyBankAccount,
  createPaymentRequest,
  getPaymentRequestStatus,
  parsePaymentCallback,
  parsePaymentStatusFromWebhook,
  createSubscriptionPayment,
  PLATFORM_COMMISSION_PERCENT,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan,
} from "./stitch";

export const Payments = {
  // Payment creation - use Stitch for real, Mock for testing
  create: isTestMode ? Mock.createPayment : createRealPayment,
  // Mock parsing for webhook (still needed for test mode)
  parseWebhook: Mock.parseWebhook,
  // Stitch disbursement functions
  createDisbursement: Stitch.createDisbursement,
  getDisbursementStatus: Stitch.getDisbursementStatus,
  // Stitch Pay-by-Bank functions
  createPaymentRequest: Stitch.createPaymentRequest,
  getPaymentRequestStatus: Stitch.getPaymentRequestStatus,
  // Helper to check mode
  isTestMode: () => isTestMode,
};

/**
 * Create a real payment using Stitch Pay-by-Bank
 * Returns both QR data URL and payment URL for flexibility
 */
async function createRealPayment(
  amountCents: number,
  options?: {
    customerId?: string;
    orderReference?: string;
    shopId?: string;
    shopName?: string;
  }
) {
  const QRCode = (await import("qrcode")).default;
  
  const reference = options?.orderReference || `TH-${Date.now().toString().slice(-6)}`;
  
  // Create Stitch payment request
  const payment = await Stitch.createPaymentRequest(
    amountCents,
    reference.substring(0, 12), // payerReference max 12 chars
    reference, // beneficiaryReference max 20 chars
    options?.shopName?.substring(0, 20) || "TradaHub",
    options?.customerId ? `cust_${options.customerId}` : undefined
  );

  // Generate QR code with payment URL (for scan-to-pay)
  const qrDataUrl = await QRCode.toDataURL(payment.url);

  return {
    id: payment.id,
    reference,
    qrDataUrl,
    paymentUrl: payment.url, // Direct payment link
    amount: amountCents,
    status: "pending" as const,
    provider: "stitch" as const,
  };
}

export type CreatePaymentResponse = Awaited<ReturnType<typeof Mock.createPayment>> | Awaited<ReturnType<typeof createRealPayment>>;

