"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Package,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

interface Cart {
  id: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "active" | "abandoned" | "converted" | "recovered";
  createdAt: Date;
  updatedAt: Date;
  abandonedAt?: Date;
  recoveryEmailSent?: boolean;
}

// Mock current cart (active shopping session)
const initialCurrentCart: CartItem[] = [
  { id: "1", productId: "prod-1", productName: "Premium Hair Shampoo", price: 4500, quantity: 2 },
  { id: "2", productId: "prod-2", productName: "Conditioner 500ml", price: 3500, quantity: 1 },
  { id: "3", productId: "prod-3", productName: "Hair Treatment Oil", price: 6000, quantity: 1, variant: "Large" },
];

// Mock abandoned carts
const mockAbandonedCarts: Cart[] = [
  {
    id: "cart-1",
    customerId: "cust-1",
    customerName: "Amara Johnson",
    customerEmail: "amara@example.com",
    customerPhone: "+234 801 234 5678",
    items: [
      { id: "1a", productId: "prod-1", productName: "Premium Hair Shampoo", price: 4500, quantity: 3 },
      { id: "1b", productId: "prod-5", productName: "Styling Gel", price: 2500, quantity: 2 },
    ],
    subtotal: 18500,
    tax: 1387.5,
    total: 19887.5,
    status: "abandoned",
    createdAt: new Date("2025-01-18T10:30:00"),
    updatedAt: new Date("2025-01-18T11:45:00"),
    abandonedAt: new Date("2025-01-18T11:45:00"),
    recoveryEmailSent: false,
  },
  {
    id: "cart-2",
    customerId: "cust-2",
    customerName: "David Obi",
    customerEmail: "david.obi@example.com",
    items: [
      { id: "2a", productId: "prod-3", productName: "Hair Treatment Oil", price: 6000, quantity: 1 },
    ],
    subtotal: 6000,
    tax: 450,
    total: 6450,
    status: "abandoned",
    createdAt: new Date("2025-01-17T14:20:00"),
    updatedAt: new Date("2025-01-17T14:35:00"),
    abandonedAt: new Date("2025-01-17T14:35:00"),
    recoveryEmailSent: true,
  },
  {
    id: "cart-3",
    customerName: "Guest Customer",
    items: [
      { id: "3a", productId: "prod-2", productName: "Conditioner 500ml", price: 3500, quantity: 2 },
      { id: "3b", productId: "prod-4", productName: "Hair Brush Pro", price: 1500, quantity: 1 },
    ],
    subtotal: 8500,
    tax: 637.5,
    total: 9137.5,
    status: "abandoned",
    createdAt: new Date("2025-01-16T09:00:00"),
    updatedAt: new Date("2025-01-16T09:15:00"),
    abandonedAt: new Date("2025-01-16T09:15:00"),
    recoveryEmailSent: false,
  },
];

const mockRecoveredCarts: Cart[] = [
  {
    id: "cart-4",
    customerId: "cust-3",
    customerName: "Fatima Bello",
    customerEmail: "fatima@example.com",
    items: [
      { id: "4a", productId: "prod-1", productName: "Premium Hair Shampoo", price: 4500, quantity: 1 },
    ],
    subtotal: 4500,
    tax: 337.5,
    total: 4837.5,
    status: "recovered",
    createdAt: new Date("2025-01-15T16:00:00"),
    updatedAt: new Date("2025-01-16T10:30:00"),
    abandonedAt: new Date("2025-01-15T16:30:00"),
    recoveryEmailSent: true,
  },
];

export default function CartPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("current");
  const [currentCart, setCurrentCart] = useState<CartItem[]>(initialCurrentCart);
  const [abandonedCarts, setAbandonedCarts] = useState<Cart[]>(mockAbandonedCarts);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  
  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    paymentMethod: "card",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateCartTotals = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.075; // 7.5% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCurrentCart(
      currentCart.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: string) => {
    setCurrentCart(currentCart.filter((item) => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from cart.",
    });
  };

  const clearCart = () => {
    setCurrentCart([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from cart.",
    });
  };

  const handleCheckout = () => {
    // In a real app, this would process the payment
    toast({
      title: "Order Placed! 🎉",
      description: "Your order has been placed successfully.",
    });
    setCurrentCart([]);
    setCheckoutDialogOpen(false);
    setCheckoutForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      deliveryAddress: "",
      paymentMethod: "card",
    });
  };

  const sendRecoveryEmail = (cart: Cart) => {
    setAbandonedCarts(
      abandonedCarts.map((c) =>
        c.id === cart.id ? { ...c, recoveryEmailSent: true } : c
      )
    );
    toast({
      title: "Recovery Email Sent",
      description: `Reminder sent to ${cart.customerEmail}`,
    });
  };

  const markAsRecovered = (cart: Cart) => {
    setAbandonedCarts(abandonedCarts.filter((c) => c.id !== cart.id));
    toast({
      title: "Cart Marked as Recovered",
      description: "The customer has completed their purchase.",
    });
  };

  const dismissCart = (cart: Cart) => {
    setAbandonedCarts(abandonedCarts.filter((c) => c.id !== cart.id));
    toast({
      title: "Cart Dismissed",
      description: "The abandoned cart has been removed from tracking.",
    });
  };

  const getTimeSinceAbandoned = (date?: Date) => {
    if (!date) return "Unknown";
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Less than 1 hour";
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const { subtotal, tax, total } = calculateCartTotals(currentCart);

  // Stats
  const stats = {
    abandoned: abandonedCarts.length,
    totalAbandonedValue: abandonedCarts.reduce((sum, cart) => sum + cart.total, 0),
    recovered: mockRecoveredCarts.length,
    recoveredValue: mockRecoveredCarts.reduce((sum, cart) => sum + cart.total, 0),
    recoveryRate: mockRecoveredCarts.length > 0
      ? ((mockRecoveredCarts.length / (abandonedCarts.length + mockRecoveredCarts.length)) * 100).toFixed(0)
      : 0,
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cart & Checkout</h1>
        <p className="text-muted-foreground">
          Manage shopping carts and recover abandoned orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Cart Items</CardDescription>
            <CardTitle className="text-2xl">{currentCart.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Value: {formatCurrency(total)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Abandoned Carts</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{stats.abandoned}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(stats.totalAbandonedValue)} at risk
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recovered Carts</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.recovered}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(stats.recoveredValue)} saved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recovery Rate</CardDescription>
            <CardTitle className="text-2xl">{stats.recoveryRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Of all abandoned carts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Current Cart
          </TabsTrigger>
          <TabsTrigger value="abandoned">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Abandoned ({stats.abandoned})
          </TabsTrigger>
          <TabsTrigger value="recovered">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Recovered
          </TabsTrigger>
        </TabsList>

        {/* Current Cart Tab */}
        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Shopping Cart</CardTitle>
                      <CardDescription>
                        {currentCart.length} item{currentCart.length !== 1 ? "s" : ""} in cart
                      </CardDescription>
                    </div>
                    {currentCart.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearCart}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {currentCart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                      <p className="text-sm text-muted-foreground">
                        Add items from your inventory to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentCart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productName}</h4>
                            {item.variant && (
                              <p className="text-sm text-muted-foreground">
                                {item.variant}
                              </p>
                            )}
                            <p className="font-medium text-primary">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (7.5%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={currentCart.length === 0}
                    onClick={() => setCheckoutDialogOpen(true)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Abandoned Carts Tab */}
        <TabsContent value="abandoned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abandoned Carts</CardTitle>
              <CardDescription>
                Carts that customers left without completing purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {abandonedCarts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">No abandoned carts!</p>
                  <p className="text-sm text-muted-foreground">
                    All customers completed their purchases
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Abandoned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {abandonedCarts.map((cart) => (
                      <TableRow key={cart.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cart.customerName}</p>
                            {cart.customerEmail && (
                              <p className="text-sm text-muted-foreground">
                                {cart.customerEmail}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{cart.items.length} items</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(cart.total)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {getTimeSinceAbandoned(cart.abandonedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {cart.recoveryEmailSent ? (
                            <Badge variant="outline" className="text-blue-600">
                              <Mail className="h-3 w-3 mr-1" />
                              Email Sent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCart(cart);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {cart.customerEmail && !cart.recoveryEmailSent && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendRecoveryEmail(cart)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send Email
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRecovered(cart)}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Recovered
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissCart(cart)}
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recovered Carts Tab */}
        <TabsContent value="recovered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recovered Carts</CardTitle>
              <CardDescription>
                Previously abandoned carts that were successfully converted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockRecoveredCarts.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recovered carts yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Recovery Method</TableHead>
                      <TableHead>Recovered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRecoveredCarts.map((cart) => (
                      <TableRow key={cart.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cart.customerName}</p>
                            {cart.customerEmail && (
                              <p className="text-sm text-muted-foreground">
                                {cart.customerEmail}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{cart.items.length} items</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(cart.total)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            <Mail className="h-3 w-3 mr-1" />
                            Email Recovery
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {cart.updatedAt.toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Abandoned Cart Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedCart && (
            <>
              <DialogHeader>
                <DialogTitle>Abandoned Cart Details</DialogTitle>
                <DialogDescription>
                  Cart abandoned {getTimeSinceAbandoned(selectedCart.abandonedAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-medium">Customer Information</h4>
                  <p className="text-sm">{selectedCart.customerName}</p>
                  {selectedCart.customerEmail && (
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedCart.customerEmail}
                    </p>
                  )}
                  {selectedCart.customerPhone && (
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedCart.customerPhone}
                    </p>
                  )}
                </div>

                {/* Cart Items */}
                <div className="space-y-2">
                  <h4 className="font-medium">Cart Items</h4>
                  {selectedCart.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>
                        {item.productName} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedCart.total)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                {selectedCart.customerEmail && !selectedCart.recoveryEmailSent && (
                  <Button onClick={() => {
                    sendRecoveryEmail(selectedCart);
                    setViewDialogOpen(false);
                  }}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Recovery Email
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your order - Total: {formatCurrency(total)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={checkoutForm.customerName}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={checkoutForm.customerPhone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })}
                  placeholder="+234 801 234 5678"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address</Label>
              <Input
                id="customerEmail"
                type="email"
                value={checkoutForm.customerEmail}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, customerEmail: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Input
                id="deliveryAddress"
                value={checkoutForm.deliveryAddress}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryAddress: e.target.value })}
                placeholder="123 Main Street, Lagos"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={checkoutForm.paymentMethod}
                onValueChange={(value) => setCheckoutForm({ ...checkoutForm, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Card Payment</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash on Delivery</SelectItem>
                  <SelectItem value="ussd">USSD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium mb-2">Order Summary</h4>
              {currentCart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.productName} x {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT (7.5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={!checkoutForm.customerName || !checkoutForm.customerPhone}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
