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
  Calendar,
  Clock,
  Plus,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Scissors,
  Sparkles,
} from "lucide-react";

// Types
interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  category: string;
}

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  service: Service;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  notes?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  booking?: Booking;
}

// Mock data
const services: Service[] = [
  { id: "1", name: "Haircut - Men", duration: 30, price: 80, category: "Hair" },
  { id: "2", name: "Haircut - Women", duration: 45, price: 150, category: "Hair" },
  { id: "3", name: "Hair Braiding", duration: 180, price: 350, category: "Hair" },
  { id: "4", name: "Gel Manicure", duration: 45, price: 200, category: "Nails" },
  { id: "5", name: "Pedicure", duration: 60, price: 250, category: "Nails" },
  { id: "6", name: "Full Set Acrylics", duration: 90, price: 400, category: "Nails" },
  { id: "7", name: "Facial Treatment", duration: 60, price: 300, category: "Skincare" },
  { id: "8", name: "Makeup - Full Glam", duration: 90, price: 500, category: "Makeup" },
];

const mockBookings: Booking[] = [
  {
    id: "1",
    customerName: "Thandi Mokoena",
    customerPhone: "071 234 5678",
    service: services[3],
    date: "2025-12-01",
    time: "09:00",
    status: "confirmed",
  },
  {
    id: "2",
    customerName: "Lindiwe Dlamini",
    customerPhone: "082 345 6789",
    service: services[2],
    date: "2025-12-01",
    time: "10:00",
    status: "confirmed",
  },
  {
    id: "3",
    customerName: "Nomsa Khumalo",
    customerPhone: "063 456 7890",
    service: services[6],
    date: "2025-12-01",
    time: "14:00",
    status: "pending",
  },
  {
    id: "4",
    customerName: "Zanele Nkosi",
    customerPhone: "074 567 8901",
    service: services[7],
    date: "2025-12-02",
    time: "11:00",
    status: "confirmed",
  },
];

// Helper functions
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const getDayName = (date: Date): string => {
  return date.toLocaleDateString("en-ZA", { weekday: "long" });
};

const generateTimeSlots = (date: string, bookings: Booking[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayBookings = bookings.filter((b) => b.date === date);

  for (let hour = 8; hour <= 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      const booking = dayBookings.find((b) => b.time === time);
      slots.push({
        time,
        available: !booking,
        booking,
      });
    }
  }
  return slots;
};

const getStatusColor = (status: Booking["status"]) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const getStatusIcon = (status: Booking["status"]) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "pending":
      return <AlertCircle className="h-3.5 w-3.5" />;
    case "completed":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "cancelled":
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

export default function BookingsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // New booking form state
  const [newBooking, setNewBooking] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    date: formatDate(new Date()),
    time: "",
    notes: "",
  });

  // Get week dates
  const getWeekDates = (centerDate: Date): Date[] => {
    const dates: Date[] = [];
    const startOfWeek = new Date(centerDate);
    startOfWeek.setDate(centerDate.getDate() - centerDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedDate);
  const timeSlots = generateTimeSlots(formatDate(selectedDate), bookings);
  
  const todayBookings = bookings.filter(
    (b) => b.date === formatDate(selectedDate)
  );

  const upcomingBookings = bookings
    .filter((b) => b.date >= formatDate(new Date()) && b.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  // Stats
  const todayStats = {
    total: todayBookings.length,
    confirmed: todayBookings.filter((b) => b.status === "confirmed").length,
    pending: todayBookings.filter((b) => b.status === "pending").length,
    revenue: todayBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.service.price, 0),
  };

  const handleAddBooking = () => {
    if (!newBooking.customerName || !newBooking.serviceId || !newBooking.time) {
      return;
    }

    const service = services.find((s) => s.id === newBooking.serviceId);
    if (!service) return;

    const booking: Booking = {
      id: Date.now().toString(),
      customerName: newBooking.customerName,
      customerPhone: newBooking.customerPhone,
      service,
      date: newBooking.date,
      time: newBooking.time,
      status: "pending",
      notes: newBooking.notes,
    };

    setBookings([...bookings, booking]);
    setNewBooking({
      customerName: "",
      customerPhone: "",
      serviceId: "",
      date: formatDate(new Date()),
      time: "",
      notes: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot.time);
      setNewBooking({
        ...newBooking,
        date: formatDate(selectedDate),
        time: slot.time,
      });
      setIsAddDialogOpen(true);
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking["status"]) => {
    setBookings(
      bookings.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(newDate);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage appointments and schedule services
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for a customer
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={newBooking.customerName}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, customerName: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customerPhone"
                    placeholder="e.g., 071 234 5678"
                    value={newBooking.customerPhone}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, customerPhone: e.target.value })
                    }
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service">Service</Label>
                <Select
                  value={newBooking.serviceId}
                  onValueChange={(value) =>
                    setNewBooking({ ...newBooking, serviceId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center justify-between gap-4">
                          <span>{service.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {service.duration}min · R{service.price}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newBooking.date}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Select
                    value={newBooking.time}
                    onValueChange={(value) =>
                      setNewBooking({ ...newBooking, time: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeSlots(newBooking.date, bookings)
                        .filter((slot) => slot.available)
                        .map((slot) => (
                          <SelectItem key={slot.time} value={slot.time}>
                            {slot.time}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any special requests..."
                  value={newBooking.notes}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBooking}>Create Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.confirmed} confirmed, {todayStats.pending} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expected Revenue
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{todayStats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From today&apos;s appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Available
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeSlots.find((s) => s.available)?.time || "Fully booked"}
            </div>
            <p className="text-xs text-muted-foreground">
              {getDayName(selectedDate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Services Offered
            </CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">Across 4 categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Clock className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          {/* Week Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWeek("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold">
                  {weekDates[0].toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
                </h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateWeek("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const isSelected = formatDate(date) === formatDate(selectedDate);
                  const isToday = formatDate(date) === formatDate(new Date());
                  const dayBookings = bookings.filter(
                    (b) => b.date === formatDate(date)
                  ).length;

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="text-xs font-medium">
                        {date.toLocaleDateString("en-ZA", { weekday: "short" })}
                      </span>
                      <span className="text-lg font-bold">{date.getDate()}</span>
                      {dayBookings > 0 && (
                        <span className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {dayBookings} apt
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Time Slots Grid */}
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {formatDisplayDate(selectedDate)} - Time Slots
                </CardTitle>
                <CardDescription>
                  Click on an available slot to create a booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!slot.available}
                      className={`flex flex-col items-center justify-center rounded-lg border p-3 text-sm transition-colors ${
                        slot.available
                          ? "border-dashed border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                          : "border-solid bg-muted/50 cursor-default"
                      }`}
                    >
                      <span className={`font-medium ${slot.available ? "text-emerald-600" : ""}`}>
                        {slot.time}
                      </span>
                      {slot.booking && (
                        <span className="mt-1 text-xs text-muted-foreground truncate max-w-full">
                          {slot.booking.customerName.split(" ")[0]}
                        </span>
                      )}
                      {slot.available && (
                        <span className="mt-1 text-xs text-emerald-600">Available</span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today&apos;s Appointments</CardTitle>
                <CardDescription>{todayBookings.length} scheduled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No appointments for this day
                  </p>
                ) : (
                  todayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {booking.customerName}
                          </span>
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.time} · {booking.service.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.service.duration}min · R{booking.service.price}
                        </p>
                      </div>
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleStatusChange(booking.id, value as Booking["status"])
                        }
                      >
                        <SelectTrigger className="w-[110px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>View and manage all appointments</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings
                  .filter(
                    (b) =>
                      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      b.service.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{booking.customerName}</span>
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.service.name} · {booking.service.duration}min
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(booking.date).toLocaleDateString("en-ZA", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {booking.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {booking.customerPhone}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">R{booking.service.price}</div>
                        <Select
                          value={booking.status}
                          onValueChange={(value) =>
                            handleStatusChange(booking.id, value as Booking["status"])
                          }
                        >
                          <SelectTrigger className="w-[110px] h-8 text-xs mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
