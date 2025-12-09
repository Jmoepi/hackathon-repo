import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        services: ['dashboard'], // Free tier
      });
    }

    // Get subscription services
    const { data: services } = await supabase
      .from('subscription_services')
      .select('service_id')
      .eq('subscription_id', subscription.id);

    const serviceIds = services?.map((s) => s.service_id) || [];

    // Always include dashboard
    if (!serviceIds.includes('dashboard')) {
      serviceIds.unshift('dashboard');
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planType: subscription.plan_type,
        bundleId: subscription.bundle_id,
        monthlyPrice: subscription.monthly_price,
        status: subscription.status,
        startedAt: subscription.started_at,
        expiresAt: subscription.expires_at,
      },
      services: serviceIds,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
