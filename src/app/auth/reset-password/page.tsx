"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  Store,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

// Loading fallback component
function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  );
}

// Main reset password content component
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { updatePassword } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user has a valid session (came from reset email link)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        
        // Check for error in URL params
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        if (errorParam) {
          setError(errorDescription || "Invalid or expired reset link. Please request a new one.");
          setIsValidSession(false);
          return;
        }

        // Get the current session - Supabase will have exchanged the token from the email link
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError("Invalid or expired reset link. Please request a new password reset.");
          setIsValidSession(false);
          return;
        }

        setIsValidSession(true);
      } catch (err) {
        console.error("Session check error:", err);
        setError("Something went wrong. Please try again.");
        setIsValidSession(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[a-zA-Z]/.test(pwd)) {
      return "Password must contain at least one letter";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: passwordError,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.message || "Could not update password. Please try again.",
        });
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      toast({
        title: "✅ Password Updated!",
        description: "Your password has been successfully changed.",
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Password update error:", err);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not update password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
          <p className="mt-4 text-slate-400">Verifying reset link...</p>
        </div>
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">TradaHub</h1>
              <p className="text-sm text-slate-400">Your Business, Your Pocket</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <Card className="border-0 bg-white/10 shadow-2xl backdrop-blur-xl">
          {/* Error State - Invalid/Expired Link */}
          {!isValidSession && error && (
            <>
              <CardHeader className="space-y-4 pb-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
                <CardTitle className="text-2xl text-white">Link Expired</CardTitle>
                <CardDescription className="text-slate-300">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/forgot-password">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                    Request New Reset Link
                  </Button>
                </Link>
              </CardContent>
            </>
          )}

          {/* Success State */}
          {isSuccess && (
            <>
              <CardHeader className="space-y-4 pb-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <CardTitle className="text-2xl text-white">Password Updated!</CardTitle>
                <CardDescription className="text-slate-300">
                  Your password has been successfully changed. You can now sign in with your new password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                    <div className="text-sm text-emerald-200">
                      Redirecting you to the login page...
                    </div>
                  </div>
                </div>

                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                    Go to Login
                  </Button>
                </Link>
              </CardContent>
            </>
          )}

          {/* Reset Form */}
          {isValidSession && !isSuccess && (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-center text-2xl text-white">Create New Password</CardTitle>
                <CardDescription className="text-center text-slate-300">
                  Enter a new password for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-200">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 border-slate-700 bg-slate-800/50 pl-11 pr-11 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      At least 8 characters with letters and numbers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 border-slate-700 bg-slate-800/50 pl-11 pr-11 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
                        required
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

                  {/* Password strength indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        <div className={`h-1 flex-1 rounded ${/[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        <div className={`h-1 flex-1 rounded ${password.length >= 12 && /[!@#$%^&*]/.test(password) ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className={password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}>
                          ✓ 8+ chars
                        </span>
                        <span className={/[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}>
                          ✓ Letters & numbers
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
          
          <CardFooter className="justify-center border-t border-slate-700 pt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Export wrapped in Suspense for Next.js 15 compatibility
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
