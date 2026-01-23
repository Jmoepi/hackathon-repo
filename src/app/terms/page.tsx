"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Store,
  ArrowLeft,
  FileText,
  Shield,
  CreditCard,
  Users,
  AlertTriangle,
  Scale,
  Mail,
} from "lucide-react";

export default function TermsPage() {
  const lastUpdated = "January 22, 2026";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: FileText,
      content: `By accessing or using TradaHub ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.

These terms apply to all users of the Service, including merchants, business owners, and any other visitors to our platform.`,
    },
    {
      id: "description",
      title: "2. Description of Service",
      icon: Store,
      content: `TradaHub is a business management platform designed for small and medium enterprises in South Africa. Our services include:

• Point of Sale (POS) system for processing transactions
• Inventory management and stock tracking
• Customer relationship management
• Payment processing through integrated payment providers
• Business analytics and reporting
• Receipt generation and management
• Subscription-based premium features

We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.`,
    },
    {
      id: "accounts",
      title: "3. User Accounts",
      icon: Users,
      content: `To use TradaHub, you must:

• Be at least 18 years of age
• Provide accurate, complete, and current registration information
• Maintain the security of your account credentials
• Notify us immediately of any unauthorized access
• Accept responsibility for all activities under your account

You may not:
• Share your account with others
• Create multiple accounts for fraudulent purposes
• Use another person's account without permission
• Provide false or misleading information`,
    },
    {
      id: "payments",
      title: "4. Payments and Subscriptions",
      icon: CreditCard,
      content: `TradaHub offers both free and paid subscription plans:

**Free Plan:**
• Basic POS functionality
• Limited transaction history
• Standard support

**Paid Plans (Starter, Growth, Pro):**
• Enhanced features as described on our pricing page
• Monthly or annual billing options
• Automatic renewal unless cancelled

**Payment Terms:**
• All fees are quoted in South African Rand (ZAR)
• Payments are processed securely through Paystack
• Subscription fees are non-refundable except as required by law
• We may change pricing with 30 days notice

**Split Payments:**
• Merchants receive 95% of customer payments
• A 5% platform fee is deducted for payment processing and platform costs
• Payouts are processed according to Paystack's settlement schedule`,
    },
    {
      id: "conduct",
      title: "5. Acceptable Use",
      icon: Shield,
      content: `You agree not to use TradaHub for:

• Any unlawful purpose or illegal activities
• Selling prohibited, counterfeit, or stolen goods
• Money laundering or fraudulent transactions
• Harassment, abuse, or harm to others
• Distributing malware or harmful code
• Attempting to breach our security measures
• Scraping or data mining without permission
• Any activity that violates South African law

We reserve the right to suspend or terminate accounts that violate these terms.`,
    },
    {
      id: "data",
      title: "6. Data and Privacy",
      icon: Shield,
      content: `Your use of TradaHub is also governed by our Privacy Policy. Key points:

• We collect and process data as described in our Privacy Policy
• You retain ownership of your business data
• We implement industry-standard security measures
• You can export or delete your data at any time
• We comply with the Protection of Personal Information Act (POPIA)

By using our Service, you consent to our data practices as described in the Privacy Policy.`,
    },
    {
      id: "liability",
      title: "7. Limitation of Liability",
      icon: AlertTriangle,
      content: `To the maximum extent permitted by South African law:

• TradaHub is provided "as is" without warranties of any kind
• We do not guarantee uninterrupted or error-free service
• We are not liable for any indirect, incidental, or consequential damages
• Our total liability shall not exceed the fees paid by you in the past 12 months
• We are not responsible for third-party services or integrations

You agree to indemnify TradaHub against any claims arising from your use of the Service or violation of these terms.`,
    },
    {
      id: "termination",
      title: "8. Termination",
      icon: FileText,
      content: `Either party may terminate this agreement:

**You may:**
• Cancel your subscription at any time through your account settings
• Request deletion of your account and data
• Stop using the Service at any time

**We may:**
• Suspend accounts for suspected violations
• Terminate accounts that breach these terms
• Discontinue the Service with 30 days notice

Upon termination:
• Your access to the Service will end
• You may export your data within 30 days
• Unpaid fees remain due and payable`,
    },
    {
      id: "governing",
      title: "9. Governing Law",
      icon: Scale,
      content: `These Terms of Service are governed by the laws of the Republic of South Africa.

• Any disputes shall be resolved in South African courts
• The Consumer Protection Act applies where applicable
• The Electronic Communications and Transactions Act governs electronic agreements
• POPIA governs the processing of personal information

If any provision of these terms is found unenforceable, the remaining provisions will continue in effect.`,
    },
    {
      id: "changes",
      title: "10. Changes to Terms",
      icon: FileText,
      content: `We may update these Terms of Service from time to time:

• Material changes will be communicated via email or in-app notification
• Continued use after changes constitutes acceptance
• You may terminate your account if you disagree with changes
• The "Last Updated" date at the top indicates the latest revision`,
    },
    {
      id: "contact",
      title: "11. Contact Us",
      icon: Mail,
      content: `If you have questions about these Terms of Service, please contact us:

**Email:** legal@tradahub.co.za
**Support:** support@tradahub.co.za
**Address:** TradaHub (Pty) Ltd, Johannesburg, South Africa

We aim to respond to all inquiries within 2 business days.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TradaHub</span>
          </Link>
          <Button variant="ghost" asChild className="text-slate-300 hover:text-white">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl px-4 py-12">
        {/* Title Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20">
            <FileText className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">Terms of Service</h1>
          <p className="text-lg text-slate-400">
            Please read these terms carefully before using TradaHub
          </p>
          <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8 border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Quick Navigation</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-emerald-400"
                >
                  <section.icon className="h-4 w-4" />
                  {section.title.replace(/^\d+\.\s/, "")}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-slate-700 bg-slate-800/50"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                    <section.icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-line text-slate-300">{section.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-400">
            Have questions about our terms?{" "}
            <a href="mailto:legal@tradahub.co.za" className="text-emerald-400 hover:underline">
              Contact our legal team
            </a>
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" asChild className="border-slate-700 text-slate-300">
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
