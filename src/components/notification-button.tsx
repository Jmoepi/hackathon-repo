"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Package,
  CreditCard,
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  X,
  Settings,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  type: "sale" | "stock" | "customer" | "alert" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "sale",
    title: "New Sale Completed",
    message: "Payment of R125.00 received via QR code",
    time: "2 min ago",
    read: false,
    actionUrl: "/payments",
  },
  {
    id: "2",
    type: "stock",
    title: "Low Stock Alert",
    message: "Bread (White 700g) is running low - only 5 left",
    time: "15 min ago",
    read: false,
    actionUrl: "/inventory",
  },
  {
    id: "3",
    type: "customer",
    title: "New Customer Added",
    message: "Sipho Ndlovu was added to your customers",
    time: "1 hour ago",
    read: false,
    actionUrl: "/customers",
  },
  {
    id: "4",
    type: "alert",
    title: "Daily Goal Reached! 🎉",
    message: "Congratulations! You've reached your daily sales target of R1,000",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "system",
    title: "Weekly Report Ready",
    message: "Your weekly business report is ready to view",
    time: "5 hours ago",
    read: true,
    actionUrl: "/dashboard",
  },
  {
    id: "6",
    type: "stock",
    title: "Stock Update",
    message: "Milk 1L Full Cream stock updated to 24 units",
    time: "Yesterday",
    read: true,
    actionUrl: "/inventory",
  },
];

const notificationIcons = {
  sale: CreditCard,
  stock: Package,
  customer: Users,
  alert: TrendingUp,
  system: Bell,
};

const notificationColors = {
  sale: "from-emerald-500 to-green-500",
  stock: "from-amber-500 to-orange-500",
  customer: "from-blue-500 to-indigo-500",
  alert: "from-purple-500 to-pink-500",
  system: "from-slate-500 to-gray-500",
};

export function NotificationButton() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-primary/10"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[380px] p-0 border-0 shadow-2xl" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <Link href="/settings">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No notifications to show</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type];
                const colorClass = notificationColors[notification.type];
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative flex gap-3 p-4 transition-colors hover:bg-muted/50",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br",
                      colorClass
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-medium leading-tight",
                          !notification.read && "text-foreground"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="text-xs font-medium text-primary hover:underline"
                            onClick={() => {
                              markAsRead(notification.id);
                              setIsOpen(false);
                            }}
                          >
                            View details
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Delete button (shown on hover) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={clearAll}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary"
              asChild
            >
              <Link href="/notifications">View all notifications</Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
