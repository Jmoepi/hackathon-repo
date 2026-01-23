/**
 * Customer Payment Callback
 * 
 * Handles redirects from Stitch after customer payment
 * Query params: id, status (complete|closed|failed), externalReference
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { 
  parsePaymentCallback, 
  getPaymentRequestStatus,
  createDisbursement,
  PLATFORM_COMMISSION_PERCENT 
} from "@/lib/payments/stitch";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const callback = parsePaymentCallback(searchParams);

    const supabase = await createClient();

    // Handle different statuses
    if (callback.status === "complete") {
      // Verify payment with Stitch API
      const paymentStatus = await getPaymentRequestStatus(callback.id);
      
      if (paymentStatus?.status.__typename === "PaymentInitiationRequestCompleted") {
        // Update payment record and get user's profile for bank details
        const { data: payment, error: payError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            stitch_payment_status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("stitch_payment_id", callback.id)
          .select("*")
          .single();

        if (payError) {
          console.error("Error updating payment:", payError);
        }

        // If payment found, get profile for bank details and create disbursement
        if (payment && payment.merchant_amount_cents > 0 && payment.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, business_name, bank_code, account_number, account_name, account_type")
            .eq("id", payment.user_id)
            .single();

          if (profile?.bank_code && profile?.account_number) {
            try {
              const disbursement = await createDisbursement(
                payment.amount_cents, // Full amount - commission is calculated inside
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
              // Payment still succeeded, just payout failed
            }
          }
        }

        // Redirect with success message
        return NextResponse.redirect(
          `${BASE_URL}/payments?status=success&reference=${callback.id.substring(0, 8)}`
        );
      }
    }

    // Payment was closed or failed
    if (callback.status === "closed" || callback.status === "failed") {
      // Update payment record
      await supabase
        .from("payments")
        .update({
          status: callback.status === "closed" ? "cancelled" : "failed",
          stitch_payment_status: callback.status,
        })
        .eq("stitch_payment_id", callback.id);

      return NextResponse.redirect(
        `${BASE_URL}/payments?status=failed&reason=${callback.status}`
      );
    }

    // Unknown status - redirect to payments
    return NextResponse.redirect(`${BASE_URL}/payments`);
  } catch (error) {
    console.error("Error processing payment callback:", error);
    return NextResponse.redirect(
      `${BASE_URL}/payments?status=error&message=${encodeURIComponent(
        error instanceof Error ? error.message : "Unknown error"
      )}`
    );
  }
}
