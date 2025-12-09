import { createClient } from '../client';
import type {
  Subscription,
  SubscriptionInsert,
  SubscriptionUpdate,
  SubscriptionService,
  SubscriptionServiceInsert,
} from '../types';
import { ServiceId, getBundleById, getServicesByIds } from '@/lib/services/catalog';

const supabase = createClient();

// ============================================================================
// Subscriptions
// ============================================================================

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }

  return data;
}

export async function getSubscriptionServices(subscriptionId: string): Promise<SubscriptionService[]> {
  const { data, error } = await supabase
    .from('subscription_services')
    .select('*')
    .eq('subscription_id', subscriptionId);

  if (error) throw error;
  return data || [];
}

export async function createSubscription(
  userId: string,
  planType: 'starter' | 'growth' | 'pro' | 'custom' | 'trial',
  services: ServiceId[],
  monthlyPrice: number,
  bundleId?: string
): Promise<Subscription> {
  // Create subscription
  const subscriptionData: SubscriptionInsert = {
    user_id: userId,
    plan_type: planType,
    bundle_id: bundleId || null,
    monthly_price: monthlyPrice,
    status: 'active',
  };

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .insert(subscriptionData)
    .select()
    .single();

  if (subError) throw subError;

  // Add services to subscription
  if (services.length > 0) {
    const serviceRecords: SubscriptionServiceInsert[] = services.map((serviceId) => ({
      subscription_id: subscription.id,
      service_id: serviceId,
    }));

    const { error: servicesError } = await supabase
      .from('subscription_services')
      .insert(serviceRecords);

    if (servicesError) throw servicesError;
  }

  return subscription;
}

export async function createBundleSubscription(
  userId: string,
  bundleId: string
): Promise<Subscription> {
  const bundle = getBundleById(bundleId);
  if (!bundle) throw new Error(`Bundle not found: ${bundleId}`);

  const planType = bundleId as 'starter' | 'growth' | 'pro';
  
  return createSubscription(
    userId,
    planType,
    bundle.services,
    bundle.monthlyPrice,
    bundleId
  );
}

export async function createCustomSubscription(
  userId: string,
  services: ServiceId[],
  monthlyPrice: number
): Promise<Subscription> {
  return createSubscription(userId, 'custom', services, monthlyPrice);
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancel_at_period_end: true,
    })
    .eq('id', subscriptionId);

  if (error) throw error;
}

export async function updateSubscription(
  subscriptionId: string,
  updates: SubscriptionUpdate
): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function hasAccessToService(
  userId: string,
  serviceId: ServiceId
): Promise<boolean> {
  // Dashboard is always free
  if (serviceId === 'dashboard') return true;

  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const services = await getSubscriptionServices(subscription.id);
  return services.some((s) => s.service_id === serviceId);
}

export async function getUserServices(userId: string): Promise<ServiceId[]> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return ['dashboard']; // Free tier

  const services = await getSubscriptionServices(subscription.id);
  return services.map((s) => s.service_id as ServiceId);
}
