"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Smartphone,
  Loader2,
} from "lucide-react";

// Loading fallback component
function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  );
}

// Main login content component
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { signIn, signInWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Get redirect URL from query params
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  // Handle auth callback errors
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_callback_error") {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "There was a problem signing you in. Please try again.",
      });
    }
  }, [searchParams, toast]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter your password.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        // Determine the appropriate title based on error type
        const errorMessage = error.message || '';
        let title = "Login Failed";
        
        if (errorMessage.includes('verify your email')) {
          title = "Email Not Verified";
        } else if (errorMessage.includes('No account found')) {
          title = "Account Not Found";
        } else if (errorMessage.includes('Too many')) {
          title = "Too Many Attempts";
        } else if (errorMessage.includes('Unable to connect')) {
          title = "Connection Error";
        }

        toast({
          variant: "destructive",
          title,
          description: errorMessage || "Please check your credentials and try again.",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "✅ Welcome back!",
        description: "You have successfully logged in.",
      });
      
      router.push(redirectTo);
    } catch (err) {
      // Handle unexpected errors gracefully
      console.error("Unexpected login error:", err);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "We couldn't sign you in. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast({
        variant: "destructive",
        title: "Google Sign-in Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
      });
      setIsLoading(false);
    }
    // Note: Google sign-in redirects to callback, so we don't need to handle success here
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

        {/* Login Card */}
        <Card className="border-0 bg-white/10 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-center text-slate-300">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 border-slate-700 bg-slate-800/50 pl-11 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-200">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 border-slate-700 bg-slate-800/50 pl-11 pr-11 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
                    required
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <Label htmlFor="remember" className="text-sm text-slate-300">
                  Remember me for 30 days
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <Separator className="bg-slate-700" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent px-2 text-sm text-slate-400">
                or continue with
              </span>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="h-12 border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                className="h-12 border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800"
              >
                <Smartphone className="mr-2 h-5 w-5" />
                Phone
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3 border-t border-slate-700 pt-6">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300">
                Sign up free
              </Link>
            </p>
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-300">
              View pricing plans →
            </Link>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-slate-400 hover:text-slate-300">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-slate-400 hover:text-slate-300">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

// Export wrapped in Suspense for Next.js 15 compatibility
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
