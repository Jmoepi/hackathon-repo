"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Boxes, QrCode, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { 
        href: "/dashboard", 
        label: "Home", 
        icon: LayoutDashboard,
        gradient: "from-emerald-500 to-teal-500",
    },
    { 
        href: "/inventory", 
        label: "Stock", 
        icon: Boxes,
        gradient: "from-blue-500 to-indigo-500",
    },
    { 
        href: "/payments", 
        label: "Pay", 
        icon: QrCode,
        gradient: "from-purple-500 to-pink-500",
    },
    { 
        href: "/customers", 
        label: "People", 
        icon: Users,
        gradient: "from-orange-500 to-amber-500",
    },
    { 
        href: "/settings", 
        label: "Settings", 
        icon: Settings,
        gradient: "from-slate-500 to-gray-600",
    },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-border/50" />
            
            {/* Nav content */}
            <div className="relative flex items-center justify-around h-16 px-2 pb-safe">
                {navItems.map((item) => {
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
            </div>
        </div>
    );
}
