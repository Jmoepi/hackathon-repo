"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  getOrCreateSettings,
  updateSettings,
  transformToFrontendSettings,
  transformToDbSettings,
  getDefaultFrontendSettings,
  type FrontendSettings,
} from "@/lib/supabase/services/settings";
import { StitchBankDetailsForm } from "./components/stitch-bank-details-form";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  Receipt,
  Shield,
  Smartphone,
  Volume2,
  Printer,
  CreditCard,
  Globe,
  Save,
  Check,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<FrontendSettings>(getDefaultFrontendSettings());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      if (!user) {
        // Fall back to localStorage if not logged in
        const savedSettings = localStorage.getItem("tradahub-settings");
        if (savedSettings) {
          try {
            setSettings(JSON.parse(savedSettings));
          } catch (e) {
            console.error("Error parsing localStorage settings:", e);
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        const dbSettings = await getOrCreateSettings(user.id);
        const frontendSettings = transformToFrontendSettings(dbSettings);
        setSettings(frontendSettings);
        
        // Sync theme with the settings
        if (frontendSettings.theme) {
          setTheme(frontendSettings.theme);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        // Fall back to localStorage
        const savedSettings = localStorage.getItem("tradahub-settings");
        if (savedSettings) {
          try {
            setSettings(JSON.parse(savedSettings));
          } catch (e) {
            console.error("Error parsing localStorage settings:", e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (mounted) {
      loadSettings();
    }
  }, [user, mounted, setTheme]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Update theme in settings state
      const updatedSettings = { ...settings, theme: theme as 'light' | 'dark' | 'system' };
      
      if (user) {
        // Save to Supabase
        const dbSettings = transformToDbSettings(updatedSettings);
        const { error } = await updateSettings(user.id, dbSettings);
        
        if (error) {
          throw error;
        }
      }
      
      // Also save to localStorage as backup
      localStorage.setItem("tradahub-settings", JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      toast({
        title: "✅ Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "❌ Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof FrontendSettings, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Handle theme change and persist it
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    
    // Auto-save theme preference
    if (user) {
      try {
        await updateSettings(user.id, { theme: newTheme });
      } catch (error) {
        console.error("Error saving theme:", error);
      }
    }
    localStorage.setItem("tradahub-settings", JSON.stringify({ ...settings, theme: newTheme }));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-700">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Customize your app experience
            </p>
          </div>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Sun className="h-5 w-5 text-purple-600 dark:hidden" />
                <Moon className="hidden h-5 w-5 text-purple-400 dark:block" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block text-sm font-medium">Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <Sun className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium">Light</span>
                  {theme === "light" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                    <Moon className="h-6 w-6 text-slate-200" />
                  </div>
                  <span className="text-sm font-medium">Dark</span>
                  {theme === "dark" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
                <button
                  onClick={() => handleThemeChange("system")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    theme === "system"
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-slate-800">
                    <Monitor className="h-6 w-6 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium">System</span>
                  {theme === "system" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your alert preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Sound Alerts</p>
                  <p className="text-xs text-muted-foreground">Play sounds for new sales</p>
                </div>
              </div>
              <Switch
                checked={settings.soundAlerts}
                onCheckedChange={(checked) => updateSetting("soundAlerts", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Low Stock Alerts</p>
                  <p className="text-xs text-muted-foreground">Notify when inventory is low</p>
                </div>
              </div>
              <Switch
                checked={settings.lowStockAlerts}
                onCheckedChange={(checked) => updateSetting("lowStockAlerts", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Sales Alerts</p>
                  <p className="text-xs text-muted-foreground">Notify for each sale</p>
                </div>
              </div>
              <Switch
                checked={settings.salesAlerts}
                onCheckedChange={(checked) => updateSetting("salesAlerts", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle>Receipt Settings</CardTitle>
                <CardDescription>Customize your receipts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Business Logo</p>
                <p className="text-xs text-muted-foreground">Display logo on receipts</p>
              </div>
              <Switch
                checked={settings.showLogo}
                onCheckedChange={(checked) => updateSetting("showLogo", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Business Address</p>
                <p className="text-xs text-muted-foreground">Include address on receipts</p>
              </div>
              <Switch
                checked={settings.showAddress}
                onCheckedChange={(checked) => updateSetting("showAddress", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Phone Number</p>
                <p className="text-xs text-muted-foreground">Display contact number</p>
              </div>
              <Switch
                checked={settings.showPhone}
                onCheckedChange={(checked) => updateSetting("showPhone", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show VAT/Tax Info</p>
                <p className="text-xs text-muted-foreground">Include VAT breakdown</p>
              </div>
              <Switch
                checked={settings.showVAT}
                onCheckedChange={(checked) => updateSetting("showVAT", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="footer">Receipt Footer Message</Label>
              <Input
                id="footer"
                value={settings.footerMessage}
                onChange={(e) => updateSetting("footerMessage", e.target.value)}
                placeholder="Thank you message..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure payment options</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable QR Payments</p>
                <p className="text-xs text-muted-foreground">Accept payments via QR code</p>
              </div>
              <Switch
                checked={settings.enableQRPayments}
                onCheckedChange={(checked) => updateSetting("enableQRPayments", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable Card Payments</p>
                <p className="text-xs text-muted-foreground">Accept card payments</p>
              </div>
              <Switch
                checked={settings.enableCardPayments}
                onCheckedChange={(checked) => updateSetting("enableCardPayments", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-Generate Receipt</p>
                <p className="text-xs text-muted-foreground">Create receipt after each sale</p>
              </div>
              <Switch
                checked={settings.autoGenerateReceipt}
                onCheckedChange={(checked) => updateSetting("autoGenerateReceipt", checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Default Payment Method</Label>
              <div className="grid grid-cols-3 gap-2">
                {["cash", "card", "mobile"].map((method) => (
                  <button
                    key={method}
                    onClick={() => updateSetting("defaultPaymentMethod", method)}
                    className={`rounded-lg border-2 p-3 text-sm font-medium capitalize transition-all ${
                      settings.defaultPaymentMethod === method
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details for Payouts */}
        <StitchBankDetailsForm />

        {/* Regional Settings */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                <Globe className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>Location and format preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Currency</Label>
                <select
                  value={settings.currency}
                  onChange={(e) => updateSetting("currency", e.target.value)}
                  className="w-full rounded-lg border bg-background p-3"
                >
                  <option value="ZAR">ZAR - South African Rand</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting("language", e.target.value)}
                  className="w-full rounded-lg border bg-background p-3"
                >
                  <option value="en">English</option>
                  <option value="zu">isiZulu</option>
                  <option value="xh">isiXhosa</option>
                  <option value="af">Afrikaans</option>
                  <option value="st">Sesotho</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => updateSetting("dateFormat", e.target.value)}
                  className="w-full rounded-lg border bg-background p-3"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle>Security & Privacy</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" className="justify-start gap-2">
                <Shield className="h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <Smartphone className="h-4 w-4" />
                Enable Two-Factor Auth
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <Printer className="h-4 w-4" />
                Export My Data
              </Button>
              <Button variant="outline" className="justify-start gap-2 text-red-600 hover:text-red-700">
                <Shield className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
