"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  Send,
  Eye,
  Download,
  MoreVertical,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Copy,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  createdAt: Date;
  dueDate: Date;
  paidAt?: Date;
  notes?: string;
}

// Mock data
const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    clientName: "Acme Corporation",
    clientEmail: "billing@acme.com",
    clientAddress: "123 Business St, Lagos",
    items: [
      { id: "1a", description: "Web Development", quantity: 1, rate: 150000, amount: 150000 },
      { id: "1b", description: "UI/UX Design", quantity: 1, rate: 75000, amount: 75000 },
    ],
    subtotal: 225000,
    tax: 16875,
    total: 241875,
    status: "paid",
    createdAt: new Date("2025-01-10"),
    dueDate: new Date("2025-01-24"),
    paidAt: new Date("2025-01-20"),
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    clientName: "TechStart Ltd",
    clientEmail: "finance@techstart.io",
    clientAddress: "45 Innovation Ave, Abuja",
    items: [
      { id: "2a", description: "Mobile App Development", quantity: 1, rate: 250000, amount: 250000 },
      { id: "2b", description: "Monthly Maintenance", quantity: 3, rate: 25000, amount: 75000 },
    ],
    subtotal: 325000,
    tax: 24375,
    total: 349375,
    status: "sent",
    createdAt: new Date("2025-01-15"),
    dueDate: new Date("2025-01-29"),
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    clientName: "Beauty Salon XYZ",
    clientEmail: "owner@beautysalon.ng",
    items: [
      { id: "3a", description: "POS System Setup", quantity: 1, rate: 50000, amount: 50000 },
      { id: "3b", description: "Staff Training", quantity: 2, rate: 15000, amount: 30000 },
    ],
    subtotal: 80000,
    tax: 6000,
    total: 86000,
    status: "overdue",
    createdAt: new Date("2025-01-01"),
    dueDate: new Date("2025-01-15"),
  },
  {
    id: "4",
    invoiceNumber: "INV-004",
    clientName: "FoodieHub Restaurant",
    clientEmail: "accounts@foodiehub.com",
    items: [
      { id: "4a", description: "Menu Photography", quantity: 1, rate: 45000, amount: 45000 },
    ],
    subtotal: 45000,
    tax: 3375,
    total: 48375,
    status: "draft",
    createdAt: new Date("2025-01-18"),
    dueDate: new Date("2025-02-01"),
    notes: "50% deposit received",
  },
];

export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // New invoice form state
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    items: [{ id: "new-1", description: "", quantity: 1, rate: 0, amount: 0 }] as InvoiceItem[],
    notes: "",
    taxRate: 7.5, // VAT
  });

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "cancelled":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "sent":
        return <Send className="h-4 w-4" />;
      case "overdue":
        return <XCircle className="h-4 w-4" />;
      case "draft":
        return <FileText className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const updateItemAmount = (index: number) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [
        ...newInvoice.items,
        { id: `new-${Date.now()}`, description: "", quantity: 1, rate: 0, amount: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (newInvoice.items.length > 1) {
      const updatedItems = newInvoice.items.filter((_, i) => i !== index);
      setNewInvoice({ ...newInvoice, items: updatedItems });
    }
  };

  const handleCreateInvoice = () => {
    const { subtotal, tax, total } = calculateTotals(newInvoice.items, newInvoice.taxRate);
    
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      clientName: newInvoice.clientName,
      clientEmail: newInvoice.clientEmail,
      clientAddress: newInvoice.clientAddress,
      items: newInvoice.items,
      subtotal,
      tax,
      total,
      status: "draft",
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      notes: newInvoice.notes,
    };

    setInvoices([invoice, ...invoices]);
    setCreateDialogOpen(false);
    setNewInvoice({
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      items: [{ id: "new-1", description: "", quantity: 1, rate: 0, amount: 0 }],
      notes: "",
      taxRate: 7.5,
    });

    toast({
      title: "Invoice Created",
      description: `Invoice ${invoice.invoiceNumber} has been created as a draft.`,
    });
  };

  const handleSendInvoice = (invoice: Invoice) => {
    setInvoices(invoices.map((inv) =>
      inv.id === invoice.id ? { ...inv, status: "sent" as const } : inv
    ));
    toast({
      title: "Invoice Sent",
      description: `Invoice ${invoice.invoiceNumber} has been sent to ${invoice.clientEmail}.`,
    });
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    setInvoices(invoices.map((inv) =>
      inv.id === invoice.id ? { ...inv, status: "paid" as const, paidAt: new Date() } : inv
    ));
    toast({
      title: "Invoice Marked as Paid",
      description: `Invoice ${invoice.invoiceNumber} has been marked as paid.`,
    });
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoices(invoices.filter((inv) => inv.id !== invoice.id));
    toast({
      title: "Invoice Deleted",
      description: `Invoice ${invoice.invoiceNumber} has been deleted.`,
    });
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const newInv: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      status: "draft",
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      paidAt: undefined,
    };
    setInvoices([newInv, ...invoices]);
    toast({
      title: "Invoice Duplicated",
      description: `Invoice duplicated as ${newInv.invoiceNumber}.`,
    });
  };

  // Stats
  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0),
    pending: invoices.filter((inv) => inv.status === "sent").reduce((sum, inv) => sum + inv.total, 0),
    overdue: invoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.total, 0),
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Create, send, and track invoices for your services
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new invoice for your client.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Client Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={newInvoice.clientName}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                    placeholder="Client or Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newInvoice.clientEmail}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientEmail: e.target.value })}
                    placeholder="billing@client.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Client Address</Label>
                <Input
                  id="clientAddress"
                  value={newInvoice.clientAddress}
                  onChange={(e) => setNewInvoice({ ...newInvoice, clientAddress: e.target.value })}
                  placeholder="123 Main St, City"
                />
              </div>

              {/* Invoice Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Invoice Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {newInvoice.items.map((item, index) => (
                    <div key={item.id} className="grid gap-2 p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        {newInvoice.items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Description (e.g., Web Development)"
                        value={item.description}
                        onChange={(e) => {
                          const items = [...newInvoice.items];
                          items[index].description = e.target.value;
                          setNewInvoice({ ...newInvoice, items });
                        }}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const items = [...newInvoice.items];
                              items[index].quantity = parseInt(e.target.value) || 1;
                              updateItemAmount(index);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rate (₦)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) => {
                              const items = [...newInvoice.items];
                              items[index].rate = parseFloat(e.target.value) || 0;
                              updateItemAmount(index);
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Amount</Label>
                          <Input
                            value={formatCurrency(item.amount)}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  {(() => {
                    const { subtotal, tax, total } = calculateTotals(newInvoice.items, newInvoice.taxRate);
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>VAT ({newInvoice.taxRate}%):</span>
                          <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  placeholder="Payment terms, bank details, etc."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoice}
                disabled={!newInvoice.clientName || !newInvoice.clientEmail || newInvoice.items.every(i => !i.description)}
              >
                Create Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invoiced</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(stats.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-2xl text-green-600">{formatCurrency(stats.paid)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{formatCurrency(stats.pending)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-2xl text-red-600">{formatCurrency(stats.overdue)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No invoices found. Create your first invoice to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.clientName}</div>
                        <div className="text-sm text-muted-foreground">{invoice.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(invoice.status)}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.dueDate.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedInvoice(invoice);
                            setViewDialogOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {invoice.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Client
                            </DropdownMenuItem>
                          )}
                          {(invoice.status === "sent" || invoice.status === "overdue") && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteInvoice(invoice)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </Badge>
                </div>
                <DialogDescription>
                  Created on {selectedInvoice.createdAt.toLocaleDateString("en-NG")}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Client Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Bill To:</h4>
                    <p className="font-medium">{selectedInvoice.clientName}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.clientEmail}</p>
                    {selectedInvoice.clientAddress && (
                      <p className="text-sm text-muted-foreground">{selectedInvoice.clientAddress}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {selectedInvoice.dueDate.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {selectedInvoice.paidAt && (
                      <>
                        <p className="text-sm text-muted-foreground mt-2">Paid On</p>
                        <p className="font-medium text-green-600">
                          {selectedInvoice.paidAt.toLocaleDateString("en-NG")}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VAT (7.5%):</span>
                      <span>{formatCurrency(selectedInvoice.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-1">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                {selectedInvoice.status === "draft" && (
                  <Button onClick={() => {
                    handleSendInvoice(selectedInvoice);
                    setViewDialogOpen(false);
                  }}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invoice
                  </Button>
                )}
                {(selectedInvoice.status === "sent" || selectedInvoice.status === "overdue") && (
                  <Button onClick={() => {
                    handleMarkAsPaid(selectedInvoice);
                    setViewDialogOpen(false);
                  }}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
