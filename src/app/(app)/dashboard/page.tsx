"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, AlertCircle, ShoppingCart, Users, Star, TrendingUp, Plus, Boxes, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { weeklySalesData } from "@/lib/data";
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
const SalesChart = dynamic(() => import('./components/sales-chart'), { ssr: false });
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProfileCompletionBanner } from "@/components/profile-completion-banner";

const DashboardPage = () => {
  const { products, transactions, customers } = useShop() || {};
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Hello");

  // Get the user's display name
  const userName = profile?.first_name || profile?.business_name || "there";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !products || !transactions) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const dailyRevenue = transactions.length > 0 ? transactions.reduce((acc, t) => acc + t.amount, 0) : 0;
  const transactionCount = transactions.length;
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock < p.lowStockThreshold).length;
  const bestSellers = [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 4);
  const averageTransactionValue = transactions.length > 0 ? transactions.reduce((acc, t) => acc + t.amount, 0) / transactions.length : 0;
  const newCustomersThisWeek = customers?.length || 0;

  const stats = [
    {
      title: "Today's Revenue",
      value: `R${dailyRevenue.toFixed(2)}`,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
    },
    {
      title: "Transactions",
      value: transactionCount.toString(),
      change: "+8.2%",
      changeType: "positive" as const,
      icon: ShoppingCart,
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-500/10 to-indigo-500/10",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockItems.toString(),
      change: lowStockItems > 0 ? "Action needed" : "All good",
      changeType: lowStockItems > 0 ? "warning" : "positive" as const,
      icon: AlertCircle,
      gradient: lowStockItems > 0 ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-500",
      bgGradient: lowStockItems > 0 ? "from-amber-500/10 to-orange-500/10" : "from-emerald-500/10 to-teal-500/10",
      href: "/inventory",
    },
    {
      title: "New Customers",
      value: `+${newCustomersThisWeek}`,
      change: "This week",
      changeType: "neutral" as const,
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Profile Completion Banner */}
      <ProfileCompletionBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Welcome back</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground tracking-tight">
            {greeting}, {userName}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105">
            <Plus className="mr-2 h-4 w-4" /> Record Sale
          </Button>
          <Link href="/inventory">
            <Button variant="outline" className="border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300">
              <Boxes className="mr-2 h-4 w-4" /> Add Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const content = (
            <Card className={cn(
              "relative overflow-hidden border-0 shadow-lg transition-all duration-300",
              stat.href && "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
            )}>
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", stat.bgGradient)} />
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold font-headline text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        {stat.changeType === "positive" && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
                        {stat.changeType === "warning" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                        <span className={cn(
                          "text-xs font-medium",
                          stat.changeType === "positive" && "text-emerald-600",
                          stat.changeType === "warning" && "text-amber-600",
                          stat.changeType === "neutral" && "text-muted-foreground"
                        )}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={cn("p-3 rounded-2xl bg-gradient-to-br shadow-lg", stat.gradient)}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

          return stat.href ? (
            <Link key={i} href={stat.href} className="group cursor-pointer">
              {content}
            </Link>
          ) : (
            <div key={i}>{content}</div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold font-headline">Sales Overview</CardTitle>
                <CardDescription>Weekly performance at a glance</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.3%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <SalesChart data={weeklySalesData} />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                  <p className="text-2xl font-bold font-headline">R{averageTransactionValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10">
                  <Star className="h-4 w-4 text-amber-500" />
                </div>
                <CardTitle className="text-base font-semibold">Top Sellers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {bestSellers.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                      index === 0 && "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
                      index === 1 && "bg-gradient-to-br from-slate-300 to-slate-400 text-white",
                      index === 2 && "bg-gradient-to-br from-orange-300 to-orange-400 text-white",
                      index > 2 && "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.unitsSold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
                <CardDescription>Your latest sales activity</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="pl-6">Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 5).map((txn, index) => (
                <TableRow 
                  key={txn.id} 
                  className={cn(
                    "hover:bg-muted/50 border-border/50 transition-colors",
                    index === 0 && "bg-emerald-50/50 dark:bg-emerald-950/20"
                  )}
                >
                  <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                    {txn.id.slice(0, 12)}...
                  </TableCell>
                  <TableCell className="font-semibold">R{txn.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{txn.customer}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "font-medium border-0",
                        txn.status === 'Completed' 
                          ? "bg-emerald-500/10 text-emerald-600" 
                          : "bg-amber-500/10 text-amber-600"
                      )}
                    >
                      {txn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
