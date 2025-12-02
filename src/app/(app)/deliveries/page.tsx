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
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Plus,
  User,
  Phone,
  Search,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  Timer,
  MoreVertical,
  Navigation,
  XCircle,
  AlertCircle,
  UserCircle,
  DollarSign,
  Route,
  Filter,
} from "lucide-react";

// Types
interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: "available" | "busy" | "offline";
}

interface Delivery {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  driver?: Driver;
  status: "pending" | "assigned" | "picked-up" | "in-transit" | "delivered" | "failed";
  priority: "normal" | "urgent" | "express";
  notes?: string;
  fee: number;
  createdAt: Date;
  estimatedDelivery?: string;
}

// Mock drivers
const drivers: Driver[] = [
  { id: "1", name: "Themba M.", phone: "071 111 2222", vehicle: "Motorcycle", status: "available" },
  { id: "2", name: "Kagiso N.", phone: "082 333 4444", vehicle: "Car", status: "busy" },
  { id: "3", name: "Mpho S.", phone: "063 555 6666", vehicle: "Bicycle", status: "available" },
  { id: "4", name: "Siya K.", phone: "074 777 8888", vehicle: "Scooter", status: "offline" },
];

// Mock deliveries
const mockDeliveries: Delivery[] = [
  {
    id: "1",
    trackingNumber: "DEL001",
    customerName: "Lerato M.",
    customerPhone: "071 234 5678",
    pickupAddress: "123 Main Rd, Sandton",
    dropoffAddress: "456 Oak Ave, Randburg",
    status: "pending",
    priority: "normal",
    fee: 45,
    createdAt: new Date(Date.now() - 10 * 60000),
    estimatedDelivery: "30-45 min",
  },
  {
    id: "2",
    trackingNumber: "DEL002",
    customerName: "Bongani K.",
    customerPhone: "082 345 6789",
    pickupAddress: "Shop 5, Mall of Africa",
    dropoffAddress: "78 Pine St, Midrand",
    driver: drivers[1],
    status: "picked-up",
    priority: "urgent",
    fee: 65,
    createdAt: new Date(Date.now() - 25 * 60000),
    estimatedDelivery: "15-20 min",
  },
  {
    id: "3",
    trackingNumber: "DEL003",
    customerName: "Nomvula S.",
    customerPhone: "063 456 7890",
    pickupAddress: "22 Church St, CBD",
    dropoffAddress: "99 Long Ave, Rosebank",
    driver: drivers[0],
    status: "in-transit",
    priority: "express",
    fee: 85,
    createdAt: new Date(Date.now() - 35 * 60000),
    estimatedDelivery: "5-10 min",
  },
  {
    id: "4",
    trackingNumber: "DEL004",
    customerName: "Thabo D.",
    customerPhone: "074 567 8901",
    pickupAddress: "15 Gold St, Roodepoort",
    dropoffAddress: "33 Silver Rd, Florida",
    driver: drivers[2],
    status: "delivered",
    priority: "normal",
    fee: 40,
    createdAt: new Date(Date.now() - 90 * 60000),
  },
];

// Helper functions
const getStatusColor = (status: Delivery["status"]) => {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "assigned":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "picked-up":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "in-transit":
      return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
    case "delivered":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "failed":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "";
  }
};

const getStatusIcon = (status: Delivery["status"]) => {
  switch (status) {
    case "pending":
      return <Clock className="h-3.5 w-3.5" />;
    case "assigned":
      return <UserCircle className="h-3.5 w-3.5" />;
    case "picked-up":
      return <Package className="h-3.5 w-3.5" />;
    case "in-transit":
      return <Truck className="h-3.5 w-3.5" />;
    case "delivered":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "failed":
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const getPriorityColor = (priority: Delivery["priority"]) => {
  switch (priority) {
    case "urgent":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "express":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    default:
      return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  }
};

const getDriverStatusColor = (status: Driver["status"]) => {
  switch (status) {
    case "available":
      return "bg-emerald-500";
    case "busy":
      return "bg-amber-500";
    case "offline":
      return "bg-slate-400";
  }
};

const getTimeSince = (date: Date) => {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // New delivery form state
  const [newDelivery, setNewDelivery] = useState({
    customerName: "",
    customerPhone: "",
    pickupAddress: "",
    dropoffAddress: "",
    priority: "normal" as Delivery["priority"],
    notes: "",
    fee: 45,
  });

  // Stats
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d) => d.status === "pending").length,
    inProgress: deliveries.filter((d) => 
      ["assigned", "picked-up", "in-transit"].includes(d.status)
    ).length,
    delivered: deliveries.filter((d) => d.status === "delivered").length,
    earnings: deliveries
      .filter((d) => d.status === "delivered")
      .reduce((sum, d) => sum + d.fee, 0),
  };

  const availableDrivers = drivers.filter((d) => d.status === "available");

  const handleStatusChange = (deliveryId: string, newStatus: Delivery["status"]) => {
    setDeliveries(
      deliveries.map((d) => (d.id === deliveryId ? { ...d, status: newStatus } : d))
    );
  };

  const handleAssignDriver = (deliveryId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    setDeliveries(
      deliveries.map((d) =>
        d.id === deliveryId ? { ...d, driver, status: "assigned" } : d
      )
    );
  };

  const handleCreateDelivery = () => {
    if (!newDelivery.customerName || !newDelivery.pickupAddress || !newDelivery.dropoffAddress) {
      return;
    }

    const delivery: Delivery = {
      id: Date.now().toString(),
      trackingNumber: `DEL${String(deliveries.length + 1).padStart(3, "0")}`,
      customerName: newDelivery.customerName,
      customerPhone: newDelivery.customerPhone,
      pickupAddress: newDelivery.pickupAddress,
      dropoffAddress: newDelivery.dropoffAddress,
      status: "pending",
      priority: newDelivery.priority,
      notes: newDelivery.notes,
      fee: newDelivery.fee,
      createdAt: new Date(),
      estimatedDelivery: newDelivery.priority === "express" ? "15-20 min" : "30-45 min",
    };

    setDeliveries([delivery, ...deliveries]);
    setNewDelivery({
      customerName: "",
      customerPhone: "",
      pickupAddress: "",
      dropoffAddress: "",
      priority: "normal",
      notes: "",
      fee: 45,
    });
    setIsAddDialogOpen(false);
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.dropoffAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Deliveries
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage delivery jobs
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Delivery</DialogTitle>
              <DialogDescription>
                Add a new delivery job to the queue
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={newDelivery.customerName}
                  onChange={(e) =>
                    setNewDelivery({ ...newDelivery, customerName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  placeholder="e.g., 071 234 5678"
                  value={newDelivery.customerPhone}
                  onChange={(e) =>
                    setNewDelivery({ ...newDelivery, customerPhone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pickupAddress">Pickup Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
                  <Textarea
                    id="pickupAddress"
                    placeholder="Enter pickup location"
                    value={newDelivery.pickupAddress}
                    onChange={(e) =>
                      setNewDelivery({ ...newDelivery, pickupAddress: e.target.value })
                    }
                    className="pl-9 min-h-[60px]"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dropoffAddress">Dropoff Address</Label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                  <Textarea
                    id="dropoffAddress"
                    placeholder="Enter delivery destination"
                    value={newDelivery.dropoffAddress}
                    onChange={(e) =>
                      setNewDelivery({ ...newDelivery, dropoffAddress: e.target.value })
                    }
                    className="pl-9 min-h-[60px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newDelivery.priority}
                    onValueChange={(value) =>
                      setNewDelivery({
                        ...newDelivery,
                        priority: value as Delivery["priority"],
                        fee: value === "express" ? 85 : value === "urgent" ? 65 : 45,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (R45)</SelectItem>
                      <SelectItem value="urgent">Urgent (R65)</SelectItem>
                      <SelectItem value="express">Express (R85)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fee">Delivery Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
                    <Input
                      id="fee"
                      type="number"
                      value={newDelivery.fee}
                      onChange={(e) =>
                        setNewDelivery({ ...newDelivery, fee: Number(e.target.value) })
                      }
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any special instructions..."
                  value={newDelivery.notes}
                  onChange={(e) =>
                    setNewDelivery({ ...newDelivery, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDelivery}>Create Delivery</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
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
            <p className="text-xs text-muted-foreground">Awaiting driver</p>
          </CardContent>
        </Card>
        <Card className="border-cyan-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-cyan-600">
              In Progress
            </CardTitle>
            <Truck className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">
              Delivered
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats.earnings}</div>
            <p className="text-xs text-muted-foreground">From deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Deliveries List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Active Deliveries</CardTitle>
                <CardDescription>Track and manage delivery jobs</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[180px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="picked-up">Picked Up</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{delivery.trackingNumber}</span>
                        <Badge variant="outline" className={getStatusColor(delivery.status)}>
                          {getStatusIcon(delivery.status)}
                          <span className="ml-1 capitalize">{delivery.status.replace("-", " ")}</span>
                        </Badge>
                        {delivery.priority !== "normal" && (
                          <Badge variant="outline" className={getPriorityColor(delivery.priority)}>
                            {delivery.priority}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {delivery.customerName}
                        {delivery.customerPhone && (
                          <>
                            <Phone className="h-3.5 w-3.5 ml-2" />
                            {delivery.customerPhone}
                          </>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Cancel Delivery
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Route */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <div className="w-px h-8 bg-border" />
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-sm">{delivery.pickupAddress}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dropoff</p>
                        <p className="text-sm">{delivery.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        {getTimeSince(delivery.createdAt)}
                      </span>
                      {delivery.estimatedDelivery && (
                        <span className="flex items-center gap-1">
                          <Route className="h-3.5 w-3.5" />
                          ETA: {delivery.estimatedDelivery}
                        </span>
                      )}
                    </div>
                    <span className="font-bold">R{delivery.fee}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:w-[140px]">
                  {delivery.driver ? (
                    <div className="rounded-lg bg-muted/50 p-2 text-center">
                      <p className="text-xs text-muted-foreground">Driver</p>
                      <p className="font-medium text-sm">{delivery.driver.name}</p>
                      <p className="text-xs text-muted-foreground">{delivery.driver.vehicle}</p>
                    </div>
                  ) : (
                    <Select onValueChange={(value) => handleAssignDriver(delivery.id, value)}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Assign driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {delivery.status === "assigned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(delivery.id, "picked-up")}
                    >
                      Mark Picked Up
                    </Button>
                  )}
                  {delivery.status === "picked-up" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(delivery.id, "in-transit")}
                    >
                      Start Delivery
                    </Button>
                  )}
                  {delivery.status === "in-transit" && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleStatusChange(delivery.id, "delivered")}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredDeliveries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No deliveries found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drivers Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Drivers</CardTitle>
            <CardDescription>{availableDrivers.length} available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {driver.name.charAt(0)}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getDriverStatusColor(
                      driver.status
                    )}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{driver.name}</p>
                  <p className="text-xs text-muted-foreground">{driver.vehicle}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    driver.status === "available"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : driver.status === "busy"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-slate-500/10 text-slate-600"
                  }
                >
                  {driver.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
