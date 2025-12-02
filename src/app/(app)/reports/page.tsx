"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Mock data for different reports
const salesData = {
  daily: [
    { date: "Mon", revenue: 45000, orders: 12, profit: 15000 },
    { date: "Tue", revenue: 52000, orders: 15, profit: 18000 },
    { date: "Wed", revenue: 48000, orders: 14, profit: 16500 },
    { date: "Thu", revenue: 61000, orders: 18, profit: 21000 },
    { date: "Fri", revenue: 72000, orders: 22, profit: 25000 },
    { date: "Sat", revenue: 85000, orders: 28, profit: 32000 },
    { date: "Sun", revenue: 38000, orders: 10, profit: 12500 },
  ],
  summary: {
    totalRevenue: 401000,
    totalOrders: 119,
    totalProfit: 140000,
    avgOrderValue: 3370,
    previousRevenue: 365000,
    previousOrders: 98,
    previousProfit: 125000,
  },
};

const topProducts = [
  { id: 1, name: "Premium Hair Treatment", sales: 45, revenue: 225000, trend: "up" },
  { id: 2, name: "Manicure & Pedicure", sales: 38, revenue: 152000, trend: "up" },
  { id: 3, name: "Full Body Massage", sales: 32, revenue: 224000, trend: "down" },
  { id: 4, name: "Haircut & Styling", sales: 28, revenue: 84000, trend: "up" },
  { id: 5, name: "Facial Treatment", sales: 24, revenue: 120000, trend: "down" },
];

const topCustomers = [
  { id: 1, name: "Adaeze Okonkwo", orders: 12, totalSpent: 156000, lastVisit: "2025-01-18" },
  { id: 2, name: "Chukwuemeka Nwosu", orders: 10, totalSpent: 125000, lastVisit: "2025-01-17" },
  { id: 3, name: "Fatima Bello", orders: 8, totalSpent: 98000, lastVisit: "2025-01-19" },
  { id: 4, name: "Olumide Adeyemi", orders: 7, totalSpent: 87500, lastVisit: "2025-01-16" },
  { id: 5, name: "Grace Eze", orders: 6, totalSpent: 72000, lastVisit: "2025-01-15" },
];

const recentTransactions = [
  { id: 1, type: "sale", description: "Premium Hair Treatment", amount: 5000, date: "2025-01-19 14:30", status: "completed" },
  { id: 2, type: "sale", description: "Manicure Set", amount: 3500, date: "2025-01-19 13:15", status: "completed" },
  { id: 3, type: "refund", description: "Facial Treatment", amount: -5000, date: "2025-01-19 11:45", status: "refunded" },
  { id: 4, type: "sale", description: "Haircut & Styling", amount: 3000, date: "2025-01-19 10:30", status: "completed" },
  { id: 5, type: "sale", description: "Full Body Massage", amount: 7000, date: "2025-01-19 09:00", status: "completed" },
  { id: 6, type: "expense", description: "Product Restock", amount: -45000, date: "2025-01-18 16:00", status: "paid" },
  { id: 7, type: "sale", description: "Hair Extensions", amount: 15000, date: "2025-01-18 15:00", status: "completed" },
];

const inventoryReport = [
  { id: 1, name: "Shampoo - Professional", stock: 45, reorderLevel: 20, status: "good", value: 67500 },
  { id: 2, name: "Hair Treatment Oil", stock: 12, reorderLevel: 15, status: "low", value: 36000 },
  { id: 3, name: "Nail Polish Set", stock: 8, reorderLevel: 10, status: "critical", value: 24000 },
  { id: 4, name: "Massage Oil", stock: 30, reorderLevel: 10, status: "good", value: 45000 },
  { id: 5, name: "Facial Cream", stock: 5, reorderLevel: 10, status: "critical", value: 25000 },
  { id: 6, name: "Hair Dye - Assorted", stock: 25, reorderLevel: 15, status: "good", value: 75000 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const getStockStatus = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "low":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleExport = (format: "pdf" | "excel") => {
    // In a real app, this would generate and download the report
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  const revenueChange = parseFloat(calculateChange(salesData.summary.totalRevenue, salesData.summary.previousRevenue));
  const ordersChange = parseFloat(calculateChange(salesData.summary.totalOrders, salesData.summary.previousOrders));
  const profitChange = parseFloat(calculateChange(salesData.summary.totalProfit, salesData.summary.previousProfit));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.summary.totalRevenue)}</div>
            <div className={`flex items-center text-xs ${revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {revenueChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{Math.abs(revenueChange)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.summary.totalOrders}</div>
            <div className={`flex items-center text-xs ${ordersChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {ordersChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{Math.abs(ordersChange)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.summary.totalProfit)}</div>
            <div className={`flex items-center text-xs ${profitChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {profitChange >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{Math.abs(profitChange)}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.summary.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Daily Sales Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue trend for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesData.daily.map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="w-10 text-sm font-medium">{day.date}</span>
                      <div className="flex-1">
                        <div 
                          className="h-8 bg-primary rounded-sm flex items-center justify-end pr-2"
                          style={{ width: `${(day.revenue / 85000) * 100}%` }}
                        >
                          <span className="text-xs text-primary-foreground font-medium">
                            {formatCurrency(day.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest sales and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 6).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                      <span className={`font-medium ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Breakdown</CardTitle>
              <CardDescription>Detailed daily sales report</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.daily.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">{day.date}</TableCell>
                      <TableCell className="text-right">{day.orders}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day.revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day.profit)}</TableCell>
                      <TableCell className="text-right">
                        {((day.profit / day.revenue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{salesData.summary.totalOrders}</TableCell>
                    <TableCell className="text-right">{formatCurrency(salesData.summary.totalRevenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(salesData.summary.totalProfit)}</TableCell>
                    <TableCell className="text-right">
                      {((salesData.summary.totalProfit / salesData.summary.totalRevenue) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products this period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.sales} units</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                      <TableCell className="text-right">
                        {product.trend === "up" ? (
                          <span className="flex items-center justify-end text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Up
                          </span>
                        ) : (
                          <span className="flex items-center justify-end text-red-600">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            Down
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Your most valuable customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Last Visit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{customer.orders}</TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(customer.lastVisit).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Inventory Value</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(inventoryReport.reduce((sum, item) => sum + item.value, 0))}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Low Stock Items</CardDescription>
                <CardTitle className="text-2xl text-yellow-600">
                  {inventoryReport.filter((item) => item.status === "low").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Critical Stock</CardDescription>
                <CardTitle className="text-2xl text-red-600">
                  {inventoryReport.filter((item) => item.status === "critical").length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Report</CardTitle>
              <CardDescription>Current inventory levels and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">In Stock</TableHead>
                    <TableHead className="text-right">Reorder Level</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryReport.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                      <TableCell className="text-right">{item.reorderLevel}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={getStockStatus(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
