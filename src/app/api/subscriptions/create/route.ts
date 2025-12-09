import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  initializeSubscription,
  initializePayment,
  TRADAHUB_PLANS,
  type TradaHubPlanId,
} from '@/lib/payments/paystack-subscriptions';
import { getBundleById, calculateCustomPlanPrice, type ServiceId } from '@/lib/services/catalog';

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planType, bundleId, services } = body as {
      planType: 'bundle' | 'custom';
      bundleId?: TradaHubPlanId;
      services?: ServiceId[];
    };

    // Get user's profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', user.id)
      .single();

    const email = (profile as { email?: string })?.email || user.email;
    if (!email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscriptions/callback`;

    let paymentResponse;
    let amount: number;
    let planDetails: {
      type: 'bundle' | 'custom';
      bundleId?: string;
      services?: ServiceId[];
    };

    if (planType === 'bundle' && bundleId) {
      // Bundle subscription - use Paystack subscription
      const plan = TRADAHUB_PLANS[bundleId];
      if (!plan) {
        return NextResponse.json(
          { error: 'Invalid bundle ID' },
          { status: 400 }
        );
      }

      const bundle = getBundleById(bundleId);
      amount = plan.amount;
      planDetails = {
        type: 'bundle',
        bundleId,
        services: bundle?.services,
      };

      paymentResponse = await initializeSubscription(
        email,
        plan.code,
        callbackUrl,
        {
          user_id: user.id,
          plan_type: 'bundle',
          bundle_id: bundleId,
          services: bundle?.services,
        }
      );
    } else if (planType === 'custom' && services && services.length > 0) {
      // Custom plan - use one-time payment (can set up recurring later)
      const pricing = calculateCustomPlanPrice(services);
      amount = pricing.finalTotal;
      planDetails = {
        type: 'custom',
        services,
      };

      paymentResponse = await initializePayment(
        email,
        amount,
        callbackUrl,
        {
          user_id: user.id,
          plan_type: 'custom',
          services,
          discount_applied: pricing.discount > 0,
          discount_amount: pricing.discount,
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 400 }
      );
    }

    // Store pending subscription in database
    const { error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: planType,
        bundle_id: planDetails.bundleId || null,
        monthly_price: amount,
        status: 'trialing', // Will be updated to 'active' after payment
        paystack_reference: paymentResponse.reference,
      });

    if (insertError) {
      console.error('Error creating subscription record:', insertError);
      // Don't fail the request, payment can still proceed
    }

    // If custom plan, store the services
    if (planType === 'custom' && services) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('paystack_reference', paymentResponse.reference)
        .single();

      if (subscription) {
        const subscriptionData = subscription as { id: string };
        const serviceRecords = services.map((serviceId) => ({
          subscription_id: subscriptionData.id,
          service_id: serviceId,
        }));

        await supabase.from('subscription_services').insert(serviceRecords);
      }
    }

    return NextResponse.json({
      success: true,
      authorization_url: paymentResponse.authorization_url,
      reference: paymentResponse.reference,
      amount,
    });
  } catch (error) {
    console.error('Subscription initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize subscription' },
      { status: 500 }
    );
  }
}
