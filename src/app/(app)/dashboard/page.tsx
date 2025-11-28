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
import { DollarSign, AlertCircle, ShoppingCart, Users, Star, TrendingUp, Plus, Boxes } from "lucide-react";
import { weeklySalesData, initialCustomers } from "@/lib/data";
import { useShop } from '@/context/ShopContext';
import dynamic from 'next/dynamic';
const SalesChart = dynamic(() => import('./components/sales-chart'), { ssr: false });
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from "@/components/ui/button";

const DashboardPage = () => {
  const { products, transactions } = useShop() || {};
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !products || !transactions) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full mb-4 lg:col-span-2" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-24 w-full mb-4" />
          </div>
        </div>
        <Skeleton className="h-32 w-full mb-4" />
      </div>
    );
  }

  const dailyRevenue = transactions.length > 0 ? transactions[0].amount : 0;
  const transactionCount = transactions.length;
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock < p.lowStockThreshold).length;
  const bestSellers = [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 3);
  const averageTransactionValue = transactions.length > 0 ? transactions.reduce((acc, t) => acc + t.amount, 0) / transactions.length : 0;
  const newCustomersThisWeek = initialCustomers.length; // Mock data usage

  return (
    <div className="flex flex-col gap-6 min-w-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{greeting}, Trader!</h1>
          <p className="text-muted-foreground">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            <Plus className="mr-2 h-4 w-4" /> Record Sale
          </Button>
          <Link href="/inventory">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary hover:text-primary/80">
              <Boxes className="mr-2 h-4 w-4" /> Add Stock
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-emerald-50 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Revenue</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">R{dailyRevenue.toFixed(2)}</div>
            <p className="text-xs font-medium text-emerald-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5.2% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">+{transactionCount}</div>
            <p className="text-xs font-medium text-blue-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +10.1% from yesterday
            </p>
          </CardContent>
        </Card>
        <Link href="/inventory" className="cursor-pointer group">
          <Card className="border-none shadow-md bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-amber-700 transition-colors">Low Stock Alerts</CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors">{lowStockItems}</div>
              <p className="text-xs font-medium text-amber-600 mt-1">Items need restocking</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <Card className="border-none shadow-md h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Weekly Sales Performance</CardTitle>
              <CardDescription>An overview of sales throughout the week.</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart data={weeklySalesData} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <Card className="border-none shadow-md bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Transaction Value</CardTitle>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">R{averageTransactionValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Based on recent transactions</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-gradient-to-br from-white to-teal-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Customers</CardTitle>
              <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">+{newCustomersThisWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">In the last 7 days</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-100">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">Best-Selling Products</CardTitle>
          </div>
          <CardDescription>Your top-performing items this month.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-w-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="w-[80px] pl-6">Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right pr-6">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSellers.map((product, index) => (
                  <TableRow key={product.id} className="hover:bg-gray-50/80 border-gray-100 transition-colors">
                    <TableCell className="font-medium pl-6">
                      <Badge className={`text-lg h-8 w-8 flex items-center justify-center rounded-full border-none ${index === 0 ? 'bg-yellow-100 text-yellow-700 shadow-sm' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-50 text-orange-700'
                        }`}>
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">{product.name}</TableCell>
                    <TableCell className="text-right font-bold text-gray-900 pr-6">{product.unitsSold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
