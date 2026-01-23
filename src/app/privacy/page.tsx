"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Store,
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Share2,
  Lock,
  UserCheck,
  Globe,
  Cookie,
  Bell,
  Mail,
  Trash2,
} from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "January 22, 2026";

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: Shield,
      content: `TradaHub ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our business management platform.

This policy complies with the Protection of Personal Information Act (POPIA) of South Africa and other applicable data protection laws.

By using TradaHub, you consent to the data practices described in this policy.`,
    },
    {
      id: "collection",
      title: "2. Information We Collect",
      icon: Database,
      content: `We collect information in several ways:

**Information You Provide:**
• Account details: name, email, phone number, password
• Business information: business name, address, VAT number
• Identity verification: SA ID number (optional)
• Banking details: for payment processing and payouts
• Transaction data: sales, inventory, customer records

**Information Collected Automatically:**
• Device information: browser type, operating system
• Usage data: features used, time spent, actions taken
• Log data: IP address, access times, pages viewed
• Location data: general location based on IP (not precise GPS)

**Information from Third Parties:**
• Payment verification data from Paystack
• Google account data (if using Google sign-in)`,
    },
    {
      id: "use",
      title: "3. How We Use Your Information",
      icon: Eye,
      content: `We use your information to:

**Provide Our Services:**
• Process transactions and manage your account
• Enable POS, inventory, and customer management features
• Generate receipts, invoices, and reports
• Process payments and merchant payouts

**Improve Our Platform:**
• Analyze usage patterns to enhance features
• Troubleshoot issues and fix bugs
• Develop new products and services

**Communicate With You:**
• Send service-related notifications
• Provide customer support
• Share updates about your subscription
• Send marketing communications (with your consent)

**Ensure Security and Compliance:**
• Detect and prevent fraud
• Verify identity for financial services
• Comply with legal obligations
• Enforce our terms of service`,
    },
    {
      id: "sharing",
      title: "4. Information Sharing",
      icon: Share2,
      content: `We do not sell your personal information. We may share data with:

**Service Providers:**
• Supabase: Database and authentication services
• Paystack: Payment processing
• Vercel: Hosting and infrastructure
• Analytics providers: Usage analysis

**Business Partners:**
• Only with your explicit consent
• For integrated services you choose to use

**Legal Requirements:**
• When required by law or legal process
• To protect rights, property, or safety
• To prevent fraud or illegal activities

**Business Transfers:**
• In connection with a merger, acquisition, or sale
• Your data rights would be preserved

All third parties are contractually obligated to protect your information.`,
    },
    {
      id: "security",
      title: "5. Data Security",
      icon: Lock,
      content: `We implement robust security measures:

**Technical Safeguards:**
• SSL/TLS encryption for data in transit
• Encrypted database storage
• Secure password hashing
• Regular security audits

**Access Controls:**
• Role-based access permissions
• Multi-factor authentication options
• Session management and timeouts
• Audit logs for sensitive actions

**Infrastructure:**
• Cloud hosting with enterprise-grade security
• Regular backups and disaster recovery
• Intrusion detection systems
• DDoS protection

While we strive to protect your information, no system is 100% secure. Please use strong passwords and keep your credentials confidential.`,
    },
    {
      id: "rights",
      title: "6. Your Rights (POPIA)",
      icon: UserCheck,
      content: `Under POPIA, you have the right to:

**Access:** Request a copy of your personal information
**Correction:** Update or correct inaccurate data
**Deletion:** Request deletion of your data ("right to be forgotten")
**Portability:** Export your data in a standard format
**Objection:** Object to certain processing activities
**Withdrawal:** Withdraw consent for marketing communications

**To Exercise Your Rights:**
• Use the settings in your TradaHub account
• Email us at privacy@tradahub.co.za
• We will respond within 30 days

**Verification:**
We may need to verify your identity before processing requests to protect your information.`,
    },
    {
      id: "retention",
      title: "7. Data Retention",
      icon: Database,
      content: `We retain your information for as long as necessary to:

**Active Accounts:**
• Data is retained while your account is active
• Transaction history is kept for 7 years (legal requirement)
• Backups are retained for 90 days

**After Account Deletion:**
• Personal data is deleted within 30 days
• Anonymized analytics may be retained
• Legal records are kept as required by law

**Inactive Accounts:**
• We may delete accounts inactive for 2+ years
• You will receive notice before deletion`,
    },
    {
      id: "international",
      title: "8. International Transfers",
      icon: Globe,
      content: `Your information may be processed outside South Africa:

**Where Data May Be Processed:**
• Cloud servers may be located internationally
• Third-party services may operate globally

**Safeguards:**
• We only use providers with adequate data protection
• Contractual clauses ensure your rights are protected
• We comply with POPIA's cross-border transfer requirements

**Primary Processing:**
Most data processing occurs within secure cloud infrastructure with servers distributed globally for performance and reliability.`,
    },
    {
      id: "cookies",
      title: "9. Cookies and Tracking",
      icon: Cookie,
      content: `We use cookies and similar technologies:

**Essential Cookies:**
• Authentication and session management
• Security features
• User preferences

**Analytics Cookies:**
• Usage patterns and feature adoption
• Performance monitoring
• Error tracking

**Managing Cookies:**
• Browser settings can block/delete cookies
• Some features may not work without cookies
• We respect "Do Not Track" signals

**Local Storage:**
• We store some preferences locally
• This improves performance and offline access`,
    },
    {
      id: "children",
      title: "10. Children's Privacy",
      icon: Shield,
      content: `TradaHub is designed for business use:

• Our Service is not intended for users under 18
• We do not knowingly collect data from children
• If we discover child data, we will delete it promptly
• Parents/guardians may contact us about child data

If you believe a child has provided us with personal information, please contact us immediately.`,
    },
    {
      id: "updates",
      title: "11. Policy Updates",
      icon: Bell,
      content: `We may update this Privacy Policy:

**Notification:**
• Material changes will be communicated via email
• Updates will be posted on this page
• The "Last Updated" date will be revised

**Your Options:**
• Continue using TradaHub to accept changes
• Contact us with questions or concerns
• Delete your account if you disagree

We encourage you to review this policy periodically.`,
    },
    {
      id: "contact",
      title: "12. Contact Us",
      icon: Mail,
      content: `For privacy-related inquiries:

**Information Officer:**
Email: privacy@tradahub.co.za

**General Support:**
Email: support@tradahub.co.za

**Postal Address:**
TradaHub (Pty) Ltd
Privacy Office
Johannesburg, South Africa

**Response Time:**
We aim to respond within 2 business days.

**Complaints:**
If unsatisfied with our response, you may lodge a complaint with the Information Regulator of South Africa.`,
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
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-lg text-slate-400">
            How we collect, use, and protect your information
          </p>
          <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>
        </div>

        {/* POPIA Compliance Badge */}
        <Card className="mb-8 border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-300">POPIA Compliant</h3>
              <p className="text-sm text-emerald-200/70">
                TradaHub complies with the Protection of Personal Information Act (POPIA) of South Africa
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card className="mb-8 border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Quick Navigation</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-blue-400"
                >
                  <section.icon className="h-4 w-4" />
                  {section.title.replace(/^\d+\.\s/, "")}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card
              key={section.id}
              id={section.id}
              className="scroll-mt-24 border-slate-700 bg-slate-800/50"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                    <section.icon className="h-5 w-5 text-blue-400" />
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

        {/* Your Rights Summary */}
        <Card className="mt-8 border-slate-700 bg-slate-800/50">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Your Rights at a Glance</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Eye, label: "Access your data", action: "View in Settings" },
                { icon: Database, label: "Export your data", action: "Download backup" },
                { icon: Lock, label: "Update your data", action: "Edit profile" },
                { icon: Trash2, label: "Delete your data", action: "Request deletion" },
                { icon: Bell, label: "Manage notifications", action: "Preferences" },
                { icon: Mail, label: "Contact us", action: "privacy@tradahub.co.za" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-slate-700 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                    <item.icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-400">
            Have questions about your privacy?{" "}
            <a href="mailto:privacy@tradahub.co.za" className="text-blue-400 hover:underline">
              Contact our privacy team
            </a>
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" asChild className="border-slate-700 text-slate-300">
              <Link href="/terms">Terms of Service</Link>
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
