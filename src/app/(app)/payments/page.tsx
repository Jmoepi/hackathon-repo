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

const paymentSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
});

// ✅ Exported Page Component
export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const { transactions, sellProduct } = useShop() || {};
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState('prod-001');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    setQrAmount(values.amount);
    setIsQrOpen(true);
    setTimeout(() => {
      sellProduct(selectedProductId, values.amount);
      setIsQrOpen(false);
      toast({
        title: "Payment Received!",
        description: `Successfully received R${values.amount.toFixed(2)} for White Bread.`,
        variant: "default",
        className: "bg-primary text-primary-foreground border-primary",
      });
      form.reset();
    }, 5000);
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
              Enter an amount to generate a unique QR code for payment.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 text-muted-foreground font-bold">R</span>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="15.50"
                            className="pl-8"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full min-h-[44px] text-base">
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
                  {transactions.slice(0, 5).map((txn) => (
                    <TableRow key={txn.id}>
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
        amount={qrAmount}
      />
    </>
  );
}
