"use client";
import { ShopProvider } from '@/context/ShopContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';

export default function ShopProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionProvider>
      <ShopProvider>{children}</ShopProvider>
    </SubscriptionProvider>
  );
}
