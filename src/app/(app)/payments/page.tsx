"use client";

import { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { QrCode, Clock, CheckCircle2, Minus, Plus, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
const QrCodeDialog = dynamic(() => import('./components/qr-code-dialog'), { ssr: false });
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/context/ShopContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const paymentSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, { message: 'Select at least one product.' }),
});

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const { products, transactions, sellProduct } = useShop() || {};
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      items: [],
    },
  });

  useEffect(() => {
    setSelectedItems(form.watch('items'));
  }, [form.watch('items')]);

  const selectedProducts = selectedItems
    .map(item => {
      const product = products?.find(p => p.id === item.productId);
      return product ? { ...product, quantity: item.quantity } : undefined;
    })
    .filter((p): p is Product & { quantity: number } => !!p);
  const total = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsQrOpen(true);
  }

  const toggleProduct = (productId: string) => {
    const currentItems = form.getValues('items');
    const exists = currentItems.find(i => i.productId === productId);
    if (exists) {
      form.setValue('items', currentItems.filter(i => i.productId !== productId));
    } else {
      form.setValue('items', [...currentItems, { productId, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const currentItems = form.getValues('items');
    const product = products?.find(p => p.id === productId);
    if (!product) return;
    
    form.setValue('items', currentItems.map(i => {
      if (i.productId === productId) {
        const newQty = Math.max(1, Math.min(product.stock, i.quantity + delta));
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  if (loading || !transactions || !products) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Create QR codes for quick customer payments</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Product Selection Grid */}
            <FormField
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => {
                      const item = field.value.find(i => i.productId === product.id);
                      const isSelected = !!item;
                      
                      return (
                        <Card 
                          key={product.id}
                          className={cn(
                            "border-2 cursor-pointer transition-all duration-300 overflow-hidden",
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                              : "border-transparent hover:border-primary/30 shadow-md hover:shadow-lg",
                            product.stock === 0 && "opacity-50 pointer-events-none"
                          )}
                          onClick={() => product.stock > 0 && toggleProduct(product.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                <div className={cn(
                                  "p-2 rounded-xl transition-colors",
                                  isSelected ? "bg-primary/10" : "bg-muted"
                                )}>
                                  <ShoppingBag className={cn(
                                    "h-5 w-5",
                                    isSelected ? "text-primary" : "text-muted-foreground"
                                  )} />
                                </div>
                                {isSelected && (
                                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</h3>
                                <p className="text-lg font-bold text-primary">R{product.price.toFixed(2)}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                            </div>

                            {isSelected && (
                              <div 
                                className="mt-3 flex items-center justify-center gap-2 bg-muted/50 rounded-lg p-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-md hover:bg-white"
                                  onClick={() => updateQuantity(product.id, -1)}
                                  disabled={item?.quantity === 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-bold">{item?.quantity}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-md hover:bg-white"
                                  onClick={() => updateQuantity(product.id, 1)}
                                  disabled={item?.quantity === product.stock}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkout Summary - Sticky on mobile */}
            <Card className={cn(
              "border-0 shadow-xl sticky bottom-20 md:bottom-0 z-10 overflow-hidden",
              selectedProducts.length > 0 
                ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                : "bg-card"
            )}>
              <CardContent className="p-4 md:p-6">
                {selectedProducts.length > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-white">
                      <p className="text-white/80 text-sm">{selectedProducts.length} item{selectedProducts.length > 1 ? 's' : ''} selected</p>
                      <p className="text-3xl font-bold">R{total.toFixed(2)}</p>
                    </div>
                    <Button 
                      type="submit" 
                      size="lg"
                      className="bg-white text-purple-600 hover:bg-white/90 shadow-lg w-full sm:w-auto h-14 text-lg font-semibold"
                    >
                      <QrCode className="mr-2 h-5 w-5" />
                      Generate QR Code
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                      <QrCode className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">Select products above to create a payment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </Form>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Recent Payments</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.slice(0, 5).map((txn, idx) => (
              <div
                key={txn.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-colors",
                  idx === 0 ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    txn.status === 'Completed' ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-amber-100"
                  )}>
                    <CheckCircle2 className={cn(
                      "h-5 w-5",
                      txn.status === 'Completed' ? "text-emerald-600" : "text-amber-600"
                    )} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">R{txn.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "font-medium border-0",
                    txn.status === 'Completed' 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" 
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {txn.status}
                </Badge>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QrCodeDialog
        isOpen={isQrOpen}
        onOpenChange={setIsQrOpen}
        products={selectedProducts}
        total={total}
      />
    </>
  );
}
