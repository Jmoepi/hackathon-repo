"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Send, UserPlus, Users, Phone, Calendar, MessageSquare, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useShop, type Customer } from '@/context/ShopContext';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AddCustomerDialog from './components/add-customer-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CustomersPage() {
  const { customers, addCustomer, deleteCustomer, isLoading } = useShop();
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendPromotion = async () => {
    if (message.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Empty Message',
        description: 'Please write a promotional message before sending.',
      });
      return;
    }
    
    setIsSending(true);
    // Simulate sending SMS
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: '🎉 Promotion Sent!',
      description: `Your message has been sent to ${customers.length} customers.`,
      className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    });
    setMessage('');
    setIsSending(false);
  };

  const handleAddCustomer = async (newCustomer: Omit<Customer, 'id' | 'joined'>) => {
    const customer = await addCustomer(newCustomer);
    if (customer) {
      toast({
        title: 'Customer Added',
        description: `${newCustomer.name} has been added to your list.`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add customer. Please try again.',
      });
    }
  };

  const handleRemoveCustomer = async (id: string) => {
    const customer = customers.find(c => c.id === id);
    const success = await deleteCustomer(id);
    if (success) {
      toast({
        title: 'Customer Removed',
        description: `${customer?.name} has been removed from your list.`,
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-emerald-500 to-teal-500',
      'from-blue-500 to-indigo-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-amber-500',
      'from-cyan-500 to-blue-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">Customers</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your customer relationships</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/10 to-amber-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                <p className="text-xs text-muted-foreground">Total Customers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">SMS</p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Send Promotion Card - Mobile first */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Send Promotion</CardTitle>
                <CardDescription>Reach all {customers.length} customers via SMS</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Textarea
              placeholder="e.g., 🎉 Special offer! Buy 2 loaves of bread, get 1 FREE! Today only at your favorite shop!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none bg-muted/50 border-0 focus:bg-background text-base"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {message.length}/160 characters
              </p>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-0">
                {customers.length} recipients
              </Badge>
            </div>
            <Button 
              onClick={handleSendPromotion} 
              disabled={isSending || message.trim() === ''}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg text-base"
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to All Customers
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Customer List - Card based for mobile */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Customer List</h2>
            <Badge variant="secondary" className="bg-muted">{customers.length} total</Badge>
          </div>
          
          {customers.length > 0 ? (
            <div className="grid gap-3">
              {customers.map((customer, index) => (
                <Card 
                  key={customer.id} 
                  className={cn(
                    "border-0 shadow-md hover:shadow-lg transition-all duration-300",
                    index === 0 && "ring-2 ring-emerald-500/20"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarFallback className={cn(
                          "bg-gradient-to-br text-white font-semibold",
                          getAvatarColor(customer.name)
                        )}>
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                          {index === 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] shrink-0">New</Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {customer.joined}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0"
                        onClick={() => handleRemoveCustomer(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No customers yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                  Add your first customer to start building relationships
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)} 
                  className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </CardContent>
            </Card>
          )}
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
