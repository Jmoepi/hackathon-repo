import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTransaction } from '@/lib/payments/paystack-subscriptions';

// Helper to get the base URL for redirects
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

// Type for subscription record (table may not be in generated types yet)
interface SubscriptionRecord {
  user_id: string;
  plan_type: string;
  bundle_id: string | null;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    const paymentReference = reference || trxref;
    
    if (!paymentReference) {
      return NextResponse.redirect(`${baseUrl}/pricing?error=missing_reference`);
    }

    // Verify the transaction with Paystack
    const transaction = await verifyTransaction(paymentReference);

    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;

    if (transaction.status === 'success') {
      // Update subscription status
      const { data: subscription, error } = await supabaseAny
        .from('subscriptions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('paystack_reference', paymentReference)
        .select('user_id, plan_type, bundle_id')
        .single() as { data: SubscriptionRecord | null; error: Error | null };

      if (error) {
        console.error('Error updating subscription:', error);
      }

      // Redirect to success page
      const plan = subscription?.bundle_id || 'custom';
      return NextResponse.redirect(`${baseUrl}/dashboard?subscription=success&plan=${plan}`);
    } else if (transaction.status === 'pending') {
      // Payment still processing
      return NextResponse.redirect(
        `${baseUrl}/pricing?status=pending&reference=${paymentReference}`
      );
    } else {
      // Payment failed - Update subscription status
      await supabaseAny
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('paystack_reference', paymentReference);

      return NextResponse.redirect(`${baseUrl}/pricing?error=payment_failed`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(`${baseUrl}/pricing?error=verification_failed`);
  }
}
