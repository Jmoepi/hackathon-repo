"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Store,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Phone,
  Building2,
  MapPin,
  Receipt,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Business Info
  businessName: string;
  businessType: string;
  businessDescription: string;
  businessPhone: string;
  
  // Step 3: Business Address
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  
  // Step 4: Receipt Settings
  receiptHeader: string;
  receiptFooter: string;
  showAddress: boolean;
  showPhone: boolean;
  showVAT: boolean;
  vatNumber: string;
  
  // Agreement
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  idNumber: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
  
  businessName: "",
  businessType: "Spaza Shop",
  businessDescription: "",
  businessPhone: "",
  
  streetAddress: "",
  city: "",
  province: "Gauteng",
  postalCode: "",
  
  receiptHeader: "",
  receiptFooter: "Thank you for your business!",
  showAddress: true,
  showPhone: true,
  showVAT: false,
  vatNumber: "",
  
  agreeTerms: false,
  agreeMarketing: false,
};

const businessTypes = [
  "Spaza Shop",
  "Tuck Shop",
  "General Dealer",
  "Street Vendor",
  "Mobile Vendor",
  "Hair Salon",
  "Tavern/Shebeen",
  "Food Vendor",
  "Other",
];

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp, isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const progress = (step / 4) * 100;

  const validateStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          toast({ variant: "destructive", title: "Please fill in all required fields" });
          return false;
        }
        if (!formData.password || formData.password.length < 8) {
          toast({ variant: "destructive", title: "Password must be at least 8 characters" });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({ variant: "destructive", title: "Passwords do not match" });
          return false;
        }
        return true;
      case 2:
        if (!formData.businessName || !formData.businessType) {
          toast({ variant: "destructive", title: "Please fill in your business details" });
          return false;
        }
        return true;
      case 3:
        if (!formData.streetAddress || !formData.city || !formData.postalCode) {
          toast({ variant: "destructive", title: "Please fill in your business address" });
          return false;
        }
        return true;
      case 4:
        if (!formData.agreeTerms) {
          toast({ variant: "destructive", title: "Please accept the terms and conditions" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4) as Step);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsLoading(true);
    
    // Build full address
    const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.province} ${formData.postalCode}`;
    
    // Sign up with Supabase
    const { error, needsEmailConfirmation } = await signUp(formData.email, formData.password, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      business_name: formData.businessName,
      business_type: formData.businessType,
      business_address: fullAddress,
      vat_number: formData.showVAT ? formData.vatNumber : undefined,
      receipt_header: formData.receiptHeader || formData.businessName,
      receipt_footer: formData.receiptFooter,
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "Could not create your account. Please try again.",
      });
      setIsLoading(false);
      return;
    }
    
    // Save additional data to localStorage as backup (for onboarding completion)
    const userData = {
      ...formData,
      password: undefined,
      confirmPassword: undefined,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("tradahub-profile", JSON.stringify(userData));
    
    if (needsEmailConfirmation) {
      // Email confirmation required - redirect to OTP verification page
      toast({
        title: "📧 Verification Code Sent!",
        description: `Enter the 6-digit code sent to ${formData.email}`,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      setIsLoading(false);
      return;
    }
    
    // If no email confirmation needed (e.g., email auth disabled), go to dashboard
    toast({
      title: "🎉 Account Created!",
      description: "Welcome to TradaHub!",
    });
    
    router.push("/dashboard");
    setIsLoading(false);
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[128px]" />
        <div className="absolute -right-[10%] bottom-0 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[128px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <Store className="h-7 w-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-white">TradaHub</h1>
              <p className="text-xs text-slate-400">Your Business, Your Pocket</p>
            </div>
          </Link>
        </div>

        {/* Signup Card */}
        <Card className="border-0 bg-white/10 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-4 pb-4">
            <div>
              <CardTitle className="text-center text-2xl text-white">Create Your Account</CardTitle>
            <CardDescription className="text-center text-slate-300">
                Join thousands of smart entrepreneurs
            </CardDescription>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2 bg-slate-700" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Step {step} of 4</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between">
              {[
                { num: 1, icon: User, label: "Personal" },
                { num: 2, icon: Building2, label: "Business" },
                { num: 3, icon: MapPin, label: "Address" },
                { num: 4, icon: Receipt, label: "Receipt" },
              ].map(({ num, icon: Icon, label }) => (
                <div key={num} className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      step >= num
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-600 bg-slate-800 text-slate-400"
                    }`}
                  >
                    {step > num ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs ${step >= num ? "text-emerald-400" : "text-slate-500"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-200">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Thabo"
                      value={formData.firstName}
                      onChange={(e) => updateForm("firstName", e.target.value)}
                      className="h-12 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-200">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Mokoena"
                      value={formData.lastName}
                      onChange={(e) => updateForm("lastName", e.target.value)}
                      className="h-12 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="thabo@example.com"
                      value={formData.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className="h-12 border-slate-700 bg-slate-800/50 pl-11 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-200">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="071 234 5678"
                        value={formData.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        className="h-12 border-slate-700 bg-slate-800/50 pl-11 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-slate-200">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateForm("dateOfBirth", e.target.value)}
                      className="h-12 border-slate-700 bg-slate-800/50 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber" className="text-slate-200">SA ID Number (Optional)</Label>
                  <Input
                    id="idNumber"
                    placeholder="e.g., 9001015800088"
                    value={formData.idNumber}
                    onChange={(e) => updateForm("idNumber", e.target.value)}
                    className="h-12 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => updateForm("password", e.target.value)}
                        className="h-12 border-slate-700 bg-slate-800/50 pl-11 pr-11 text-white placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateForm("confirmPassword", e.target.value)}
                        className="h-12 border-slate-700 bg-slate-800/50 pl-11 pr-11 text-white placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-slate-200">Business Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="businessName"
                      placeholder="e.g., Thabo's Spaza Shop"
                      value={formData.businessName}
                      onChange={(e) => updateForm("businessName", e.target.value)}
                      className="h-12 border-slate-700 bg-slate-800/50 pl-11 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <p className="text-xs text-slate-400">This will appear on your receipts</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessType" className="text-slate-200">Business Type *</Label>
                    <select
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => updateForm("businessType", e.target.value)}
                      className="h-12 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-white"
                    >
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone" className="text-slate-200">Business Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="businessPhone"
                        type="tel"
                        placeholder="021 123 4567"
                        value={formData.businessPhone}
                        onChange={(e) => updateForm("businessPhone", e.target.value)}
                        className="h-12 border-slate-700 bg-slate-800/50 pl-11 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription" className="text-slate-200">Business Description (Optional)</Label>
                  <Textarea
                    id="businessDescription"
                    placeholder="Tell customers what you sell..."
                    value={formData.businessDescription}
                    onChange={(e) => updateForm("businessDescription", e.target.value)}
                    className="min-h-[100px] border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Store className="mt-0.5 h-5 w-5 text-emerald-400" />
                    <div>
                      <p className="font-medium text-emerald-300">Why business name matters</p>
                      <p className="text-sm text-emerald-200/70">
                        Your business name will be printed on all receipts and invoices, helping customers remember and recommend your shop.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Business Address */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streetAddress" className="text-slate-200">Street Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="streetAddress"
                      placeholder="123 Khayelitsha Drive"
                      value={formData.streetAddress}
                      onChange={(e) => updateForm("streetAddress", e.target.value)}
                      className="h-12 border-slate-700 bg-slate-800/50 pl-11 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-200">City / Township *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Khayelitsha"
                      value={formData.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                      className="h-12 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-slate-200">Province *</Label>
                    <select
                      id="province"
                      value={formData.province}
                      onChange={(e) => updateForm("province", e.target.value)}
                      className="h-12 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-white"
                    >
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-slate-200">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    placeholder="e.g., 7784"
                    value={formData.postalCode}
                    onChange={(e) => updateForm("postalCode", e.target.value)}
                    className="h-12 max-w-[200px] border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-blue-300">Location helps customers find you</p>
                      <p className="text-sm text-blue-200/70">
                        Your address will be printed on receipts so customers know where to find you again.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Receipt Settings */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptHeader" className="text-slate-200">Receipt Header</Label>
                  <Input
                    id="receiptHeader"
                    placeholder={formData.businessName || "Your Business Name"}
                    value={formData.receiptHeader}
                    onChange={(e) => updateForm("receiptHeader", e.target.value)}
                    className="h-12 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-400">Leave blank to use your business name</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptFooter" className="text-slate-200">Receipt Footer Message</Label>
                  <Textarea
                    id="receiptFooter"
                    placeholder="Thank you for your business!"
                    value={formData.receiptFooter}
                    onChange={(e) => updateForm("receiptFooter", e.target.value)}
                    className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                    rows={2}
                  />
                </div>

                <div className="space-y-3 rounded-lg border border-slate-700 p-4">
                  <p className="font-medium text-slate-200">Include on receipts:</p>
                  {[
                    { key: "showAddress", label: "Business Address" },
                    { key: "showPhone", label: "Phone Number" },
                    { key: "showVAT", label: "VAT Information" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={key}
                        checked={formData[key as keyof FormData] as boolean}
                        onChange={(e) => updateForm(key as keyof FormData, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <Label htmlFor={key} className="text-slate-300">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>

                {formData.showVAT && (
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber" className="text-slate-200">VAT Number</Label>
                    <Input
                      id="vatNumber"
                      placeholder="e.g., 4123456789"
                      value={formData.vatNumber}
                      onChange={(e) => updateForm("vatNumber", e.target.value)}
                      className="h-12 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                    />
                  </div>
                )}

                {/* Receipt Preview */}
                <div className="overflow-hidden rounded-xl border border-slate-700 bg-white p-4 shadow-inner">
                  <div className="mx-auto max-w-xs space-y-3 font-mono text-sm text-slate-900">
                    <div className="text-center">
                      <p className="text-lg font-bold">{formData.receiptHeader || formData.businessName || "Your Business"}</p>
                      {formData.showAddress && formData.streetAddress && (
                        <p className="text-xs text-slate-600">
                          {formData.streetAddress}, {formData.city}
                        </p>
                      )}
                      {formData.showPhone && formData.businessPhone && (
                        <p className="text-xs text-slate-600">Tel: {formData.businessPhone}</p>
                      )}
                      {formData.showVAT && formData.vatNumber && (
                        <p className="text-xs text-slate-600">VAT: {formData.vatNumber}</p>
                      )}
                    </div>
                    <div className="border-b border-dashed border-slate-300" />
                    <div className="text-center text-xs text-slate-500">
                      [Receipt items will appear here]
                    </div>
                    <div className="border-b border-dashed border-slate-300" />
                    <p className="text-center text-xs text-slate-600">
                      {formData.receiptFooter || "Thank you for your business!"}
                    </p>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={(e) => updateForm("agreeTerms", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <Label htmlFor="agreeTerms" className="text-sm text-slate-300">
                      I agree to the{" "}
                      <Link href="/terms" className="text-emerald-400 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-emerald-400 hover:underline">
                        Privacy Policy
                      </Link>{" "}
                      *
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onChange={(e) => updateForm("agreeMarketing", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <Label htmlFor="agreeMarketing" className="text-sm text-slate-300">
                      Send me tips and offers to grow my business (optional)
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-slate-700 pt-6">
            <div className="flex w-full gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-slate-600 bg-slate-800/50 text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  className={`flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 ${step === 1 ? "w-full" : ""}`}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              )}
            </div>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
