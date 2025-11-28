"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Store,
  Mail,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

// Supabase OTP length (update if your Supabase config uses different length)
const OTP_LENGTH = 8;

// Loading fallback component
function VerifyOtpLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  );
}

// Main OTP verification component
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { verifyOtp, resendOtp, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from query params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    
    // Handle paste of full OTP
    if (value.length > 1) {
      const pastedOtp = value.slice(0, OTP_LENGTH).split("");
      pastedOtp.forEach((char, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus the next empty input or last input
      const nextIndex = Math.min(index + pastedOtp.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData) {
      handleChange(0, pastedData);
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== OTP_LENGTH) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: `Please enter all ${OTP_LENGTH} digits`,
      });
      return;
    }

    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Missing",
        description: "Please go back and sign up again",
      });
      return;
    }

    setIsLoading(true);

    const { error, success } = await verifyOtp(email, otpCode);

    if (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid or expired code. Please try again.",
      });
      // Clear OTP inputs
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setIsLoading(false);
      return;
    }

    if (success) {
      toast({
        title: "🎉 Email Verified!",
        description: "Welcome to TradaHub! Your account is now active.",
      });
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !email) return;

    setIsResending(true);

    const { error } = await resendOtp(email);

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to Resend",
        description: error.message || "Could not resend code. Please try again.",
      });
    } else {
      toast({
        title: "📧 Code Sent!",
        description: `A new verification code has been sent to ${email}`,
      });
      setResendCooldown(60); // 60 second cooldown
    }

    setIsResending(false);
  };

  // Auto-submit when all digits entered
  useEffect(() => {
    if (otp.every((digit) => digit !== "") && otp.length === OTP_LENGTH) {
      handleSubmit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
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

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
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

        {/* OTP Card */}
        <Card className="border-0 bg-white/10 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <Mail className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Verify Your Email</CardTitle>
              <CardDescription className="mt-2 text-slate-300">
                We&apos;ve sent a 6-digit code to
              </CardDescription>
              {email && (
                <p className="mt-1 font-medium text-emerald-400">{email}</p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="h-14 w-12 text-center text-2xl font-bold border-slate-700 bg-slate-800/50 text-white focus:border-emerald-500 focus:ring-emerald-500 sm:h-16 sm:w-14"
                />
              ))}
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || otp.some((d) => !d)}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Verify Email
                </>
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Didn&apos;t receive the code?
              </p>
              <Button
                variant="link"
                onClick={handleResendOtp}
                disabled={isResending || resendCooldown > 0}
                className="mt-1 text-emerald-400 hover:text-emerald-300"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            {/* Help Text */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
              <p className="text-sm text-slate-400">
                <span className="font-medium text-slate-300">Tip:</span> Check your spam or junk folder if you don&apos;t see the email. The code expires in 10 minutes.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-slate-700 pt-6">
            <Link href="/signup" className="w-full">
              <Button
                variant="outline"
                className="w-full border-slate-600 bg-slate-800/50 text-white hover:bg-slate-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign Up
              </Button>
            </Link>
            
            <p className="text-center text-sm text-slate-400">
              Already verified?{" "}
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

// Export wrapped in Suspense for Next.js 15 compatibility
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<VerifyOtpLoading />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
