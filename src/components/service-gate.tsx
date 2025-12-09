"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/context/SubscriptionContext';
import type { ServiceId } from '@/lib/services/catalog';
import { getServiceById } from '@/lib/services/catalog';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceGateProps {
  serviceId: ServiceId;
  children: React.ReactNode;
}

/**
 * Wraps a page/component and only renders children if user has access to the service.
 * Shows an upgrade prompt if they don't have access.
 */
export function ServiceGate({ serviceId, children }: ServiceGateProps) {
  const { hasService, isLoading } = useSubscription();
  const router = useRouter();
  const service = getServiceById(serviceId);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // User has access - render children
  if (hasService(serviceId)) {
    return <>{children}</>;
  }

  // User doesn't have access - show upgrade prompt
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">
            {service?.name || 'Feature'} Not Available
          </CardTitle>
          <CardDescription className="text-base">
            Upgrade your plan to access {service?.name || 'this feature'} and unlock its full potential.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {service && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">What you&apos;ll get:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {service.features?.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => router.push('/pricing')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook to check service access and optionally redirect
 */
export function useServiceGate(serviceId: ServiceId, redirectTo?: string) {
  const { hasService, isLoading } = useSubscription();
  const router = useRouter();
  const hasAccess = hasService(serviceId);

  useEffect(() => {
    if (!isLoading && !hasAccess && redirectTo) {
      router.push(redirectTo);
    }
  }, [isLoading, hasAccess, redirectTo, router]);

  return { hasAccess, isLoading };
}
