import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  parseWebhook,
  verifyWebhookSignature,
  verifyTransaction,
  type WebhookPayload,
} from '@/lib/payments/paystack-subscriptions';
import { getBundleById } from '@/lib/services/catalog';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature') || '';

    // Verify webhook signature
    if (process.env.PAYSTACK_SECRET_KEY) {
      const isValid = verifyWebhookSignature(body, signature);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = parseWebhook(JSON.parse(body));
    if (!payload) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const supabase = await createClient();

    switch (payload.event) {
      case 'charge.success':
        await handleChargeSuccess(supabase, payload);
        break;

      case 'subscription.create':
        await handleSubscriptionCreate(supabase, payload);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisable(supabase, payload);
        break;

      case 'subscription.not_renew':
        await handleSubscriptionNotRenew(supabase, payload);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, payload);
        break;

      default:
        console.log('Unhandled webhook event:', payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(supabase: any, payload: WebhookPayload) {
  const { reference, metadata, customer } = payload.data;
  
  if (!reference) {
    console.error('No reference in charge.success webhook');
    return;
  }

  // Verify the transaction
  const transaction = await verifyTransaction(reference);
  if (transaction.status !== 'success') {
    console.error('Transaction verification failed:', reference);
    return;
  }

  // Update subscription status to active
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('paystack_reference', reference)
    .single();

  if (fetchError || !subscription) {
    console.error('Subscription not found for reference:', reference);
    return;
  }

  // Update subscription to active
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      started_at: new Date().toISOString(),
      paystack_customer_code: customer?.customer_code,
      paystack_authorization: transaction.authorization,
    })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    return;
  }

  // If bundle plan, add services
  if (subscription.plan_type === 'bundle' && subscription.bundle_id) {
    const bundle = getBundleById(subscription.bundle_id);
    if (bundle) {
      // Check if services already exist
      const { data: existingServices } = await supabase
        .from('subscription_services')
        .select('service_id')
        .eq('subscription_id', subscription.id);

      if (!existingServices || existingServices.length === 0) {
        const serviceRecords = bundle.services.map((serviceId) => ({
          subscription_id: subscription.id,
          service_id: serviceId,
        }));

        await supabase.from('subscription_services').insert(serviceRecords);
      }
    }
  }

  console.log('Subscription activated:', subscription.id);
}

async function handleSubscriptionCreate(supabase: any, payload: WebhookPayload) {
  const { subscription_code, customer, plan } = payload.data;
  
  if (!subscription_code) return;

  // Update subscription with Paystack subscription code
  const { error } = await supabase
    .from('subscriptions')
    .update({
      paystack_subscription_code: subscription_code,
      paystack_plan_code: plan?.plan_code,
    })
    .eq('paystack_customer_code', customer?.customer_code)
    .eq('status', 'active');

  if (error) {
    console.error('Error updating subscription code:', error);
  }
}

async function handleSubscriptionDisable(supabase: any, payload: WebhookPayload) {
  const { subscription_code } = payload.data;
  
  if (!subscription_code) return;

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('paystack_subscription_code', subscription_code);

  if (error) {
    console.error('Error disabling subscription:', error);
  }
}

async function handleSubscriptionNotRenew(supabase: any, payload: WebhookPayload) {
  const { subscription_code } = payload.data;
  
  if (!subscription_code) return;

  // Mark as non-renewing but still active until expiry
  const { error } = await supabase
    .from('subscriptions')
    .update({ 
      status: 'cancelled',
      // Set expires_at to end of current billing period
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('paystack_subscription_code', subscription_code);

  if (error) {
    console.error('Error marking subscription as non-renewing:', error);
  }
}

async function handlePaymentFailed(supabase: any, payload: WebhookPayload) {
  const { subscription_code } = payload.data;
  
  if (!subscription_code) return;

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('paystack_subscription_code', subscription_code);

  if (error) {
    console.error('Error marking subscription as past_due:', error);
  }
}
