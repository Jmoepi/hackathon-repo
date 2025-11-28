"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  Save,
  Shield,
  Star,
  TrendingUp,
  Package,
  Receipt,
  Clock,
} from "lucide-react";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  dateOfBirth: string;
  
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessCity: string;
  businessProvince: string;
  businessPostalCode: string;
  businessPhone: string;
  vatNumber: string;
  
  receiptHeader: string;
  receiptFooter: string;
  
  joinedDate: string;
  accountTier: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "Thabo",
    lastName: "Mokoena",
    email: "thabo@example.com",
    phone: "071 234 5678",
    idNumber: "******* *** *",
    dateOfBirth: "1990-05-15",
    
    businessName: "Thabo's Spaza Shop",
    businessType: "Spaza Shop",
    businessAddress: "123 Khayelitsha Drive",
    businessCity: "Cape Town",
    businessProvince: "Western Cape",
    businessPostalCode: "7784",
    businessPhone: "021 123 4567",
    vatNumber: "",
    
    receiptHeader: "Thabo's Spaza Shop",
    receiptFooter: "Thank you for shopping with us!",
    
    joinedDate: "2024-01-15",
    accountTier: "Pro",
  });

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem("tradahub-profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem("tradahub-profile", JSON.stringify(profile));
    setIsEditing(false);
    toast({
      title: "✅ Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const updateProfile = (key: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  // Stats (mock data)
  const stats = {
    totalSales: 15420,
    totalTransactions: 342,
    totalProducts: 48,
    memberSince: "11 months",
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal and business information
            </p>
          </div>
        </div>
        <Button
          onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          className={isEditing ? "gap-2 bg-emerald-500 hover:bg-emerald-600" : "gap-2"}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardContent className="relative pb-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            {/* Avatar */}
            <div className="relative -mt-16 sm:-mt-12">
              <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=trader" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Name & Info */}
            <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h2 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Star className="mr-1 h-3 w-3" />
                  {profile.accountTier}
                </Badge>
              </div>
              <p className="text-muted-foreground">{profile.businessName}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 flex gap-6 sm:mt-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">R{stats.totalSales.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Sales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">Revenue</span>
            </div>
            <p className="mt-1 text-xl font-bold">R{stats.totalSales.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">Sales</span>
            </div>
            <p className="mt-1 text-xl font-bold">{stats.totalTransactions}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-muted-foreground">Products</span>
            </div>
            <p className="mt-1 text-xl font-bold">{stats.totalProducts}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">Member</span>
            </div>
            <p className="mt-1 text-xl font-bold">{stats.memberSince}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => updateProfile("firstName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => updateProfile("lastName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => updateProfile("dateOfBirth", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={profile.idNumber}
                onChange={(e) => updateProfile("idNumber", e.target.value)}
                disabled={!isEditing}
                placeholder="South African ID Number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your shop details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={profile.businessName}
                onChange={(e) => updateProfile("businessName", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <select
                  id="businessType"
                  value={profile.businessType}
                  onChange={(e) => updateProfile("businessType", e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-lg border bg-background p-2.5"
                >
                  <option value="Spaza Shop">Spaza Shop</option>
                  <option value="Tuck Shop">Tuck Shop</option>
                  <option value="General Dealer">General Dealer</option>
                  <option value="Street Vendor">Street Vendor</option>
                  <option value="Mobile Vendor">Mobile Vendor</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  value={profile.businessPhone}
                  onChange={(e) => updateProfile("businessPhone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Street Address</Label>
              <Input
                id="businessAddress"
                value={profile.businessAddress}
                onChange={(e) => updateProfile("businessAddress", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="businessCity">City</Label>
                <Input
                  id="businessCity"
                  value={profile.businessCity}
                  onChange={(e) => updateProfile("businessCity", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessProvince">Province</Label>
                <select
                  id="businessProvince"
                  value={profile.businessProvince}
                  onChange={(e) => updateProfile("businessProvince", e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-lg border bg-background p-2.5"
                >
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="Western Cape">Western Cape</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessPostalCode">Postal Code</Label>
                <Input
                  id="businessPostalCode"
                  value={profile.businessPostalCode}
                  onChange={(e) => updateProfile("businessPostalCode", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
              <Input
                id="vatNumber"
                value={profile.vatNumber}
                onChange={(e) => updateProfile("vatNumber", e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., 4123456789"
              />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Customization */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Receipt Customization</CardTitle>
                <CardDescription>Customize what appears on your receipts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptHeader">Receipt Header Text</Label>
                  <Input
                    id="receiptHeader"
                    value={profile.receiptHeader}
                    onChange={(e) => updateProfile("receiptHeader", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your business name or slogan"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will appear at the top of every receipt
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                  <Textarea
                    id="receiptFooter"
                    value={profile.receiptFooter}
                    onChange={(e) => updateProfile("receiptFooter", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Thank you message..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will appear at the bottom of every receipt
                  </p>
                </div>
              </div>
              
              {/* Receipt Preview */}
              <div className="rounded-xl border bg-white p-6 shadow-inner dark:bg-slate-950">
                <div className="mx-auto max-w-xs space-y-4 font-mono text-sm">
                  <div className="text-center">
                    <p className="text-lg font-bold">{profile.receiptHeader || profile.businessName}</p>
                    <p className="text-xs text-muted-foreground">{profile.businessAddress}</p>
                    <p className="text-xs text-muted-foreground">{profile.businessCity}, {profile.businessPostalCode}</p>
                    <p className="text-xs text-muted-foreground">Tel: {profile.businessPhone}</p>
                  </div>
                  <Separator className="border-dashed" />
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Bread White 700g</span>
                      <span>R18.99</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Milk 1L Full Cream</span>
                      <span>R21.50</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Eggs (6 pack)</span>
                      <span>R32.99</span>
                    </div>
                  </div>
                  <Separator className="border-dashed" />
                  <div className="flex justify-between font-bold">
                    <span>TOTAL</span>
                    <span>R73.48</span>
                  </div>
                  <Separator className="border-dashed" />
                  <p className="text-center text-xs text-muted-foreground">
                    {profile.receiptFooter || "Thank you for your purchase!"}
                  </p>
                  <p className="text-center text-[10px] text-muted-foreground">
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/20 to-gray-500/20">
                <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Verify Email
              </Button>
              <Button variant="outline" className="gap-2">
                <Phone className="h-4 w-4" />
                Verify Phone
              </Button>
              <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
