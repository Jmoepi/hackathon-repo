import { NextRequest, NextResponse } from "next/server";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

interface ReCaptchaVerifyResponse {
  success: boolean;
  score?: number; // 0.0 - 1.0 (v3 only)
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function verifyReCaptchaToken(
  token: string
): Promise<{ success: boolean; score?: number; error?: string }> {
  if (!RECAPTCHA_SECRET_KEY || RECAPTCHA_SECRET_KEY === "your_recaptcha_secret_key_here") {
    // Skip verification in development if not configured
    console.warn("reCAPTCHA secret key not configured, skipping verification");
    return { success: true, score: 1.0 };
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data: ReCaptchaVerifyResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data["error-codes"]?.join(", ") || "Verification failed",
      };
    }

    // For reCAPTCHA v3, check the score (0.5 is a good threshold)
    if (data.score !== undefined && data.score < 0.5) {
      return {
        success: false,
        score: data.score,
        error: "Low reCAPTCHA score - suspected bot activity",
      };
    }

    return {
      success: true,
      score: data.score,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      error: "Failed to verify reCAPTCHA",
    };
  }
}

// API route handler for client-side verification
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No reCAPTCHA token provided" },
        { status: 400 }
      );
    }

    const result = await verifyReCaptchaToken(token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      score: result.score,
    });
  } catch (error) {
    console.error("reCAPTCHA API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
