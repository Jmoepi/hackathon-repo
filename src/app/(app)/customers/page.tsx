"use client";

import { useState } from 'react';
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
import { Send, UserPlus } from 'lucide-react';
import { initialCustomers, type Customer } from '@/lib/data';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AddCustomerDialog from './components/add-customer-dialog';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSendPromotion = () => {
    if (message.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Empty Message',
        description: 'Please write a promotional message before sending.',
      });
      return;
    }
    // Simulate sending SMS
    toast({
      title: 'Promotion Sent!',
      description: 'Your message has been sent to all customers.',
    });
    setMessage('');
  };

  const handleAddCustomer = (newCustomer: Omit<Customer, 'id' | 'joined'>) => {
    const customer: Customer = {
      ...newCustomer,
      id: `C-${Date.now()}`,
      joined: new Date().toISOString().split('T')[0],
    };
    setCustomers((current) => [customer, ...current]);
  };

  const handleRemoveCustomer = (id: string) => {
    setCustomers((current) => current.filter((c) => c.id !== id));
    toast({
      title: 'Customer Removed',
      description: 'The customer has been removed from your list.',
    });
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Customer List</CardTitle>
                <CardDescription>View and manage your regular customers.</CardDescription>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="text-right">{customer.joined}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveCustomer(customer.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Engagement</CardTitle>
              <CardDescription>Send promotional messages to all your customers.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                placeholder="e.g., Buy 2 loaves of bread, get 1 free!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
              <Button onClick={handleSendPromotion}>
                <Send className="mr-2 h-4 w-4" />
                Send Promotion
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <AddCustomerDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddCustomer={handleAddCustomer}
      />
    </>
  );
}
