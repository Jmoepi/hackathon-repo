"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type { ServiceId } from '@/lib/services/catalog';
import { BUNDLES, getBundleById } from '@/lib/services/catalog';

// Subscription types
export type PlanType = 'starter' | 'growth' | 'pro' | 'custom' | 'free';

export interface UserSubscription {
  id: string;
  planType: PlanType;
  bundleId: string | null;
  monthlyPrice: number;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  startedAt: string;
  expiresAt: string | null;
  services: ServiceId[];
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  activeServices: ServiceId[];
  isLoading: boolean;
  hasService: (serviceId: ServiceId) => boolean;
  hasAnyService: (serviceIds: ServiceId[]) => boolean;
  refreshSubscription: () => Promise<void>;
  // For demo/development - allows setting services without database
  setDemoServices: (services: ServiceId[]) => void;
  clearDemoMode: () => void;
  isDemoMode: boolean;
  // Subscription actions
  initializeSubscription: (planType: 'bundle' | 'custom', bundleId?: string, services?: ServiceId[]) => Promise<{ success: boolean; authorizationUrl?: string; error?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; error?: string }>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Default free services everyone gets
const FREE_SERVICES: ServiceId[] = ['dashboard'];

// Services that don't require subscription (always accessible)
const ALWAYS_ACCESSIBLE: string[] = ['/pricing', '/profile', '/settings', '/onboarding'];

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [activeServices, setActiveServices] = useState<ServiceId[]>(FREE_SERVICES);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load subscription from API
  const loadSubscription = useCallback(async () => {
    if (!user?.id) {
      return null;
    }

    try {
      const response = await fetch('/api/subscriptions/current');
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      
      if (!data.subscription) {
        return null;
      }

      const userSubscription: UserSubscription = {
        id: data.subscription.id,
        planType: data.subscription.planType as PlanType,
        bundleId: data.subscription.bundleId,
        monthlyPrice: data.subscription.monthlyPrice,
        status: data.subscription.status,
        startedAt: data.subscription.startedAt,
        expiresAt: data.subscription.expiresAt,
        services: data.services as ServiceId[],
      };

      return userSubscription;
    } catch (error) {
      console.error('Error loading subscription:', error);
      return null;
    }
  }, [user?.id]);

  // Refresh subscription data
  const refreshSubscription = useCallback(async () => {
    if (isDemoMode) return;
    
    setIsLoading(true);
    const sub = await loadSubscription();
    setSubscription(sub);
    setActiveServices(sub?.services || FREE_SERVICES);
    setIsLoading(false);
  }, [loadSubscription, isDemoMode]);

  // Initialize subscription payment
  const initializeSubscription = useCallback(async (
    planType: 'bundle' | 'custom',
    bundleId?: string,
    services?: ServiceId[]
  ): Promise<{ success: boolean; authorizationUrl?: string; error?: string }> => {
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, bundleId, services }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to initialize subscription' };
      }

      return {
        success: true,
        authorizationUrl: data.authorization_url,
      };
    } catch (error) {
      console.error('Error initializing subscription:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to cancel subscription' };
      }

      // Refresh subscription after cancellation
      await refreshSubscription();

      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: 'Network error' };
    }
  }, [refreshSubscription]);

  // Initialize subscription
  useEffect(() => {
    const initialize = async () => {
      if (authLoading) return;

      setIsLoading(true);

      // Check for demo mode in localStorage
      const demoServices = localStorage.getItem('tradahub-demo-services');
      if (demoServices) {
        try {
          const parsed = JSON.parse(demoServices) as ServiceId[];
          setActiveServices([...new Set([...FREE_SERVICES, ...parsed])]);
          setIsDemoMode(true);
          setIsLoading(false);
          return;
        } catch (e) {
          // Invalid data, continue with normal flow
        }
      }

      if (isAuthenticated && user?.id) {
        const sub = await loadSubscription();
        setSubscription(sub);
        setActiveServices(sub?.services || FREE_SERVICES);
      } else {
        // Not authenticated - use free services only
        setActiveServices(FREE_SERVICES);
      }

      setIsLoading(false);
    };

    initialize();
  }, [authLoading, isAuthenticated, user?.id, loadSubscription]);

  // Set demo services (for development/testing)
  const setDemoServices = useCallback((services: ServiceId[]) => {
    const allServices = [...new Set([...FREE_SERVICES, ...services])];
    setActiveServices(allServices);
    setIsDemoMode(true);
    localStorage.setItem('tradahub-demo-services', JSON.stringify(services));
  }, []);

  // Clear demo mode
  const clearDemoMode = useCallback(() => {
    localStorage.removeItem('tradahub-demo-services');
    setIsDemoMode(false);
    // Trigger a refresh to get actual subscription
    refreshSubscription();
  }, [refreshSubscription]);

  // Check if user has a specific service
  const hasService = useCallback((serviceId: ServiceId): boolean => {
    return activeServices.includes(serviceId);
  }, [activeServices]);

  // Check if user has any of the given services
  const hasAnyService = useCallback((serviceIds: ServiceId[]): boolean => {
    return serviceIds.some((id) => activeServices.includes(id));
  }, [activeServices]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        activeServices,
        isLoading,
        hasService,
        hasAnyService,
        refreshSubscription,
        setDemoServices,
        clearDemoMode,
        isDemoMode,
        initializeSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Helper hook to check access to a route
export function useServiceAccess(serviceId: ServiceId) {
  const { hasService, isLoading } = useSubscription();
  return {
    hasAccess: hasService(serviceId),
    isLoading,
  };
}

// Export constants
export { FREE_SERVICES, ALWAYS_ACCESSIBLE };
