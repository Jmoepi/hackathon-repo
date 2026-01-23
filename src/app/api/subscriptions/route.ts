/**
 * Subscription Management API
 * 
 * POST - Create a new subscription payment
 * GET - Get current subscription status
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { 
  createSubscriptionPayment, 
  SUBSCRIPTION_PLANS,
  type SubscriptionPlan 
} from "@/lib/payments/stitch";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// POST - Create subscription payment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { plan } = body as { plan: SubscriptionPlan };

    // Validate plan
    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return NextResponse.json(
        { error: "Invalid plan. Must be one of: starter, growth, pro" },
        { status: 400 }
      );
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];

    // Free tier doesn't need payment
    if (planDetails.priceMonthly === 0) {
      // Upsert subscription for free tier
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan: "starter",
          status: "active",
          amount_cents: 0,
          current_period_start: new Date().toISOString(),
          current_period_end: null, // Free tier doesn't expire
        }, {
          onConflict: "user_id",
        });

      if (subError) {
        console.error("Error creating free subscription:", subError);
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        plan: "starter",
        message: "Free tier activated",
      });
    }

    // Get user's profile for business name
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name")
      .eq("id", user.id)
      .single();

    // Check for existing pending subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id, stitch_payment_id, status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    // Create Stitch payment request
    const payment = await createSubscriptionPayment(plan, user.id, profile?.business_name || "TradaHub");

    // Calculate billing period (monthly)
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create or update subscription
    if (existingSub) {
      // Update existing pending subscription
      await supabase
        .from("subscriptions")
        .update({
          plan,
          stitch_payment_id: payment.id,
          stitch_payment_status: "pending",
          amount_cents: planDetails.priceMonthly,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq("id", existingSub.id);
    } else {
      // Create new subscription
      await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan,
          status: "pending",
          stitch_payment_id: payment.id,
          stitch_payment_status: "pending",
          amount_cents: planDetails.priceMonthly,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
    }

    // Also log in payments table
    await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        type: "subscription",
        amount_cents: planDetails.priceMonthly,
        platform_fee_cents: 0, // No platform fee on subscriptions (it's all platform revenue)
        merchant_amount_cents: 0,
        stitch_payment_id: payment.id,
        stitch_payment_url: payment.url,
        stitch_payment_status: "pending",
        external_reference: `subscription_${user.id}_${plan}`,
        status: "pending",
        metadata: { plan, user_id: user.id },
      });

    return NextResponse.json({
      success: true,
      paymentUrl: payment.url,
      paymentId: payment.id,
      plan,
      amount: planDetails.priceMonthly / 100,
      currency: "ZAR",
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// GET - Get current subscription
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "pending", "trial"])
      .single();

    if (subError && subError.code !== "PGRST116") {
      console.error("Error fetching subscription:", subError);
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
    }

    // Default to starter if no subscription
    if (!subscription) {
      return NextResponse.json({
        plan: "starter",
        status: "active",
        amount_cents: 0,
        features: SUBSCRIPTION_PLANS.starter.features,
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[subscription.plan as SubscriptionPlan] || SUBSCRIPTION_PLANS.starter;

    return NextResponse.json({
      ...subscription,
      features: planDetails.features,
      plan_name: planDetails.name,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
