"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Boxes, QrCode, Users, MoreHorizontal, Settings, LogOut, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
];

export function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const isMoreActive = ["/settings", "/profile", "/reports"].includes(pathname);

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
                        <DropdownMenuItem onClick={() => router.push('/profile')}>
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/settings')}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/reports')}>
                            <FileText className="h-4 w-4 mr-2" />
                            Reports
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
