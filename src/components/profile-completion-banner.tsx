"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { X, User, AlertCircle, ChevronRight, Wallet } from "lucide-react";

interface CompletionField {
  key: string;
  label: string;
  required: boolean;
  category: "profile" | "settings";
  link: string;
}

const COMPLETION_FIELDS: CompletionField[] = [
  // Profile fields
  { key: "first_name", label: "First Name", required: true, category: "profile", link: "/profile" },
  { key: "last_name", label: "Last Name", required: true, category: "profile", link: "/profile" },
  { key: "phone", label: "Phone Number", required: true, category: "profile", link: "/profile" },
  { key: "business_name", label: "Business Name", required: true, category: "profile", link: "/profile" },
  { key: "business_type", label: "Business Type", required: false, category: "profile", link: "/profile" },
  { key: "business_address", label: "Business Address", required: false, category: "profile", link: "/profile" },
  { key: "business_city", label: "City", required: false, category: "profile", link: "/profile" },
  { key: "business_province", label: "Province", required: false, category: "profile", link: "/profile" },
  // Settings fields (Bank Details for receiving payments via Stitch)
  { key: "bank_code", label: "Bank Account", required: true, category: "settings", link: "/settings" },
  { key: "account_number", label: "Account Number", required: true, category: "settings", link: "/settings" },
];

export function ProfileCompletionBanner() {
  const { profile, isLoading } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [registrationData, setRegistrationData] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check if banner was previously dismissed this session
    const dismissed = sessionStorage.getItem("profile-banner-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
    
    // Load registration data from localStorage as fallback
    try {
      const savedProfile = localStorage.getItem("tradahub-profile");
      if (savedProfile) {
        setRegistrationData(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.warn("Could not parse registration data:", e);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("profile-banner-dismissed", "true");
  };

  // Map registration keys to profile keys
  const regKeyMap: Record<string, string> = {
    first_name: "firstName",
    last_name: "lastName",
    phone: "phone",
    business_name: "businessName",
    business_type: "businessType",
    business_address: "streetAddress",
    business_city: "city",
    business_province: "province",
  };

  // Get value with fallback to registration data
  const getFieldValue = (key: string): string => {
    // First check profile from Supabase
    if (profile && profile[key as keyof typeof profile]) {
      return String(profile[key as keyof typeof profile]);
    }
    // Then check registration data from localStorage
    const regKey = regKeyMap[key];
    if (registrationData && regKey && registrationData[regKey]) {
      return String(registrationData[regKey]);
    }
    return "";
  };

  // Calculate overall completion (profile + settings)
  const calculateCompletion = () => {
    if (!profile && !registrationData) {
      return { percentage: 0, missingFields: COMPLETION_FIELDS, profileComplete: false, settingsComplete: false };
    }

    const filledFields = COMPLETION_FIELDS.filter((field) => {
      const value = getFieldValue(field.key);
      return value && value.trim() !== "";
    });

    const missingFields = COMPLETION_FIELDS.filter((field) => {
      const value = getFieldValue(field.key);
      return !value || value.trim() === "";
    });

    // Check profile completion
    const profileFields = COMPLETION_FIELDS.filter(f => f.category === "profile");
    const filledProfileFields = profileFields.filter((field) => {
      const value = getFieldValue(field.key);
      return value && value.trim() !== "";
    });
    const profileComplete = filledProfileFields.length === profileFields.length;

    // Check settings completion (bank details - only from profile, not localStorage)
    const settingsFields = COMPLETION_FIELDS.filter(f => f.category === "settings");
    const filledSettingsFields = settingsFields.filter((field) => {
      const value = profile?.[field.key as keyof typeof profile];
      return value && String(value).trim() !== "";
    });
    const settingsComplete = filledSettingsFields.length === settingsFields.length;

    const percentage = Math.round((filledFields.length / COMPLETION_FIELDS.length) * 100);
    return { percentage, missingFields, profileComplete, settingsComplete };
  };

  const { percentage, missingFields, profileComplete, settingsComplete } = calculateCompletion();

  // Don't show banner if:
  // - Not mounted yet
  // - Still loading
  // - Profile is complete (100%)
  // - User dismissed the banner
  // - No profile exists yet (will be handled by onboarding)
  if (!mounted || isLoading || percentage === 100 || isDismissed || !profile) {
    return null;
  }

  // Get the required missing fields by category
  const requiredMissing = missingFields.filter((f) => f.required);
  const missingProfileFields = missingFields.filter((f) => f.category === "profile");
  const missingSettingsFields = missingFields.filter((f) => f.category === "settings");

  // Determine primary CTA based on what's missing
  const primaryLink = !profileComplete ? "/profile" : "/settings";
  const primaryLabel = !profileComplete ? "Complete Profile" : "Set Up Payments";
  const PrimaryIcon = !profileComplete ? User : Wallet;

  // Build the message based on what's missing
  const getMessage = () => {
    if (!profileComplete && !settingsComplete) {
      return (
        <>
          Complete your <span className="font-medium">profile</span> and{" "}
          <span className="font-medium">payment setup</span> to start receiving payments.
        </>
      );
    } else if (!profileComplete) {
      const profileMissing = missingProfileFields.filter(f => f.required);
      return (
        <>
          Add your{" "}
          <span className="font-medium">
            {profileMissing.slice(0, 2).map((f) => f.label).join(" and ")}
          </span>
          {profileMissing.length > 2 && ` and ${profileMissing.length - 2} more`} to help
          customers find you.
        </>
      );
    } else if (!settingsComplete) {
      return (
        <>
          Set up your <span className="font-medium">bank account</span> in Settings to receive
          payments from customers.
        </>
      );
    }
    return <>Add more details to build trust with customers.</>;
  };

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/50 dark:from-amber-950/30 dark:to-orange-950/30">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              {!profileComplete ? "Complete Your Profile" : "Set Up Payments"}
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {getMessage()}
            </p>

            {/* Progress bar with categories */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {percentage}%
                </span>
              </div>
              {/* Status indicators */}
              <div className="flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1 ${profileComplete ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  <User className="h-3 w-3" />
                  Profile {profileComplete ? "✓" : ""}
                </span>
                <span className={`flex items-center gap-1 ${settingsComplete ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  <Wallet className="h-3 w-3" />
                  Payments {settingsComplete ? "✓" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Link href={primaryLink}>
          <Button
            size="sm"
            className="gap-1 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            <PrimaryIcon className="h-4 w-4" />
            {primaryLabel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
