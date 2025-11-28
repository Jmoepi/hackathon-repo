"use client"

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SidebarNav from '@/components/sidebar-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MobileNav } from '@/components/mobile-nav';
import { NotificationButton } from '@/components/notification-button';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/context/AuthContext';
import { Settings, ChevronRight, LogOut } from 'lucide-react';

// Helper function to get user initials
function getInitials(firstName?: string | null, lastName?: string | null, businessName?: string | null): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }
  if (businessName) {
    const words = businessName.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return businessName.slice(0, 2).toUpperCase();
  }
  return 'TH';
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
      <Sidebar className="border-r-0">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-50" />
              <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-2.5 rounded-xl shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold font-headline text-foreground">TradaHub</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Your Business, Your Pocket</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-border/50">
          <Link href="/profile" className="block">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors cursor-pointer group">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src={profile?.avatar_url || undefined} alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold">
                  {getInitials(profile?.first_name, profile?.last_name, profile?.business_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.business_name || profile?.first_name || 'My Business'}
                </p>
                <p className="text-xs text-muted-foreground truncate">View Profile</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full mt-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex items-center gap-2 lg:hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-white"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-bold font-headline text-foreground">TradaHub</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationButton />
            <Button variant="ghost" size="icon" className="hover:bg-primary/10" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="lg:hidden hover:bg-primary/10">
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">
                    {getInitials(profile?.first_name, profile?.last_name, profile?.business_name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 bg-mesh-gradient min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
    </ProtectedRoute>
  );
}
