"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Boxes, QrCode, Users, MoreHorizontal, Settings, LogOut, User, FileText, CalendarDays, ClipboardList, Truck, CreditCard, ShoppingCart, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import type { ServiceId } from "@/lib/services/catalog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    serviceId?: ServiceId;
}

// Primary nav items (shown in bottom bar)
const primaryNavItems: NavItem[] = [
    { 
        href: "/dashboard", 
        label: "Home", 
        icon: LayoutDashboard,
        gradient: "from-emerald-500 to-teal-500",
        serviceId: "dashboard",
    },
    { 
        href: "/inventory", 
        label: "Stock", 
        icon: Boxes,
        gradient: "from-blue-500 to-indigo-500",
        serviceId: "inventory",
    },
    { 
        href: "/payments", 
        label: "Pay", 
        icon: QrCode,
        gradient: "from-purple-500 to-pink-500",
        serviceId: "payments",
    },
    { 
        href: "/customers", 
        label: "People", 
        icon: Users,
        gradient: "from-orange-500 to-amber-500",
        serviceId: "customers",
    },
];

// Secondary nav items (shown in "More" menu)
const secondaryNavItems: NavItem[] = [
    {
        href: "/bookings",
        label: "Bookings",
        icon: CalendarDays,
        gradient: "from-pink-500 to-rose-500",
        serviceId: "bookings",
    },
    {
        href: "/orders",
        label: "Orders",
        icon: ClipboardList,
        gradient: "from-amber-500 to-orange-500",
        serviceId: "orders",
    },
    {
        href: "/deliveries",
        label: "Deliveries",
        icon: Truck,
        gradient: "from-cyan-500 to-teal-500",
        serviceId: "deliveries",
    },
    {
        href: "/invoices",
        label: "Invoices",
        icon: FileText,
        gradient: "from-violet-500 to-indigo-500",
        serviceId: "invoices",
    },
    {
        href: "/airtime-data",
        label: "Airtime",
        icon: CreditCard,
        gradient: "from-cyan-500 to-blue-500",
        serviceId: "airtime",
    },
    {
        href: "/cart",
        label: "Cart",
        icon: ShoppingCart,
        gradient: "from-fuchsia-500 to-pink-500",
        serviceId: "cart",
    },
    {
        href: "/reports",
        label: "Reports",
        icon: FileText,
        gradient: "from-emerald-500 to-green-500",
        serviceId: "reports",
    },
];

export function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const { hasService } = useSubscription();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    // Filter primary nav items based on subscription
    const visiblePrimaryItems = primaryNavItems.filter((item) => {
        if (!item.serviceId) return true;
        return hasService(item.serviceId);
    });

    // Filter secondary nav items based on subscription
    const visibleSecondaryItems = secondaryNavItems.filter((item) => {
        if (!item.serviceId) return true;
        return hasService(item.serviceId);
    });

    const secondaryPaths = visibleSecondaryItems.map(item => item.href);
    const isMoreActive = ["/settings", "/profile", "/pricing", ...secondaryPaths].includes(pathname);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-border/50" />
            
            {/* Nav content */}
            <div className="relative flex items-center justify-around h-16 px-2 pb-safe">
                {visiblePrimaryItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300",
                                    isActive 
                                        ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg scale-110` 
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium mt-1 transition-all duration-200",
                                isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
                
                {/* More menu with dropdown */}
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200",
                                isMoreActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300",
                                    isMoreActive 
                                        ? "bg-gradient-to-br from-slate-500 to-gray-600 text-white shadow-lg scale-110" 
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <MoreHorizontal className={cn("h-5 w-5", isMoreActive && "drop-shadow-sm")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium mt-1 transition-all duration-200",
                                isMoreActive ? "text-foreground font-semibold" : "text-muted-foreground"
                            )}>
                                More
                            </span>
                            {isMoreActive && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 mb-2">
                        {/* Secondary services the user has access to */}
                        {visibleSecondaryItems.map((item) => (
                            <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                                <item.icon className="h-4 w-4 mr-2" />
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                        
                        {visibleSecondaryItems.length > 0 && <DropdownMenuSeparator />}
                        
                        <DropdownMenuItem onClick={() => router.push('/profile')}>
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/settings')}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/pricing')}>
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={handleSignOut}
                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
