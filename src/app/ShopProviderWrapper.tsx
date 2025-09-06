"use client";
import { ShopProvider } from '@/context/ShopContext';

export default function ShopProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ShopProvider>{children}</ShopProvider>;
}
