
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
import { initialProducts, weeklySalesData, initialTransactions, initialCustomers } from "@/lib/data";
import SalesChart from "./components/sales-chart";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const dailyRevenue = 1250.75;
  const transactions = 42;
  const lowStockItems = initialProducts.filter(p => p.stock < p.lowStockThreshold).length;

  const bestSellers = [...initialProducts].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 3);
  
  const totalRevenue = initialTransactions.reduce((acc, txn) => acc + txn.amount, 0);
  const averageTransactionValue = totalRevenue / initialTransactions.length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newCustomersThisWeek = initialCustomers.filter(c => new Date(c.joined) >= oneWeekAgo).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{dailyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{transactions}</div>
            <p className="text-xs text-muted-foreground">+10.1% from yesterday</p>
          </CardContent>
        </Card>
        <Link href="/inventory" className="cursor-pointer">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
            </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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

        <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Transaction Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R{averageTransactionValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Based on recent transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{newCustomersThisWeek}</div>
                <p className="text-xs text-muted-foreground">In the last 7 days</p>
              </CardContent>
            </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent"/>
                <CardTitle>Best-Selling Products</CardTitle>
            </div>
            <CardDescription>Your top-performing items this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestSellers.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Badge variant="outline" className="text-lg">{index + 1}</Badge>
                    {product.name}
                  </TableCell>
                  <TableCell className="text-right font-bold">{product.unitsSold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
