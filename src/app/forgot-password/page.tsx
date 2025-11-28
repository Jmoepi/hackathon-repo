"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Store,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message || "Could not send reset email. Please try again.",
      });
      setIsLoading(false);
      return;
    }

    setIsEmailSent(true);
    setIsLoading(false);
  };

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
          {isEmailSent ? (
            <>
              <CardHeader className="space-y-4 pb-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <CardTitle className="text-2xl text-white">Check Your Email</CardTitle>
                <CardDescription className="text-slate-300">
                  We&apos;ve sent a password reset link to <span className="font-medium text-emerald-400">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                    <div className="text-sm text-slate-300">
                      <p className="font-medium text-white">Didn&apos;t receive the email?</p>
                      <ul className="mt-2 space-y-1 text-slate-400">
                        <li>• Check your spam or junk folder</li>
                        <li>• Make sure you entered the correct email</li>
                        <li>• Wait a few minutes and try again</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEmailSent(false)}
                  variant="outline"
                  className="w-full border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800"
                >
                  Try a different email
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-center text-2xl text-white">Reset Password</CardTitle>
                <CardDescription className="text-center text-slate-300">
                  Enter your email address and we&apos;ll send you a link to reset your password
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 border-slate-700 bg-slate-800/50 pl-11 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-lg font-semibold hover:from-emerald-600 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
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
