"use client";

import { useState } from "react";
import { networkProviders } from "@/lib/providers";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Phone, Wifi, Signal, Smartphone, Check, Zap } from "lucide-react";

const airtimeOptions = [
  { label: "R10", value: 10, popular: false },
  { label: "R20", value: 20, popular: true },
  { label: "R50", value: 50, popular: true },
  { label: "R100", value: 100, popular: false },
];

const dataOptions = [
  { label: "100MB", value: 10, duration: "24 hours" },
  { label: "500MB", value: 25, duration: "7 days" },
  { label: "1GB", value: 40, duration: "30 days" },
  { label: "2GB", value: 70, duration: "30 days" },
];

// Provider colors for visual distinction
const providerColors: Record<string, string> = {
  vodacom: "from-red-500 to-red-600",
  mtn: "from-yellow-400 to-yellow-500",
  cellc: "from-blue-500 to-blue-600",
  telkom: "from-blue-400 to-cyan-500",
};

export default function AirtimeDataPage() {
  const [selectedAirtime, setSelectedAirtime] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<number | null>(null);
  const [phoneAirtime, setPhoneAirtime] = useState("");
  const [phoneData, setPhoneData] = useState("");
  const [selectedProviderAirtime, setSelectedProviderAirtime] = useState<string>(networkProviders[0]?.id ?? "");
  const [selectedProviderData, setSelectedProviderData] = useState<string>(networkProviders[0]?.id ?? "");
  const [isLoadingAirtime, setIsLoadingAirtime] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  function handlePurchase(type: "airtime" | "data") {
    const phone = type === "airtime" ? phoneAirtime : phoneData;
    
    if (!phone.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Phone Number",
        description: "Please enter a valid phone number.",
      });
      return;
    }

    if (type === "airtime") {
      setIsLoadingAirtime(true);
      setTimeout(() => {
        if (selectedAirtime) {
          toast({
            title: "✅ Airtime Sent!",
            description: `R${selectedAirtime} airtime sent to ${phone} on ${
              networkProviders.find((p) => p.id === selectedProviderAirtime)?.name ?? "Unknown"
            }.`,
          });
          setSelectedAirtime(null);
          setPhoneAirtime("");
        }
        setIsLoadingAirtime(false);
      }, 1500);
    }

    if (type === "data") {
      setIsLoadingData(true);
      setTimeout(() => {
        if (selectedData) {
          toast({
            title: "✅ Data Bundle Sent!",
            description: `${
              dataOptions.find((d) => d.value === selectedData)?.label
            } sent to ${phone} on ${
              networkProviders.find((p) => p.id === selectedProviderData)?.name ?? "Unknown"
            }.`,
          });
          setSelectedData(null);
          setPhoneData("");
        }
        setIsLoadingData(false);
      }, 1500);
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Airtime & Data</h1>
            <p className="text-sm text-muted-foreground">
              Send airtime or data bundles instantly
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-muted-foreground">Today</span>
            </div>
            <p className="mt-1 text-xl font-bold">R450</p>
            <p className="text-xs text-muted-foreground">Airtime sold</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">Today</span>
            </div>
            <p className="mt-1 text-xl font-bold">R280</p>
            <p className="text-xs text-muted-foreground">Data sold</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">Profit</span>
            </div>
            <p className="mt-1 text-xl font-bold">R73</p>
            <p className="text-xs text-muted-foreground">Commission</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">Total</span>
            </div>
            <p className="mt-1 text-xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Airtime Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-white">Send Airtime</CardTitle>
                <CardDescription className="text-white/80">
                  Instant delivery to any network
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Network Provider Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Select Network</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {networkProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProviderAirtime(provider.id)}
                    className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                      selectedProviderAirtime === provider.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                        : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${providerColors[provider.id] || "from-gray-400 to-gray-500"}`} />
                    <span className="text-xs font-medium">{provider.name}</span>
                    {selectedProviderAirtime === provider.id && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Airtime Amount Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Select Amount</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {airtimeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedAirtime(opt.value)}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                      selectedAirtime === opt.value
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                        : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                    }`}
                  >
                    {opt.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[10px] font-medium text-white">
                        Popular
                      </span>
                    )}
                    <span className="text-xl font-bold">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">Airtime</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="e.g. 0712345678"
                value={phoneAirtime}
                onChange={(e) => setPhoneAirtime(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            {/* Purchase Button */}
            <Button
              onClick={() => handlePurchase("airtime")}
              disabled={!selectedAirtime || !phoneAirtime.trim() || isLoadingAirtime}
              className="h-12 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-lg font-semibold hover:from-purple-600 hover:to-pink-600"
            >
              {isLoadingAirtime ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </div>
              ) : (
                `Send R${selectedAirtime || 0} Airtime`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Data Card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Wifi className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-white">Send Data Bundle</CardTitle>
                <CardDescription className="text-white/80">
                  Choose from various data packages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Network Provider Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Select Network</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {networkProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProviderData(provider.id)}
                    className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                      selectedProviderData === provider.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${providerColors[provider.id] || "from-gray-400 to-gray-500"}`} />
                    <span className="text-xs font-medium">{provider.name}</span>
                    {selectedProviderData === provider.id && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Bundle Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">Select Bundle</label>
              <div className="grid grid-cols-2 gap-2">
                {dataOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedData(opt.value)}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                      selectedData === opt.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                    }`}
                  >
                    <span className="text-xl font-bold">{opt.label}</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">R{opt.value}</span>
                    <span className="text-xs text-muted-foreground">{opt.duration}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="e.g. 0712345678"
                value={phoneData}
                onChange={(e) => setPhoneData(e.target.value)}
                className="h-12 text-lg"
              />
            </div>

            {/* Purchase Button */}
            <Button
              onClick={() => handlePurchase("data")}
              disabled={!selectedData || !phoneData.trim() || isLoadingData}
              className="h-12 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-lg font-semibold hover:from-blue-600 hover:to-cyan-600"
            >
              {isLoadingData ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </div>
              ) : (
                `Send ${dataOptions.find((d) => d.value === selectedData)?.label || "0MB"} Data`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[
              { type: "airtime", amount: 50, phone: "071****234", network: "MTN", time: "2 min ago" },
              { type: "data", amount: 40, phone: "082****567", network: "Vodacom", time: "15 min ago", data: "1GB" },
              { type: "airtime", amount: 20, phone: "063****890", network: "Cell C", time: "1 hour ago" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tx.type === "airtime" 
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20" 
                      : "bg-blue-100 text-blue-600 dark:bg-blue-500/20"
                  }`}>
                    {tx.type === "airtime" ? <Phone className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === "airtime" ? `R${tx.amount} Airtime` : `${tx.data} Data`}
                    </p>
                    <p className="text-sm text-muted-foreground">{tx.phone} • {tx.network}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">R{tx.amount}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
