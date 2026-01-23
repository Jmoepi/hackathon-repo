import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSouthAfricanBanks, getBankById } from "@/lib/payments/stitch";

/**
 * GET /api/merchant/stitch-bank
 * 
 * Query params:
 * - action=banks: Get list of SA banks
 * - (no action): Get merchant's saved bank details
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // Return list of banks
  if (action === "banks") {
    const banks = getSouthAfricanBanks();
    return NextResponse.json({
      success: true,
      banks: banks.map((bank) => ({
        id: bank.id,
        name: bank.name,
        supportsVerification: bank.supportsVerification,
        supportsInstantPayout: bank.supportsInstantPayout,
      })),
    });
  }

  // Get merchant's bank details
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("bank_code, bank_name, account_number, account_name, account_type")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // Check if bank details exist
    if (!profile.bank_code || !profile.account_number) {
      return NextResponse.json({
        success: true,
        bankDetails: null,
      });
    }

    return NextResponse.json({
      success: true,
      bankDetails: {
        bank_code: profile.bank_code,
        bank_name: profile.bank_name,
        account_number: profile.account_number,
        account_name: profile.account_name,
        account_type: profile.account_type || "current",
      },
    });
  } catch (error) {
    console.error("Error fetching bank details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/merchant/stitch-bank
 * 
 * Save merchant's bank details
 * 
 * Body:
 * - bankCode: Stitch bank ID (e.g., "fnb", "absa")
 * - accountNumber: Bank account number
 * - accountName: Account holder name
 * - accountType: "current" or "savings"
 */
export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bankCode, accountNumber, accountName, accountType = "current" } = body;

    // Validate required fields
    if (!bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: bankCode, accountNumber, accountName" },
        { status: 400 }
      );
    }

    // Validate bank exists
    const bank = getBankById(bankCode);
    if (!bank) {
      return NextResponse.json(
        { success: false, error: "Invalid bank code" },
        { status: 400 }
      );
    }

    // Validate account type
    if (!["current", "savings"].includes(accountType)) {
      return NextResponse.json(
        { success: false, error: "Account type must be 'current' or 'savings'" },
        { status: 400 }
      );
    }

    // Save to profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        bank_code: bankCode,
        bank_name: bank.name,
        account_number: accountNumber,
        account_name: accountName,
        account_type: accountType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to save bank details" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank details saved successfully",
      bankDetails: {
        bank_code: bankCode,
        bank_name: bank.name,
        account_number: accountNumber,
        account_name: accountName,
        account_type: accountType,
      },
    });
  } catch (error) {
    console.error("Error saving bank details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
