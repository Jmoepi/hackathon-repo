import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createDisbursement } from "@/lib/payments/stitch";

/**
 * Stitch Money Webhook Handler
 * 
 * Receives webhook events for:
 * - Disbursement status updates (submitted, completed, error, paused, cancelled, reversed)
 * - Payment initiation request updates (completed, cancelled, expired)
 * 
 * @see https://docs.stitch.money/webhooks
 */

type WebhookType = "disbursement" | "payment_initiation_request";

interface StitchWebhookPayload {
  id: string;
  type: WebhookType;
  data: {
    id: string;
    created: string;
    amount: {
      quantity: string;
      currency: string;
    };
    nonce?: string;
    externalReference?: string;
    beneficiaryReference?: string;
    payerReference?: string;
    status: {
      __typename: string;
      date?: string;
      reason?: string;
    };
  };
}

/**
 * Verify Stitch webhook signature
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("stitch-signature") || 
                      request.headers.get("x-stitch-signature") || "";
    const payload = await request.text();

    // Verify webhook signature in production
    const webhookSecret = process.env.STITCH_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const isValid = verifySignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid Stitch webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event: StitchWebhookPayload = JSON.parse(payload);
    
    console.log("Stitch webhook received:", {
      type: event.type,
      id: event.data?.id,
      status: event.data?.status?.__typename,
    });

    const supabase = await createClient();

    // Handle payment initiation request events
    if (event.type === "payment_initiation_request") {
      const { data } = event;
      const status = data.status.__typename;
      
      switch (status) {
        case "PaymentInitiationRequestCompleted":
          console.log(`✅ Payment completed: ${data.id}`);
          
          // Update payment record
          const { data: payment, error: payError } = await supabase
            .from("payments")
            .update({
              status: "completed",
              stitch_payment_status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("stitch_payment_id", data.id)
            .select("*")
            .single();

          if (!payError && payment) {
            // Check if this is a subscription or customer payment
            if (payment.type === "subscription") {
              // Update subscription to active
              await supabase
                .from("subscriptions")
                .update({
                  status: "active",
                  stitch_payment_status: "completed",
                })
                .eq("stitch_payment_id", data.id);
            } else if (payment.type === "customer_payment" && payment.merchant_amount_cents > 0 && payment.user_id) {
              // Get profile for bank details
              const { data: profile } = await supabase
                .from("profiles")
                .select("id, business_name, bank_code, account_number, account_name, account_type")
                .eq("id", payment.user_id)
                .single();

              if (profile?.bank_code && profile?.account_number) {
                try {
                  const disbursement = await createDisbursement(
                    payment.amount_cents,
                    profile.bank_code,
                    profile.account_number,
                    profile.account_name || profile.business_name || "Merchant",
                    (profile.account_type as "current" | "savings") || "current",
                    `PAY-${payment.order_reference || payment.id.substring(0, 8)}`,
                    payment.id
                  );

                  // Update payment with disbursement info
                  await supabase
                    .from("payments")
                    .update({
                      disbursement_id: disbursement.id,
                      disbursement_status: disbursement.status.__typename,
                    })
                    .eq("id", payment.id);
                } catch (disbError) {
                  console.error("Error creating disbursement:", disbError);
                }
              }
            }
          }
          break;
          
        case "PaymentInitiationRequestCancelled":
          console.log(`🚫 Payment cancelled: ${data.id}`);
          await supabase
            .from("payments")
            .update({
              status: "cancelled",
              stitch_payment_status: "cancelled",
              status_message: data.status.reason || "Payment cancelled by user",
            })
            .eq("stitch_payment_id", data.id);
          
          // If subscription, update subscription status too
          await supabase
            .from("subscriptions")
            .update({
              status: "cancelled",
              stitch_payment_status: "cancelled",
            })
            .eq("stitch_payment_id", data.id);
          break;
          
        case "PaymentInitiationRequestExpired":
          console.log(`⏰ Payment expired: ${data.id}`);
          await supabase
            .from("payments")
            .update({
              status: "failed",
              stitch_payment_status: "expired",
              status_message: "Payment link expired",
            })
            .eq("stitch_payment_id", data.id);
          
          // If subscription, update subscription status too
          await supabase
            .from("subscriptions")
            .update({
              status: "expired",
              stitch_payment_status: "expired",
            })
            .eq("stitch_payment_id", data.id);
          break;
          
        default:
          console.log(`Payment status update: ${status}`, data.id);
      }
    }

    // Handle disbursement events
    if (event.type === "disbursement") {
      const { data } = event;
      const status = data.status.__typename;
      
      switch (status) {
        case "DisbursementCompleted":
          console.log(`✅ Disbursement completed: ${data.id}`);
          await supabase
            .from("payments")
            .update({
              disbursement_status: "completed",
              disbursed_at: new Date().toISOString(),
            })
            .eq("disbursement_id", data.id);
          break;
          
        case "DisbursementError":
          console.error(`❌ Disbursement failed: ${data.id}`, data.status.reason);
          await supabase
            .from("payments")
            .update({
              disbursement_status: "failed",
              status_message: `Payout failed: ${data.status.reason}`,
            })
            .eq("disbursement_id", data.id);
          break;
          
        case "DisbursementPaused":
          console.warn(`⏸️ Disbursement paused: ${data.id}`, data.status.reason);
          await supabase
            .from("payments")
            .update({
              disbursement_status: "paused",
              status_message: `Payout paused: ${data.status.reason}`,
            })
            .eq("disbursement_id", data.id);
          break;
          
        case "DisbursementCancelled":
          console.warn(`🚫 Disbursement cancelled: ${data.id}`, data.status.reason);
          await supabase
            .from("payments")
            .update({
              disbursement_status: "cancelled",
              status_message: `Payout cancelled: ${data.status.reason}`,
            })
            .eq("disbursement_id", data.id);
          break;
          
        case "DisbursementReversed":
          console.error(`↩️ Disbursement reversed: ${data.id}`, data.status.reason);
          await supabase
            .from("payments")
            .update({
              disbursement_status: "reversed",
              status_message: `Payout reversed: ${data.status.reason}`,
            })
            .eq("disbursement_id", data.id);
          break;
          
        case "DisbursementSubmitted":
          console.log(`📤 Disbursement submitted: ${data.id}`);
          await supabase
            .from("payments")
            .update({
              disbursement_status: "submitted",
            })
            .eq("disbursement_id", data.id);
          break;
          
        default:
          console.log(`Disbursement status update: ${status}`, data.id);
      }
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Stitch webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Stitch may send GET requests to verify the webhook endpoint
export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    message: "Stitch webhook endpoint is active" 
  });
}
