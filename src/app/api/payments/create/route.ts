import { NextRequest, NextResponse } from "next/server";
import { Payments } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, customerId, orderReference, userId } = body;

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Convert to cents if needed (assume amount is in cents if > 100)
    const amountCents = amount > 100 ? Number(amount) : Number(amount) * 100;

    // Get business name if userId provided
    let businessName = "TradaHub";
    let authenticatedUserId = userId;
    
    const supabase = await createClient();
    
    // If no userId passed, try to get from auth
    if (!authenticatedUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id;
    }
    
    if (authenticatedUserId) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_name")
          .eq("id", authenticatedUserId)
          .single();
        if (profile?.business_name) {
          businessName = profile.business_name;
        }
      } catch {
        // Use default name
      }
    }

    // Create payment
    const payment = await Payments.create(amountCents, {
      customerId,
      orderReference,
      shopId: authenticatedUserId, // Use userId as shopId for compatibility
      shopName: businessName,
    });

    // If not in test mode, save to database
    if (!Payments.isTestMode() && authenticatedUserId) {
      try {
        await supabase.from("payments").insert({
          user_id: authenticatedUserId,
          type: "customer_payment",
          customer_id: customerId || null,
          order_reference: orderReference || payment.reference,
          amount_cents: amountCents,
          platform_fee_cents: Math.round(amountCents * 0.05), // 5% platform fee
          merchant_amount_cents: Math.round(amountCents * 0.95),
          stitch_payment_id: payment.id,
          stitch_payment_url: "paymentUrl" in payment ? payment.paymentUrl : null,
          stitch_payment_status: "pending",
          external_reference: customerId ? `cust_${customerId}` : null,
          status: "pending",
        });
      } catch (dbError) {
        console.error("Error saving payment to database:", dbError);
        // Continue - payment was still created in Stitch
      }
    }

    return NextResponse.json({
      ...payment,
      isTestMode: Payments.isTestMode(),
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment" },
      { status: 500 }
    );
  }
}

