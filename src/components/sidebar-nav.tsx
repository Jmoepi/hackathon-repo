"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Boxes, QrCode, Users, CreditCard, Settings, UserCircle, Sparkles } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContext,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    gradient: 'from-emerald-500 to-teal-500',
  },
  { 
    href: '/inventory', 
    label: 'Inventory', 
    icon: Boxes,
    gradient: 'from-blue-500 to-indigo-500',
  },
  { 
    href: '/payments', 
    label: 'Payments', 
    icon: QrCode,
    gradient: 'from-purple-500 to-pink-500',
  },
  { 
    href: '/customers', 
    label: 'Customers', 
    icon: Users,
    gradient: 'from-orange-500 to-amber-500',
  },
  { 
    href: '/airtime-data', 
    label: 'Airtime & Data', 
    icon: CreditCard,
    gradient: 'from-cyan-500 to-blue-500',
    badge: 'New',
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
];

export default function SidebarNav() {
  const pathname = usePathname();

  // Access sidebar context to close on navigation
  const sidebarCtx = React.useContext(SidebarContext);
  const handleNavClick = () => {
    if (sidebarCtx && sidebarCtx.isMobile) {
      sidebarCtx.setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu className="space-y-1">
      {navItems.map((item) => {
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
