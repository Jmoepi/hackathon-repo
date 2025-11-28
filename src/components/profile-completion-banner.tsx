"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { X, User, AlertCircle, ChevronRight } from "lucide-react";

interface ProfileField {
  key: string;
  label: string;
  required: boolean;
}

const PROFILE_FIELDS: ProfileField[] = [
  { key: "first_name", label: "First Name", required: true },
  { key: "last_name", label: "Last Name", required: true },
  { key: "phone", label: "Phone Number", required: true },
  { key: "business_name", label: "Business Name", required: true },
  { key: "business_type", label: "Business Type", required: false },
  { key: "business_address", label: "Business Address", required: false },
  { key: "business_city", label: "City", required: false },
  { key: "business_province", label: "Province", required: false },
];

export function ProfileCompletionBanner() {
  const { profile, isLoading } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if banner was previously dismissed this session
    const dismissed = sessionStorage.getItem("profile-banner-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("profile-banner-dismissed", "true");
  };

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!profile) return { percentage: 0, missingFields: PROFILE_FIELDS };

    const filledFields = PROFILE_FIELDS.filter((field) => {
      const value = profile[field.key as keyof typeof profile];
      return value && String(value).trim() !== "";
    });

    const missingFields = PROFILE_FIELDS.filter((field) => {
      const value = profile[field.key as keyof typeof profile];
      return !value || String(value).trim() === "";
    });

    const percentage = Math.round((filledFields.length / PROFILE_FIELDS.length) * 100);
    return { percentage, missingFields };
  };

  const { percentage, missingFields } = calculateCompletion();

  // Don't show banner if:
  // - Not mounted yet
  // - Still loading
  // - Profile is complete (100%)
  // - User dismissed the banner
  // - No profile exists yet (will be handled by onboarding)
  if (!mounted || isLoading || percentage === 100 || isDismissed || !profile) {
    return null;
  }

  // Get the required missing fields
  const requiredMissing = missingFields.filter((f) => f.required);

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
              Complete Your Profile
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {requiredMissing.length > 0 ? (
                <>
                  Your profile is {percentage}% complete. Add your{" "}
                  <span className="font-medium">
                    {requiredMissing.slice(0, 2).map((f) => f.label).join(" and ")}
                  </span>
                  {requiredMissing.length > 2 && ` and ${requiredMissing.length - 2} more`} to help
                  customers find you.
                </>
              ) : (
                <>
                  Your profile is {percentage}% complete. Add more details to build trust with
                  customers.
                </>
              )}
            </p>

            {/* Progress bar */}
            <div className="mt-2 flex items-center gap-2">
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
          </div>
        </div>

        <Link href="/profile">
          <Button
            size="sm"
            className="gap-1 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            <User className="h-4 w-4" />
            Complete Profile
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
