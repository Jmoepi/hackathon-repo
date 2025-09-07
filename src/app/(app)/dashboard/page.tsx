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
import { DollarSign, AlertCircle, ShoppingCart, Users, Star, TrendingUp } from "lucide-react";
import { weeklySalesData, initialCustomers } from "@/lib/data";
import { useShop } from '@/context/ShopContext';
import dynamic from 'next/dynamic';
const SalesChart = dynamic(() => import('./components/sales-chart'), { ssr: false });
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardPage = () => {
  const { products, transactions } = useShop() || {};
  const [loading, setLoading] = useState(true);
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
  const totalRevenue = transactions.reduce((acc, txn) => acc + txn.amount, 0);
  const averageTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newCustomersThisWeek = initialCustomers.filter(c => new Date(c.joined) >= oneWeekAgo).length;

  return (
  <div className="flex flex-col gap-6 min-w-0">
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">R{dailyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">+{transactionCount}</div>
            <p className="text-xs text-muted-foreground">+10.1% from yesterday</p>
          </CardContent>
        </Card>
        <Link href="/inventory" className="cursor-pointer">
          <Card className="hover:border-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>
        </Link>
      </div>

  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 min-w-0">
  <div className="lg:col-span-2 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Sales Performance</CardTitle>
              <CardDescription>An overview of sales throughout the week.</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart data={weeklySalesData} />
            </CardContent>
          </Card>
        </div>

  <div className="flex flex-col gap-6 min-w-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Transaction Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">R{averageTransactionValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Based on recent transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">+{newCustomersThisWeek}</div>
              <p className="text-xs text-muted-foreground">In the last 7 days</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500"/>
            <CardTitle>Best-Selling Products</CardTitle>
          </div>
          <CardDescription>Your top-performing items this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSellers.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <Badge className="text-lg bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100">{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right font-bold">{product.unitsSold}</TableCell>
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
