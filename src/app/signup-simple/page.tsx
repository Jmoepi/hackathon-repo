"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  Store,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

type Step = "email" | "otp";
const OTP_LENGTH = 6;

export default function SimpleEmailOtpSignup() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first OTP input when step changes
  useEffect(() => {
    if (step === "otp") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.every((digit) => digit !== "") && step === "otp") {
      handleVerifyOtp();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({ variant: "destructive", title: "Please enter your email address" });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Create account if doesn't exist
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to send code",
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "📧 Code Sent!",
        description: `Check your email for a 6-digit verification code.`,
      });
      
      setStep("otp");
      setResendCooldown(60);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and log in
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== OTP_LENGTH) {
      toast({ variant: "destructive", title: "Please enter the complete 6-digit code" });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email", // or "magiclink" depending on your setup
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: error.message || "The code you entered is incorrect or expired.",
        });
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "✅ Success!",
          description: "You're now signed in.",
        });
        
        // Redirect to dashboard or onboarding
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to resend code",
          description: error.message,
        });
      } else {
        toast({
          title: "📧 New Code Sent!",
          description: "Check your email for a new verification code.",
        });
        setResendCooldown(60);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < OTP_LENGTH) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled or next empty input
    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[128px]" />
        <div className="absolute -right-[10%] bottom-0 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[128px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">TradaHub</h1>
              <p className="text-sm text-slate-400">Your Business, Your Pocket</p>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="border-0 bg-white/10 shadow-2xl backdrop-blur-xl">
          {step === "email" ? (
            // STEP 1: Enter Email
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-center text-2xl text-white">
                  Sign Up with Email
                </CardTitle>
                <CardDescription className="text-center text-slate-300">
                  We&apos;ll send you a one-time code to verify your email
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-12 border-slate-700 bg-slate-800/50 pl-11 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            // STEP 2: Enter OTP
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-center text-2xl text-white">
                  Enter Verification Code
                </CardTitle>
                <CardDescription className="text-center text-slate-300">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-emerald-400">{email}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isLoading}
                      className="h-14 w-12 text-center text-2xl font-bold border-slate-700 bg-slate-800/50 text-white focus:border-emerald-500 focus:ring-emerald-500 sm:h-16 sm:w-14"
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.some((d) => !d)}
                  className="h-12 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg hover:from-emerald-600 hover:to-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Verify & Sign In
                    </>
                  )}
                </Button>

                {/* Resend Code */}
                <div className="text-center">
                  <p className="text-sm text-slate-400">Didn&apos;t receive the code?</p>
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

                {/* Back to Email */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStep("email");
                    setOtp(Array(OTP_LENGTH).fill(""));
                  }}
                  className="w-full text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Email
                </Button>
              </CardContent>
            </>
          )}

          <CardFooter className="justify-center border-t border-slate-700 pt-6">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Info Text */}
        <p className="mt-6 text-center text-sm text-slate-500">
          No password needed! We&apos;ll send you a secure code every time you sign in.
        </p>
      </div>
    </div>
  );
}
