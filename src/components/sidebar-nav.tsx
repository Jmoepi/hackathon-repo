"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Boxes, QrCode, Users, CreditCard, Settings, UserCircle, Sparkles, CalendarDays, ClipboardList, Truck, FileText, BarChart3, ShoppingCart, Crown, Lock } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContext,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/context/SubscriptionContext';
import type { ServiceId } from '@/lib/services/catalog';

// Map routes to service IDs
const routeToServiceMap: Record<string, ServiceId> = {
  '/dashboard': 'dashboard',
  '/inventory': 'inventory',
  '/bookings': 'bookings',
  '/orders': 'orders',
  '/deliveries': 'deliveries',
  '/invoices': 'invoices',
  '/cart': 'cart',
  '/payments': 'payments',
  '/customers': 'customers',
  '/airtime-data': 'airtime',
  '/reports': 'reports',
};

// Routes that don't require service subscription
const freeRoutes = ['/profile', '/settings', '/pricing'];

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  badge?: string;
  serviceId?: ServiceId;
}

const navItems: NavItem[] = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    gradient: 'from-emerald-500 to-teal-500',
    serviceId: 'dashboard',
  },
  { 
    href: '/inventory', 
    label: 'Inventory', 
    icon: Boxes,
    gradient: 'from-blue-500 to-indigo-500',
    serviceId: 'inventory',
  },
  { 
    href: '/bookings', 
    label: 'Bookings', 
    icon: CalendarDays,
    gradient: 'from-pink-500 to-rose-500',
    badge: 'New',
    serviceId: 'bookings',
  },
  { 
    href: '/orders', 
    label: 'Orders', 
    icon: ClipboardList,
    gradient: 'from-amber-500 to-orange-500',
    badge: 'New',
    serviceId: 'orders',
  },
  { 
    href: '/deliveries', 
    label: 'Deliveries', 
    icon: Truck,
    gradient: 'from-cyan-500 to-teal-500',
    badge: 'New',
    serviceId: 'deliveries',
  },
  { 
    href: '/invoices', 
    label: 'Invoices', 
    icon: FileText,
    gradient: 'from-violet-500 to-indigo-500',
    badge: 'New',
    serviceId: 'invoices',
  },
  { 
    href: '/cart', 
    label: 'Cart & Checkout', 
    icon: ShoppingCart,
    gradient: 'from-fuchsia-500 to-pink-500',
    badge: 'New',
    serviceId: 'cart',
  },
  { 
    href: '/payments', 
    label: 'Payments', 
    icon: QrCode,
    gradient: 'from-purple-500 to-pink-500',
    serviceId: 'payments',
  },
  { 
    href: '/customers', 
    label: 'Customers', 
    icon: Users,
    gradient: 'from-orange-500 to-amber-500',
    serviceId: 'customers',
  },
  { 
    href: '/airtime-data', 
    label: 'Airtime & Data', 
    icon: CreditCard,
    gradient: 'from-cyan-500 to-blue-500',
    serviceId: 'airtime',
  },
  { 
    href: '/reports', 
    label: 'Reports', 
    icon: BarChart3,
    gradient: 'from-emerald-500 to-green-500',
    badge: 'New',
    serviceId: 'reports',
  },
  { 
    href: '/profile', 
    label: 'My Profile', 
    icon: UserCircle,
    gradient: 'from-violet-500 to-purple-500',
  },
  { 
    href: '/settings', 
    label: 'Settings', 
    icon: Settings,
    gradient: 'from-slate-500 to-gray-600',
  },
  { 
    href: '/pricing', 
    label: 'Upgrade Plan', 
    icon: Crown,
    gradient: 'from-amber-500 to-yellow-500',
    badge: 'Pro',
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { hasService, activeServices, isLoading } = useSubscription();

  // Access sidebar context to close on navigation
  const sidebarCtx = React.useContext(SidebarContext);
  const handleNavClick = () => {
    if (sidebarCtx && sidebarCtx.isMobile) {
      sidebarCtx.setOpenMobile(false);
    }
  };

  // Filter nav items based on user's subscription
  const visibleNavItems = navItems.filter((item) => {
    // Free routes are always visible
    if (freeRoutes.includes(item.href)) return true;
    
    // If no service ID required, show it
    if (!item.serviceId) return true;
    
    // Check if user has access to this service
    return hasService(item.serviceId);
  });

  return (
    <SidebarMenu className="space-y-1">
      {visibleNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
              className={cn(
                "relative h-11 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Link href={item.href} onClick={handleNavClick} className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isActive 
                    ? `bg-gradient-to-br ${item.gradient} text-white shadow-md` 
                    : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-primary to-primary/60" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
