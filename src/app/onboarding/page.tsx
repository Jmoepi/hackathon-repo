
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutDashboard, Boxes, QrCode, Users, Sparkles, ChevronRight, Check } from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Smart Dashboard',
    description: 'Real-time insights into your business performance with beautiful analytics.',
    gradient: 'from-emerald-500 to-teal-500',
    delay: '0ms',
  },
  {
    icon: Boxes,
    title: 'Inventory Control',
    description: 'Never run out of stock. Get alerts and track every product effortlessly.',
    gradient: 'from-blue-500 to-indigo-500',
    delay: '100ms',
  },
  {
    icon: QrCode,
    title: 'Instant Payments',
    description: 'Generate QR codes for seamless, secure digital payments in seconds.',
    gradient: 'from-purple-500 to-pink-500',
    delay: '200ms',
  },
  {
    icon: Users,
    title: 'Customer Growth',
    description: 'Build relationships with SMS promotions and customer management.',
    gradient: 'from-orange-500 to-amber-500',
    delay: '300ms',
  },
];

const stats = [
  { value: '10K+', label: 'Active Traders' },
  { value: 'R2M+', label: 'Processed Daily' },
  { value: '99.9%', label: 'Uptime' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-lg opacity-50" />
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold font-headline">TradaHub</span>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-white/10 hover:bg-white/20 text-white border-0">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 md:px-12 pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-white/80">Empowering 10,000+ entrepreneurs across Africa</span>
          </div>

          {/* Main Headline */}
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold font-headline leading-tight mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-white">Your Business,</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Your Pocket
            </span>
          </h1>

          <p className={`text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            The all-in-one business toolkit for modern entrepreneurs. 
            Manage inventory, accept digital payments, engage customers, and grow your business — all from one beautiful app.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 mb-16 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button 
              size="lg" 
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 text-lg px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push('/login')}
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-lg px-8 py-6 rounded-xl backdrop-blur-sm"
            >
              I Have an Account
            </Button>
          </div>

          {/* Stats */}
          <div className={`flex flex-wrap gap-8 md:gap-16 mb-20 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-headline bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-white/20 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: feature.delay }}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`} />
                
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold font-headline text-white mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>

                {/* Check mark */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`p-1 rounded-full bg-gradient-to-br ${feature.gradient}`}>
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
}
