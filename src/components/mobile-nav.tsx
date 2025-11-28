"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Boxes, QrCode, Users, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/inventory", label: "Stock", icon: Boxes },
    { href: "/payments", label: "Pay", icon: QrCode },
    { href: "/customers", label: "People", icon: Users },
    { href: "/airtime-data", label: "Airtime", icon: CreditCard },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 pb-safe md:hidden">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-1.5 rounded-full transition-all duration-200",
                                    isActive ? "bg-primary/10 scale-110" : "bg-transparent"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
