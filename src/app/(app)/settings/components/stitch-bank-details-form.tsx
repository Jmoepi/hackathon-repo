"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Banknote,
  Check,
  Loader2,
  BadgeCheck,
  Save,
  Info,
} from "lucide-react";

// Bank interface from Stitch
interface StitchBank {
  id: string;
  name: string;
  supportsVerification: boolean;
  supportsInstantPayout: boolean;
}

interface BankDetails {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  accountType: "current" | "savings";
  isSaved: boolean;
}

export function StitchBankDetailsForm() {
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [banks, setBanks] = useState<StitchBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState<string | null>(null);
  
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    accountType: "current",
    isSaved: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load banks from Stitch API
  useEffect(() => {
    async function loadBanks() {
      try {
        const response = await fetch("/api/merchant/stitch-bank?action=banks");
        const data = await response.json();
        
        if (data.success && data.banks && data.banks.length > 0) {
          // Sort banks alphabetically
          const sortedBanks = [...data.banks].sort((a: StitchBank, b: StitchBank) => 
            a.name.localeCompare(b.name)
          );
          setBanks(sortedBanks);
          setBanksError(null);
        } else {
          const errorMsg = data.error || "No banks returned";
          console.error("Banks API error:", errorMsg);
          setBanksError(errorMsg);
        }
      } catch (error) {
        console.error("Error loading banks:", error);
        const errorMsg = error instanceof Error ? error.message : "Network error";
        setBanksError(errorMsg);
      } finally {
        setBanksLoading(false);
      }
    }

    loadBanks();
  }, []);

  // Load existing bank details
  useEffect(() => {
    async function loadBankDetails() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/merchant/stitch-bank");
        const data = await response.json();

        if (data.bankDetails) {
          setBankDetails({
            bankCode: data.bankDetails.bank_code || "",
            bankName: data.bankDetails.bank_name || "",
            accountNumber: data.bankDetails.account_number || "",
            accountName: data.bankDetails.account_name || "",
            accountType: data.bankDetails.account_type || "current",
            isSaved: true,
          });
        }
      } catch (error) {
        console.error("Error loading bank details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Only load bank details after banks are loaded
    if (!banksLoading) {
      loadBankDetails();
    }
  }, [user, banksLoading]);

  // Save bank details
  const handleSaveBankDetails = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to save your bank details.",
        variant: "destructive",
      });
      return;
    }

    if (!bankDetails.bankCode || !bankDetails.accountNumber || !bankDetails.accountName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all bank details.",
        variant: "destructive",
      });
      return;
    }

    // Validate account number (should be digits only)
    if (!/^\d+$/.test(bankDetails.accountNumber)) {
      toast({
        title: "Invalid Account Number",
        description: "Account number should contain only digits.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/merchant/stitch-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankCode: bankDetails.bankCode,
          accountNumber: bankDetails.accountNumber,
          accountName: bankDetails.accountName,
          accountType: bankDetails.accountType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBankDetails(prev => ({
          ...prev,
          bankName: data.bankDetails.bank_name,
          isSaved: true,
        }));
        setHasChanges(false);
        
        // Refresh profile to update completion banner
        if (refreshProfile) {
          await refreshProfile();
        }
        
        toast({
          title: "✅ Bank Details Saved",
          description: "Your bank account has been saved for receiving payments.",
        });
      } else {
        throw new Error(data.error || "Failed to save bank details");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save bank details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBankChange = (bankCode: string) => {
    const bank = banks.find(b => b.id === bankCode);
    setBankDetails(prev => ({
      ...prev,
      bankCode,
      bankName: bank?.name || "",
    }));
    setHasChanges(true);
  };

  const handleAccountNumberChange = (accountNumber: string) => {
    // Only allow digits
    const cleaned = accountNumber.replace(/\D/g, '');
    setBankDetails(prev => ({
      ...prev,
      accountNumber: cleaned,
    }));
    setHasChanges(true);
  };

  const handleAccountNameChange = (accountName: string) => {
    setBankDetails(prev => ({
      ...prev,
      accountName,
    }));
    setHasChanges(true);
  };

  const handleAccountTypeChange = (accountType: "current" | "savings") => {
    setBankDetails(prev => ({
      ...prev,
      accountType,
    }));
    setHasChanges(true);
  };

  if (isLoading || banksLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading bank details...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle>Bank Account for Payouts</CardTitle>
            <CardDescription>
              Enter your bank details to receive payments from customers
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Badge */}
        {bankDetails.isSaved && !hasChanges && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <BadgeCheck className="h-5 w-5" />
            <span className="text-sm font-medium">
              Bank account saved and ready to receive payments
            </span>
          </div>
        )}

        {/* Bank Selection */}
        <div className="space-y-2">
          <Label htmlFor="bank">Select Your Bank</Label>
          <select
            id="bank"
            value={bankDetails.bankCode}
            onChange={(e) => handleBankChange(e.target.value)}
            className="w-full rounded-lg border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={banks.length === 0}
          >
            <option value="">{banks.length === 0 ? "Loading banks..." : "Select a bank..."}</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
          {banks.length === 0 && !banksLoading && banksError && (
            <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-950/30">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Could not load banks.</strong> {banksError}
              </p>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-amber-600"
                onClick={() => window.location.reload()}
              >
                Click to refresh
              </Button>
            </div>
          )}
        </div>

        {/* Account Type */}
        <div className="space-y-2">
          <Label>Account Type</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="accountType"
                value="current"
                checked={bankDetails.accountType === "current"}
                onChange={() => handleAccountTypeChange("current")}
                className="h-4 w-4 text-primary"
              />
              <span className="text-sm">Current / Cheque</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="accountType"
                value="savings"
                checked={bankDetails.accountType === "savings"}
                onChange={() => handleAccountTypeChange("savings")}
                className="h-4 w-4 text-primary"
              />
              <span className="text-sm">Savings</span>
            </label>
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            type="text"
            placeholder="Enter your account number"
            value={bankDetails.accountNumber}
            onChange={(e) => handleAccountNumberChange(e.target.value)}
            maxLength={20}
          />
          <p className="text-xs text-muted-foreground">
            Enter your bank account number (digits only)
          </p>
        </div>

        {/* Account Holder Name */}
        <div className="space-y-2">
          <Label htmlFor="accountName">Account Holder Name</Label>
          <Input
            id="accountName"
            type="text"
            placeholder="Name as it appears on your bank account"
            value={bankDetails.accountName}
            onChange={(e) => handleAccountNameChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Enter the exact name on your bank account
          </p>
        </div>

        {/* Summary */}
        {bankDetails.bankCode && bankDetails.accountNumber && bankDetails.accountName && (
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Bank Details Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Bank:</span>
              <span className="font-medium">{bankDetails.bankName}</span>
              <span className="text-muted-foreground">Account Type:</span>
              <span className="font-medium capitalize">{bankDetails.accountType}</span>
              <span className="text-muted-foreground">Account Number:</span>
              <span className="font-medium">
                ****{bankDetails.accountNumber.slice(-4)}
              </span>
              <span className="text-muted-foreground">Account Holder:</span>
              <span className="font-medium">{bankDetails.accountName}</span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSaveBankDetails}
          disabled={isSaving || !bankDetails.bankCode || !bankDetails.accountNumber || !bankDetails.accountName}
          className="w-full gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : bankDetails.isSaved && !hasChanges ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Bank Details
            </>
          )}
        </Button>

        {/* Info notice */}
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            <strong>🔒 Secure Payments:</strong> Your bank details are securely stored and used only for receiving payments. 
            Payouts are processed via Stitch Money, South Africa&apos;s trusted payment infrastructure.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
