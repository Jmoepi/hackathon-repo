"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  LayoutDashboard,
  Boxes,
  QrCode,
  Users,
  Sparkles,
  ChevronRight,
  Check,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description:
      "See your daily sales, top products, and cash flow in one simple view.",
    gradient: "from-emerald-500 to-teal-500",
    delay: "0ms",
  },
  {
    icon: Boxes,
    title: "Inventory Control",
    description:
      "Track stock, avoid shortages, and know exactly what’s selling.",
    gradient: "from-blue-500 to-indigo-500",
    delay: "75ms",
  },
  {
    icon: QrCode,
    title: "Instant Payments",
    description:
      "Share QR codes for secure payments and get paid in seconds.",
    gradient: "from-purple-500 to-pink-500",
    delay: "150ms",
  },
  {
    icon: Users,
    title: "Customer Growth",
    description:
      "Send promos, keep a customer list, and grow repeat business.",
    gradient: "from-orange-500 to-amber-500",
    delay: "225ms",
  },
];

const stats = [
  { value: "10K+", label: "Active Businesses" },
  { value: "R2M+", label: "Processed Daily" },
  { value: "99.9%", label: "Uptime" },
];

const steps = [
  {
    title: "Create your free account",
    description: "Sign up with your email or Google in under 2 minutes.",
  },
  {
    title: "Add your products & services",
    description:
      "Capture what you sell — from stock items to services and packages.",
  },
  {
    title: "Start running smarter",
    description:
      "Track sales, send promos, and accept digital payments from day one.",
  },
];

const segments = [
  {
    id: "shops",
    label: "Shops",
    businessName: "Freedom Supermarket",
    salesLabel: "Today's sales",
    salesValue: "R7,480",
    changeLabel: "vs. yesterday",
    changeValue: "▲ +18.2%",
    card1Title: "Top product",
    card1Main: "2L Sunflower Oil",
    card1Meta: "64 units sold",
    card2Title: "Stock alert",
    card2Main: "Bread – White Loaf",
    card2Meta: "Only 6 left",
    testimonialName: "Thandi's Mini Market",
    testimonialText:
      "“Now I know exactly what to buy next and what to stop wasting money on.”",
    floatingTag: "Perfect for supermarkets & spaza shops.",
  },
  {
    id: "salons",
    label: "Salons",
    businessName: "Glow Beauty Studio",
    salesLabel: "Today's revenue",
    salesValue: "R4,250",
    changeLabel: "vs. last week",
    changeValue: "▲ +12.5%",
    card1Title: "Top service",
    card1Main: "Gel Manicure",
    card1Meta: "32 bookings this week",
    card2Title: "Slot alert",
    card2Main: "Saturday 10:00–12:00",
    card2Meta: "Almost fully booked",
    testimonialName: "Lerato – Salon Owner",
    testimonialText:
      "“I see my bookings and product stock in one place. No more double-booking.”",
    floatingTag: "Perfect for hair & beauty salons.",
  },
  {
    id: "restaurants",
    label: "Restaurants",
    businessName: "Corner Grill & Kota",
    salesLabel: "Today's orders",
    salesValue: "128",
    changeLabel: "avg. order value",
    changeValue: "R89.50",
    card1Title: "Top item",
    card1Main: "Kota & Chips Combo",
    card1Meta: "91 orders today",
    card2Title: "Ingredient alert",
    card2Main: "Burger buns",
    card2Meta: "Low for tonight's service",
    testimonialName: "Sipho – Restaurant Owner",
    testimonialText:
      "“I can see busy hours and low stock before the rush starts.”",
    floatingTag: "Perfect for takeaways & restaurants.",
  },
  {
    id: "delivery",
    label: "Delivery services",
    businessName: "QuickDrop Couriers",
    salesLabel: "Today’s jobs",
    salesValue: "23 completed",
    changeLabel: "in progress",
    changeValue: "5 active",
    card1Title: "Top zone",
    card1Main: "CBD & Inner City",
    card1Meta: "14 deliveries",
    card2Title: "Time window",
    card2Main: "16:00 – 18:00",
    card2Meta: "Peak pickup time",
    testimonialName: "Ayesha – Fleet Owner",
    testimonialText:
      "“I know where my drivers are and which jobs still need attention.”",
    floatingTag: "Perfect for couriers & local delivery.",
  },
  {
    id: "freelancers",
    label: "Freelancers",
    businessName: "Design by Neo",
    salesLabel: "This month",
    salesValue: "R18,300",
    changeLabel: "projects delivered",
    changeValue: "6 completed",
    card1Title: "Top service",
    card1Main: "Brand Kit Package",
    card1Meta: "R12,000 revenue",
    card2Title: "Invoice alert",
    card2Main: "3 unpaid invoices",
    card2Meta: "Due this week",
    testimonialName: "Neo – Brand Designer",
    testimonialText:
      "“I track my jobs, invoices and payments without a spreadsheet.”",
    floatingTag: "Perfect for creatives & consultants.",
  },
  {
    id: "online-stores",
    label: "Online stores",
    businessName: "Mzansi Streetwear",
    salesLabel: "Today's sales",
    salesValue: "R5,960",
    changeLabel: "orders shipped",
    changeValue: "31 shipped",
    card1Title: "Top product",
    card1Main: "Oversized Hoodie",
    card1Meta: "48 sold this week",
    card2Title: "Cart alert",
    card2Main: "Abandoned carts",
    card2Meta: "12 need follow-up",
    testimonialName: "Naledi – Store Owner",
    testimonialText:
      "“I finally see which products move and which ones to mark down.”",
    floatingTag: "Perfect for e-commerce brands.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState(segments[0].id);

  const activeSegment =
    segments.find((segment) => segment.id === selectedSegmentId) ?? segments[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* soft gradients */}
        <div className="absolute -top-40 -left-32 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%),linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[length:100%_100%,40px_40px,40px_40px] opacity-60" />
      </div>

      {/* Page content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 blur-md opacity-70" />
              <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-slate-950 ring-1 ring-emerald-400/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-emerald-300"
                  aria-hidden="true"
                >
                  <path d="M12 2L3 7l9 5 9-5-9-5z" />
                  <path d="M3 12l9 5 9-5" />
                  <path d="M3 17l9 5 9-5" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-xl font-semibold tracking-tight">
                TradaHub
              </span>
              <span className="text-xs text-slate-400">
                Business OS for modern entrepreneurs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="#features"
              className="hidden text-sm text-slate-300 hover:text-white md:inline-flex"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hidden text-sm text-slate-300 hover:text-white md:inline-flex"
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className="hidden text-sm text-slate-300 hover:text-white md:inline-flex"
            >
              Pricing
            </Link>
            <Button
              asChild
              variant="ghost"
              className="text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>

        {/* Hero section */}
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 md:px-6 md:pb-28 md:pt-10">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
            {/* Left: copy */}
            <div>
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-100/80 backdrop-blur-sm transition-all duration-500 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/10">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                </div>
                <span className="hidden sm:inline">
                  Empowering 10,000+ businesses across Africa
                </span>
                <span className="inline sm:hidden">Built for growing businesses</span>
              </div>

              {/* Headline */}
              <h1
                className={`mt-6 font-headline text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl transition-all duration-500 delay-75 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <span className="block text-white">
                  Your business,
                </span>
                <span className="mt-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  always in your pocket.
                </span>
              </h1>

              {/* Subtext */}
              <p
                className={`mt-4 max-w-xl text-base text-slate-300/80 md:text-lg md:leading-relaxed transition-all duration-500 delay-150 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                TradaHub is your all-in-one business toolkit. Whether you run a
                corner shop, salon, online store, or side hustle, manage stock,
                track sales, accept digital payments, and grow your customer base —
                all from one simple, powerful app.
              </p>

              {/* CTAs */}
              <div
                className={`mt-8 flex flex-col gap-3 sm:flex-row sm:items-center transition-all duration-500 delay-200 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <Button
                  size="lg"
                  onClick={() => router.push("/signup")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-6 text-base font-medium text-white shadow-xl shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/40 md:text-lg"
                >
                  Create free account
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-slate-100/90 backdrop-blur-sm hover:bg-white/10 md:text-base"
                >
                  See how it works
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Stats */}
              <div
                className={`mt-10 flex flex-wrap gap-6 md:gap-10 transition-all duration-500 delay-250 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                {stats.map((stat, i) => (
                  <div key={i} className="min-w-[110px]">
                    <div className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-2xl font-semibold text-transparent md:text-3xl">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Who is TradaHub for? */}
              <div
                className={`mt-6 space-y-3 transition-all duration-500 delay-275 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Who is TradaHub for?
                </p>
                <div className="flex flex-wrap gap-2">
                  {segments.map((segment) => {
                    const isActive = segment.id === activeSegment.id;
                    return (
                      <button
                        key={segment.id}
                        type="button"
                        onClick={() => setSelectedSegmentId(segment.id)}
                        className={[
                          "inline-flex items-center rounded-full px-3 py-1 text-xs backdrop-blur-sm transition-all",
                          "border",
                          isActive
                            ? "border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-sm shadow-emerald-500/40"
                            : "border-white/10 bg-white/5 text-slate-100/90 hover:border-emerald-400/50 hover:bg-emerald-500/10",
                        ].join(" ")}
                      >
                        {segment.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Social proof line */}
              <p
                className={`mt-5 text-xs text-slate-400 transition-all duration-500 delay-300 ${
                  mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                No setup fees. No long contracts. Just tools that help your business grow.
              </p>
            </div>

            {/* Right: app preview (changes per segment) */}
            <div
              className={`relative mx-auto mt-2 max-w-sm w-full transition-all duration-600 delay-150 ${
                mounted
                  ? "translate-y-0 opacity-100 md:translate-x-0"
                  : "translate-y-4 opacity-0 md:translate-x-4"
              }`}
              aria-hidden="true"
            >
              <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/80 px-4 pb-6 pt-4 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl">
                {/* phone notch */}
                <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-slate-700/90" />

                {/* header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-emerald-200/80">
                      Today&apos;s Snapshot
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {activeSegment.businessName}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                    Live sync
                  </span>
                </div>

                {/* main stats card */}
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-slate-900/90 p-3 ring-1 ring-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-emerald-200/80">
                        {activeSegment.salesLabel}
                      </p>
                      <p className="mt-1 text-xl font-semibold text-emerald-100">
                        {activeSegment.salesValue}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-emerald-200/80">
                        {activeSegment.changeLabel}
                      </p>
                      <p className="mt-1 text-xs font-medium text-emerald-300">
                        {activeSegment.changeValue}
                      </p>
                    </div>
                  </div>

                  {/* tiny bar chart vibes (kept generic) */}
                  <div className="mt-4 flex items-end gap-1.5">
                    <div className="h-6 flex-1 rounded-full bg-emerald-500/35" />
                    <div className="h-8 flex-1 rounded-full bg-emerald-400/45" />
                    <div className="h-5 flex-1 rounded-full bg-emerald-500/25" />
                    <div className="h-10 flex-1 rounded-full bg-emerald-300/60" />
                    <div className="h-7 flex-1 rounded-full bg-emerald-400/35" />
                  </div>
                </div>

                {/* mini cards */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
                    <p className="text-[11px] text-slate-400">
                      {activeSegment.card1Title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-100">
                      {activeSegment.card1Main}
                    </p>
                    <p className="mt-2 text-[11px] text-emerald-300">
                      {activeSegment.card1Meta}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
                    <p className="text-[11px] text-slate-400">
                      {activeSegment.card2Title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-100">
                      {activeSegment.card2Main}
                    </p>
                    <p className="mt-2 text-[11px] text-amber-300">
                      {activeSegment.card2Meta}
                    </p>
                  </div>
                </div>

                {/* customer snippet */}
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-900/90 p-3 ring-1 ring-white/5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold">
                    {activeSegment.businessName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-100">
                      {activeSegment.testimonialName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {activeSegment.testimonialText}
                    </p>
                  </div>
                </div>
              </div>

              {/* floating tag */}
              <div className="absolute -bottom-4 right-3 rounded-xl border border-emerald-400/30 bg-slate-900/95 px-3 py-2 text-[10px] text-emerald-100 shadow-lg shadow-emerald-500/30">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/80">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span>{activeSegment.floatingTag}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <section
            id="features"
            className="mt-16 border-t border-white/5 pt-10 md:mt-20 md:pt-12"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-headline text-2xl font-semibold md:text-3xl">
                  All the tools your business needs.
                </h2>
                <p className="mt-2 max-w-xl text-sm text-slate-300/80 md:text-base">
                  No more juggling WhatsApp, notebooks, and spreadsheets.
                  TradaHub brings everything together in one clean, easy-to-use
                  workspace for product-based and service businesses.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07]`}
                  style={{
                    transitionDelay: mounted ? feature.delay : "0ms",
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br ${feature.gradient} mix-blend-soft-light`}
                  />
                  <div className="relative">
                    <div
                      className={`inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5`}
                    >
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-4 font-headline text-base font-semibold text-white md:text-lg">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200/80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section
            id="how-it-works"
            className="mt-16 border-t border-white/5 pt-10 md:mt-20 md:pt-12"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-headline text-2xl font-semibold md:text-3xl">
                  Get started in three simple steps.
                </h2>
                <p className="mt-2 max-w-xl text-sm text-slate-300/80 md:text-base">
                  TradaHub is designed for busy business owners and side hustlers.
                  No manuals, no training needed — just tap through and you&apos;re in control.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-300">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium text-slate-100">
                      {step.title}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300/80 md:text-sm">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-16 md:mt-20">
            <div className="overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/20 via-slate-900 to-teal-500/20 p-6 shadow-xl shadow-emerald-500/25 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-headline text-xl font-semibold text-white md:text-2xl">
                    Ready to run your business on autopilot?
                  </h3>
                  <p className="mt-2 max-w-xl text-sm text-emerald-50/90 md:text-base">
                    Join thousands of businesses using TradaHub — from retail
                    shops and salons to restaurants, freelancers, and online brands.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    size="lg"
                    onClick={() => router.push("/signup")}
                    className="rounded-xl bg-white px-7 py-5 text-sm font-semibold text-slate-950 hover:bg-slate-100 md:text-base"
                  >
                    Start free now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="rounded-xl border-white/40 bg-transparent px-7 py-5 text-sm font-medium text-white hover:bg-white/10 md:text-base"
                  >
                    I already have an account
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-emerald-50/80">
                Works for small teams and solo founders. Data-friendly and built
                for African networks.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
