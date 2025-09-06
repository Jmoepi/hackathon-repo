"use client";

import { useState } from 'react';
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
import { initialTransactions, type Transaction } from '@/lib/data';
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
import QrCodeDialog from './components/qr-code-dialog';

const paymentSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
});

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof paymentSchema>) {
    setQrAmount(values.amount);
    setIsQrOpen(true);
    // In a real app, we'd wait for a payment confirmation callback.
    // Here we'll simulate it after a delay.
    setTimeout(() => {
        const newTransaction: Transaction = {
            id: `txn-${Date.now()}`,
            amount: values.amount,
            date: new Date().toISOString(),
            customer: 'Unknown',
            status: 'Completed',
        };
        setTransactions(prev => [newTransaction, ...prev]);
        setIsQrOpen(false);
        toast({
            title: "Payment Received!",
            description: `Successfully received R${values.amount.toFixed(2)}.`,
            variant: "default",
            className: "bg-primary text-primary-foreground border-primary",
        });
        form.reset();
    }, 5000);
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Payment QR</CardTitle>
            <CardDescription>Enter an amount to generate a unique QR code for payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (R)</FormLabel>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="55.50"
                            className="pl-8"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A log of your most recent digital payments.</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="text-right text-primary font-semibold">{txn.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <QrCodeDialog
        isOpen={isQrOpen}
        onOpenChange={setIsQrOpen}
        amount={qrAmount}
      />
    </>
  );
}
