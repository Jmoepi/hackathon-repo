"use client";

import { useState } from "react";
import { networkProviders } from "@/lib/providers";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const airtimeOptions = [
  { label: "R10 Airtime", value: 10 },
  { label: "R20 Airtime", value: 20 },
  { label: "R50 Airtime", value: 50 },
  { label: "R100 Airtime", value: 100 },
];

const dataOptions = [
  { label: "100MB Data", value: 10 },
  { label: "500MB Data", value: 25 },
  { label: "1GB Data", value: 40 },
  { label: "2GB Data", value: 70 },
];

export default function AirtimeDataPage() {
  const [selectedAirtime, setSelectedAirtime] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [selectedProviderAirtime, setSelectedProviderAirtime] = useState<string>(networkProviders[0]?.id ?? "");
  const [selectedProviderData, setSelectedProviderData] = useState<string>(networkProviders[0]?.id ?? "");
  const { toast } = useToast();

  function handlePurchase(type: "airtime" | "data") {
    if (!phone.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Phone Number",
        description: "Please enter a valid phone number.",
      });
      return;
    }

    if (type === "airtime" && selectedAirtime) {
      toast({
        title: "Airtime Sent!",
        description: `R${selectedAirtime} airtime sent to ${phone} on ${
          networkProviders.find((p) => p.id === selectedProviderAirtime)?.name ?? "Unknown"
        }. (Mocked)`,
      });
      setSelectedAirtime(null);
    }

    if (type === "data" && selectedData) {
      toast({
        title: "Data Sent!",
        description: `${
          dataOptions.find((d) => d.value === selectedData)?.label
        } sent to ${phone} on ${
          networkProviders.find((p) => p.id === selectedProviderData)?.name ?? "Unknown"
        }. (Mocked)`,
      });
      setSelectedData(null);
    }

    setPhone("");
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Airtime &amp; Data Top-Up (Mock)</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Airtime */}
        <Card>
          <CardHeader>
            <CardTitle>Send Airtime</CardTitle>
            <CardDescription>Select amount and enter phone number.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <select
                className="border rounded px-2 py-1 mb-2"
                value={selectedProviderAirtime}
                onChange={(e) => setSelectedProviderAirtime(e.target.value)}
              >
                {networkProviders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {airtimeOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="airtime"
                    value={opt.value}
                    checked={selectedAirtime === opt.value}
                    onChange={() => setSelectedAirtime(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <Input
              type="tel"
              placeholder="Recipient phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Button
              onClick={() => handlePurchase("airtime")}
              disabled={!selectedAirtime || !phone.trim()}
              className="w-full"
            >
              Send Airtime
            </Button>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle>Send Data</CardTitle>
            <CardDescription>Select bundle and enter phone number.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <select
                className="border rounded px-2 py-1 mb-2"
                value={selectedProviderData}
                onChange={(e) => setSelectedProviderData(e.target.value)}
              >
                {networkProviders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {dataOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="data"
                    value={opt.value}
                    checked={selectedData === opt.value}
                    onChange={() => setSelectedData(opt.value)}
                  />
                  <span>
                    {opt.label} (R{opt.value})
                  </span>
                </label>
              ))}
            </div>

            <Input
              type="tel"
              placeholder="Recipient phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Button
              onClick={() => handlePurchase("data")}
              disabled={!selectedData || !phone.trim()}
              className="w-full"
            >
              Send Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
