"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import { uploadAvatar, deleteAvatar } from "@/lib/supabase/services/storage";
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
  Loader2,
  Trash2,
  LogOut,
} from "lucide-react";

// Helper function to calculate time since a date
function getTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return "Today";
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(diffDays / 365)} years`;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, profile, updateProfile: updateAuthProfile, signOut } = useAuth();
  const { products, transactions } = useShop();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    id_number: "",
    date_of_birth: "",
    business_name: "",
    business_type: "Spaza Shop",
    business_address: "",
    business_city: "",
    business_province: "Gauteng",
    business_postal_code: "",
    business_phone: "",
    vat_number: "",
    receipt_header: "",
    receipt_footer: "Thank you for shopping with us!",
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: user?.email || profile.email || "",
        phone: profile.phone || "",
        id_number: profile.id_number || "",
        date_of_birth: profile.date_of_birth || "",
        business_name: profile.business_name || "",
        business_type: profile.business_type || "Spaza Shop",
        business_address: profile.business_address || "",
        business_city: profile.business_city || "",
        business_province: profile.business_province || "Gauteng",
        business_postal_code: profile.business_postal_code || "",
        business_phone: profile.business_phone || "",
        vat_number: profile.vat_number || "",
        receipt_header: profile.receipt_header || profile.business_name || "",
        receipt_footer: profile.receipt_footer || "Thank you for shopping with us!",
      });
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateAuthProfile(formData);
      setIsEditing(false);
      toast({
        title: "✅ Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "❌ Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "❌ Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { url, error } = await uploadAvatar(user.id, file);
      
      if (error) {
        throw error;
      }

      if (url) {
        // Update local profile state with new avatar URL
        await updateAuthProfile({ avatar_url: url });
        toast({
          title: "✅ Avatar Updated",
          description: "Your profile picture has been updated.",
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "❌ Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;
    
    setIsUploadingAvatar(true);
    try {
      const { error } = await deleteAvatar(user.id);
      
      if (error) {
        throw error;
      }

      await updateAuthProfile({ avatar_url: null });
      toast({
        title: "✅ Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast({
        title: "❌ Delete Failed",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "👋 Signed Out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = formData.first_name?.[0] || "";
    const last = formData.last_name?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  // Calculate stats from real data
  const stats = {
    totalSales: transactions.reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: transactions.length,
    totalProducts: products.length,
    memberSince: profile?.created_at 
      ? getTimeSince(new Date(profile.created_at))
      : "New member",
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />

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
          disabled={isSaving}
          className={isEditing ? "gap-2 bg-emerald-500 hover:bg-emerald-600" : "gap-2"}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
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
                <AvatarImage 
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'default'}`} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-2xl font-bold text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <button 
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  {profile?.avatar_url && (
                    <button 
                      onClick={handleDeleteAvatar}
                      disabled={isUploadingAvatar}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Name & Info */}
            <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h2 className="text-2xl font-bold">
                  {formData.first_name || formData.last_name 
                    ? `${formData.first_name} ${formData.last_name}`.trim()
                    : "Your Name"}
                </h2>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Star className="mr-1 h-3 w-3" />
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground">{formData.business_name || "Your Business"}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {formData.email || "email@example.com"}
                </span>
                {formData.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {formData.phone}
                  </span>
                )}
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
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => updateFormData("first_name", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => updateFormData("last_name", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  disabled={!isEditing}
                  placeholder="071 234 5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => updateFormData("date_of_birth", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => updateFormData("id_number", e.target.value)}
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
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => updateFormData("business_name", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type</Label>
                <select
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => updateFormData("business_type", e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-lg border bg-background p-2.5 disabled:opacity-50"
                >
                  <option value="Spaza Shop">Spaza Shop</option>
                  <option value="Tuck Shop">Tuck Shop</option>
                  <option value="General Dealer">General Dealer</option>
                  <option value="Street Vendor">Street Vendor</option>
                  <option value="Mobile Vendor">Mobile Vendor</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_phone">Business Phone</Label>
                <Input
                  id="business_phone"
                  value={formData.business_phone}
                  onChange={(e) => updateFormData("business_phone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_address">Street Address</Label>
              <Input
                id="business_address"
                value={formData.business_address}
                onChange={(e) => updateFormData("business_address", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="business_city">City</Label>
                <Input
                  id="business_city"
                  value={formData.business_city}
                  onChange={(e) => updateFormData("business_city", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_province">Province</Label>
                <select
                  id="business_province"
                  value={formData.business_province}
                  onChange={(e) => updateFormData("business_province", e.target.value)}
                  disabled={!isEditing}
                  className="w-full rounded-lg border bg-background p-2.5 disabled:opacity-50"
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
                <Label htmlFor="business_postal_code">Postal Code</Label>
                <Input
                  id="business_postal_code"
                  value={formData.business_postal_code}
                  onChange={(e) => updateFormData("business_postal_code", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_number">VAT Number (Optional)</Label>
              <Input
                id="vat_number"
                value={formData.vat_number}
                onChange={(e) => updateFormData("vat_number", e.target.value)}
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
                  <Label htmlFor="receipt_header">Receipt Header Text</Label>
                  <Input
                    id="receipt_header"
                    value={formData.receipt_header}
                    onChange={(e) => updateFormData("receipt_header", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Your business name or slogan"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will appear at the top of every receipt
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt_footer">Receipt Footer Message</Label>
                  <Textarea
                    id="receipt_footer"
                    value={formData.receipt_footer}
                    onChange={(e) => updateFormData("receipt_footer", e.target.value)}
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
                    <p className="text-lg font-bold">{formData.receipt_header || formData.business_name || "Your Business"}</p>
                    <p className="text-xs text-muted-foreground">{formData.business_address || "123 Main Street"}</p>
                    <p className="text-xs text-muted-foreground">{formData.business_city || "City"}, {formData.business_postal_code || "0000"}</p>
                    <p className="text-xs text-muted-foreground">Tel: {formData.business_phone || "000 000 0000"}</p>
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
                    {formData.receipt_footer || "Thank you for your purchase!"}
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
              <Button 
                variant="outline" 
                className="gap-2 text-red-600 hover:text-red-700"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
