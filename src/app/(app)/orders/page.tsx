"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Plus,
  User,
  Phone,
  Search,
  ChefHat,
  UtensilsCrossed,
  CheckCircle2,
  Package,
  Timer,
  MoreVertical,
  Printer,
  Trash2,
  Bell,
  ShoppingBag,
  Flame,
  Receipt,
} from "lucide-react";

// Types
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  prepTime: number; // in minutes
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "collected" | "cancelled";
  orderType: "dine-in" | "takeaway" | "delivery";
  tableNumber?: string;
  createdAt: Date;
  total: number;
  notes?: string;
}

// Mock menu items
const menuItems: MenuItem[] = [
  { id: "1", name: "Kota - Full House", price: 65, category: "Kotas", prepTime: 10 },
  { id: "2", name: "Kota - Half", price: 40, category: "Kotas", prepTime: 8 },
  { id: "3", name: "Chips - Large", price: 35, category: "Sides", prepTime: 5 },
  { id: "4", name: "Chips - Medium", price: 25, category: "Sides", prepTime: 5 },
  { id: "5", name: "Burger - Cheese", price: 55, category: "Burgers", prepTime: 12 },
  { id: "6", name: "Burger - Double", price: 75, category: "Burgers", prepTime: 15 },
  { id: "7", name: "Russian & Chips", price: 45, category: "Combos", prepTime: 8 },
  { id: "8", name: "Chicken Wings x6", price: 60, category: "Chicken", prepTime: 15 },
  { id: "9", name: "Pap & Vleis", price: 85, category: "Mains", prepTime: 20 },
  { id: "10", name: "Cold Drink 500ml", price: 18, category: "Drinks", prepTime: 0 },
  { id: "11", name: "Water 500ml", price: 12, category: "Drinks", prepTime: 0 },
  { id: "12", name: "Energy Drink", price: 25, category: "Drinks", prepTime: 0 },
];

// Mock orders
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "001",
    customerName: "Sipho M.",
    customerPhone: "071 234 5678",
    items: [
      { menuItem: menuItems[0], quantity: 2 },
      { menuItem: menuItems[2], quantity: 1 },
      { menuItem: menuItems[9], quantity: 2 },
    ],
    status: "pending",
    orderType: "takeaway",
    createdAt: new Date(Date.now() - 5 * 60000),
    total: 183,
  },
  {
    id: "2",
    orderNumber: "002",
    customerName: "Thandi K.",
    items: [
      { menuItem: menuItems[4], quantity: 1 },
      { menuItem: menuItems[3], quantity: 1 },
      { menuItem: menuItems[10], quantity: 1 },
    ],
    status: "preparing",
    orderType: "dine-in",
    tableNumber: "5",
    createdAt: new Date(Date.now() - 12 * 60000),
    total: 92,
  },
  {
    id: "3",
    orderNumber: "003",
    customerName: "Bongani N.",
    customerPhone: "082 345 6789",
    items: [
      { menuItem: menuItems[7], quantity: 2 },
      { menuItem: menuItems[6], quantity: 1 },
      { menuItem: menuItems[11], quantity: 3 },
    ],
    status: "ready",
    orderType: "takeaway",
    createdAt: new Date(Date.now() - 20 * 60000),
    total: 240,
  },
  {
    id: "4",
    orderNumber: "004",
    customerName: "Nomsa D.",
    items: [
      { menuItem: menuItems[8], quantity: 2 },
      { menuItem: menuItems[9], quantity: 2 },
    ],
    status: "collected",
    orderType: "dine-in",
    tableNumber: "3",
    createdAt: new Date(Date.now() - 45 * 60000),
    total: 206,
  },
];

// Helper functions
const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "preparing":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "ready":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "collected":
      return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "";
  }
};

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "preparing":
      return <ChefHat className="h-4 w-4" />;
    case "ready":
      return <Bell className="h-4 w-4" />;
    case "collected":
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return null;
  }
};

const getTimeSince = (date: Date) => {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

const getOrderTypeIcon = (type: Order["orderType"]) => {
  switch (type) {
    case "dine-in":
      return <UtensilsCrossed className="h-3.5 w-3.5" />;
    case "takeaway":
      return <ShoppingBag className="h-3.5 w-3.5" />;
    case "delivery":
      return <Package className="h-3.5 w-3.5" />;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeView, setActiveView] = useState<"board" | "list">("board");

  // New order form state
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    orderType: "takeaway" as Order["orderType"],
    tableNumber: "",
    notes: "",
    items: [] as OrderItem[],
  });

  // Get unique categories
  const categories = ["all", ...new Set(menuItems.map((item) => item.category))];

  // Filter orders by status for board view
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  // Stats
  const todayOrders = orders.filter(
    (o) => o.createdAt.toDateString() === new Date().toDateString()
  );
  const stats = {
    total: todayOrders.length,
    pending: pendingOrders.length,
    preparing: preparingOrders.length,
    ready: readyOrders.length,
    revenue: todayOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0),
  };

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleAddItemToOrder = (item: MenuItem) => {
    const existingItem = newOrder.items.find(
      (i) => i.menuItem.id === item.id
    );
    if (existingItem) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, { menuItem: item, quantity: 1 }],
      });
    }
  };

  const handleRemoveItemFromOrder = (itemId: string) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter((i) => i.menuItem.id !== itemId),
    });
  };

  const handleUpdateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItemFromOrder(itemId);
      return;
    }
    setNewOrder({
      ...newOrder,
      items: newOrder.items.map((i) =>
        i.menuItem.id === itemId ? { ...i, quantity } : i
      ),
    });
  };

  const calculateOrderTotal = () => {
    return newOrder.items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
  };

  const handleCreateOrder = () => {
    if (!newOrder.customerName || newOrder.items.length === 0) return;

    const order: Order = {
      id: Date.now().toString(),
      orderNumber: String(orders.length + 1).padStart(3, "0"),
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      items: newOrder.items,
      status: "pending",
      orderType: newOrder.orderType,
      tableNumber: newOrder.tableNumber,
      createdAt: new Date(),
      total: calculateOrderTotal(),
      notes: newOrder.notes,
    };

    setOrders([order, ...orders]);
    setNewOrder({
      customerName: "",
      customerPhone: "",
      orderType: "takeaway",
      tableNumber: "",
      notes: "",
      items: [],
    });
    setIsAddDialogOpen(false);
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="overflow-hidden">
      <div className={`h-1 ${
        order.status === "pending" ? "bg-amber-500" :
        order.status === "preparing" ? "bg-blue-500" :
        order.status === "ready" ? "bg-emerald-500" : "bg-slate-400"
      }`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">#{order.orderNumber}</span>
              <Badge variant="outline" className="gap-1">
                {getOrderTypeIcon(order.orderType)}
                <span className="capitalize">{order.orderType}</span>
                {order.tableNumber && ` - T${order.tableNumber}`}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <User className="h-3.5 w-3.5" />
              {order.customerName}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print Ticket
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5 mb-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.menuItem.name}
              </span>
              <span className="text-muted-foreground">
                R{item.menuItem.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            {getTimeSince(order.createdAt)}
          </div>
          <span className="font-bold">R{order.total}</span>
        </div>

        {order.status !== "collected" && order.status !== "cancelled" && (
          <div className="mt-3 flex gap-2">
            {order.status === "pending" && (
              <Button
                size="sm"
                className="flex-1 gap-1"
                onClick={() => handleStatusChange(order.id, "preparing")}
              >
                <ChefHat className="h-4 w-4" />
                Start Preparing
              </Button>
            )}
            {order.status === "preparing" && (
              <Button
                size="sm"
                className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleStatusChange(order.id, "ready")}
              >
                <Bell className="h-4 w-4" />
                Mark Ready
              </Button>
            )}
            {order.status === "ready" && (
              <Button
                size="sm"
                className="flex-1 gap-1"
                variant="outline"
                onClick={() => handleStatusChange(order.id, "collected")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Collected
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage kitchen orders and track status
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Add items and customer details for the order
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 md:grid-cols-2">
              {/* Left: Menu Items */}
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className="capitalize"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {menuItems
                    .filter(
                      (item) =>
                        selectedCategory === "all" ||
                        item.category === selectedCategory
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddItemToOrder(item)}
                        className="flex flex-col items-start p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          R{item.price}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Right: Order Details */}
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter name"
                      value={newOrder.customerName}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, customerName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label htmlFor="orderType">Order Type</Label>
                      <Select
                        value={newOrder.orderType}
                        onValueChange={(value) =>
                          setNewOrder({
                            ...newOrder,
                            orderType: value as Order["orderType"],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="takeaway">Takeaway</SelectItem>
                          <SelectItem value="dine-in">Dine-in</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newOrder.orderType === "dine-in" && (
                      <div className="grid gap-2">
                        <Label htmlFor="tableNumber">Table #</Label>
                        <Input
                          id="tableNumber"
                          placeholder="e.g., 5"
                          value={newOrder.tableNumber}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, tableNumber: e.target.value })
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Order Items
                  </h4>
                  {newOrder.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Click items on the left to add
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {newOrder.items.map((item) => (
                        <div
                          key={item.menuItem.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex-1">{item.menuItem.name}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleUpdateItemQuantity(
                                  item.menuItem.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                handleUpdateItemQuantity(
                                  item.menuItem.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                            <span className="w-16 text-right">
                              R{item.menuItem.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total</span>
                        <span>R{calculateOrderTotal()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={!newOrder.customerName || newOrder.items.length === 0}
              >
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Waiting to start</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Preparing
            </CardTitle>
            <ChefHat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.preparing}</div>
            <p className="text-xs text-muted-foreground">In kitchen</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">
              Ready
            </CardTitle>
            <Bell className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.ready}</div>
            <p className="text-xs text-muted-foreground">For collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Today&apos;s sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Board */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pending Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <h3 className="font-semibold">Pending ({pendingOrders.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {pendingOrders.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No pending orders
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <h3 className="font-semibold">Preparing ({preparingOrders.length})</h3>
          </div>
          <div className="space-y-3">
            {preparingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {preparingOrders.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No orders being prepared
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <h3 className="font-semibold">Ready ({readyOrders.length})</h3>
          </div>
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {readyOrders.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No orders ready
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
