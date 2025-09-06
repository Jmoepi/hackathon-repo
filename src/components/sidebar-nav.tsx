"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Boxes, QrCode, Users } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContext,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/payments', label: 'Payments', icon: QrCode },
  { href: '/customers', label: 'Customers', icon: Users },
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
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href} onClick={handleNavClick}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
