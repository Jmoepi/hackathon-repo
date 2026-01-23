/**
 * Subscription Payment Callback
 * 
 * Handles redirects from Stitch after subscription payment
 * Query params: id, status (complete|closed|failed), externalReference
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parsePaymentCallback, getPaymentRequestStatus } from "@/lib/payments/stitch";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const callback = parsePaymentCallback(searchParams);

    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(`${BASE_URL}/login?redirect=/settings`);
    }

    // Handle different statuses
    if (callback.status === "complete") {
      // Verify payment with Stitch API
      const paymentStatus = await getPaymentRequestStatus(callback.id);
      
      if (paymentStatus?.status.__typename === "PaymentInitiationRequestCompleted") {
        // Update subscription to active
        const { error: subError } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            stitch_payment_status: "completed",
          })
          .eq("stitch_payment_id", callback.id)
          .eq("user_id", user.id);

        if (subError) {
          console.error("Error updating subscription:", subError);
        }

        // Update payment record
        const { error: payError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            stitch_payment_status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("stitch_payment_id", callback.id);

        if (payError) {
          console.error("Error updating payment:", payError);
        }

        // Redirect with success message
        return NextResponse.redirect(
          `${BASE_URL}/settings?subscription=success&plan=${callback.externalReference?.split("_")[2] || "growth"}`
        );
      }
    }

    // Payment was closed or failed
    if (callback.status === "closed" || callback.status === "failed") {
      // Update subscription to failed/cancelled
      await supabase
        .from("subscriptions")
        .update({
          status: callback.status === "closed" ? "cancelled" : "expired",
          stitch_payment_status: callback.status,
        })
        .eq("stitch_payment_id", callback.id)
        .eq("user_id", user.id);

      // Update payment record
      await supabase
        .from("payments")
        .update({
          status: callback.status === "closed" ? "cancelled" : "failed",
          stitch_payment_status: callback.status,
        })
        .eq("stitch_payment_id", callback.id);

      return NextResponse.redirect(
        `${BASE_URL}/settings?subscription=failed&reason=${callback.status}`
      );
    }

    // Unknown status - redirect to settings
    return NextResponse.redirect(`${BASE_URL}/settings`);
  } catch (error) {
    console.error("Error processing subscription callback:", error);
    return NextResponse.redirect(
      `${BASE_URL}/settings?subscription=error&message=${encodeURIComponent(
        error instanceof Error ? error.message : "Unknown error"
      )}`
    );
  }
}
