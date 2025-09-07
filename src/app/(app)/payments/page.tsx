"use client";

import { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { QrCode, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
const QrCodeDialog = dynamic(() => import('./components/qr-code-dialog'), { ssr: false });
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/data';

const paymentSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, { message: 'Select at least one product.' }),
});

// ✅ Exported Page Component
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

  // Sync form items field with selectedItems state
  useEffect(() => {
    setSelectedItems(form.watch('items'));
  }, [form.watch('items')]);

  const selectedProducts = selectedItems
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...product, quantity: item.quantity } : undefined;
    })
    .filter((p): p is Product & { quantity: number } => !!p);
  const total = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsQrOpen(true);
  }

  // If loading or context is missing, show skeletons
  if (loading || !transactions) {
    return (
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Generate Payment QR */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Generate Payment QR</CardTitle>
            <CardDescription>
              Select products from inventory to generate a QR code for payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="items"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Products & Quantity</FormLabel>
                      <div className="flex flex-col gap-2">
                        {products.map((product) => {
                          const item = field.value.find((i: any) => i.productId === product.id);
                          return (
                            <div key={product.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!item}
                                onChange={e => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, { productId: product.id, quantity: 1 }]);
                                  } else {
                                    field.onChange(field.value.filter((i: any) => i.productId !== product.id));
                                  }
                                }}
                              />
                              <span>{product.name} <span className="text-xs text-muted-foreground">(R{product.price.toFixed(2)})</span></span>
                              {!!item && (
                                <input
                                  type="number"
                                  min={1}
                                  max={product.stock}
                                  value={item.quantity}
                                  onChange={e => {
                                    const qty = Math.max(1, Math.min(product.stock, Number(e.target.value)));
                                    field.onChange(field.value.map((i: any) =>
                                      i.productId === product.id ? { ...i, quantity: qty } : i
                                    ));
                                  }}
                                  className="w-16 border rounded px-2 py-1"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="font-bold text-lg text-primary">Total: R{total.toFixed(2)}</div>
                <Button type="submit" className="w-full min-h-[44px] text-base" disabled={selectedProducts.length === 0}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A log of your most recent digital payments.</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="overflow-x-auto min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map((txn, idx) => (
                    <TableRow
                      key={txn.id}
                      className={idx === 0 ? "bg-green-100 dark:bg-green-900/40 animate-pulse" : ""}
                    >
                      <TableCell className="font-medium">R{txn.amount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(txn.date).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-right text-primary font-semibold">
                        {txn.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Dialog */}
      <QrCodeDialog
        isOpen={isQrOpen}
        onOpenChange={setIsQrOpen}
        products={selectedProducts}
        total={total}
      />
    </>
  );
}
