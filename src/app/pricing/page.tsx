"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SERVICES,
  BUNDLES,
  SERVICE_CATEGORIES,
  getServicesByIds,
  getServicesGroupedByCategory,
  calculateCustomPlanPrice,
  calculateBundleSavings,
  formatPrice,
  generateCustomPlanParams,
  getBundleById,
  type ServiceId,
  type ServiceDefinition,
  type BundleDefinition,
  type ServiceCategory,
} from "@/lib/services/catalog";
import { useSubscription } from "@/context/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  ShoppingCart,
  Zap,
  Crown,
  Star,
} from "lucide-react";

// ============================================================================
// Sub-components
// ============================================================================

function BundleBadge({ badge }: { badge?: BundleDefinition["badge"] }) {
  if (!badge) return null;

  const config = {
    starter: { label: "Starter", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    popular: { label: "Most Popular", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    best_value: { label: "Best Value", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  };

  const { label, className } = config[badge];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function ServiceBadge({ badge }: { badge?: ServiceDefinition["badge"] }) {
  if (!badge) return null;

  const config = {
    popular: { label: "Popular", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    new: { label: "New", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    beta: { label: "Beta", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  };

  const { label, className } = config[badge];
  return <Badge variant="outline" className={className}>{label}</Badge>;
}

function BundleCard({
  bundle,
  isSelected,
  onSelect,
}: {
  bundle: BundleDefinition;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const services = getServicesByIds(bundle.services);
  const { individualTotal, savings, savingsPercentage } = calculateBundleSavings(bundle);

  const IconMap: Record<string, typeof Package> = {
    starter: Zap,
    growth: Star,
    pro: Crown,
  };
  const Icon = IconMap[bundle.id] || Package;

  return (
    <Card
      className={`relative flex flex-col transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-primary shadow-lg"
          : "hover:shadow-md hover:border-primary/30"
      } ${bundle.badge === "popular" ? "border-emerald-500/50" : ""}`}
    >
      {bundle.badge === "popular" && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-500 text-white shadow-lg">
            <Sparkles className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                bundle.badge === "best_value"
                  ? "bg-gradient-to-br from-purple-500 to-indigo-500"
                  : bundle.badge === "popular"
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
              }`}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{bundle.name}</CardTitle>
              {bundle.badge && bundle.badge !== "popular" && (
                <BundleBadge badge={bundle.badge} />
              )}
            </div>
          </div>
        </div>
        <CardDescription className="mt-2">{bundle.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{formatPrice(bundle.monthlyPrice)}</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          {savings > 0 && (
            <p className="text-sm text-emerald-600 mt-1">
              Save {formatPrice(savings)} ({savingsPercentage}% off)
            </p>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Includes {services.length} services:
          </p>
          <ul className="space-y-2">
            {services.map((service) => (
              <li key={service.id} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{service.name}</span>
                {service.badge && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {service.badge}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">
            <strong>Recommended for:</strong> {bundle.recommendedFor}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className="w-full"
          variant={isSelected ? "secondary" : "default"}
          onClick={onSelect}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Selected
            </>
          ) : (
            <>
              Select {bundle.name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ServiceCard({
  service,
  isSelected,
  onToggle,
}: {
  service: ServiceDefinition;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const isFree = service.baseMonthlyPrice === 0;

  return (
    <Card
      className={`transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-primary/50 bg-primary/5"
          : "hover:border-primary/30"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">{service.name}</CardTitle>
              <ServiceBadge badge={service.badge} />
            </div>
            <CardDescription className="text-sm">
              {service.description}
            </CardDescription>
          </div>
          <Switch checked={isSelected} onCheckedChange={onToggle} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            {isFree ? (
              <span className="text-sm font-medium text-emerald-600">Free</span>
            ) : (
              <>
                <span className="text-lg font-semibold">
                  {formatPrice(service.baseMonthlyPrice)}
                </span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </>
            )}
          </div>
          {service.route && (
            <Link
              href={service.route}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Preview
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CategorySection({
  category,
  services,
  selectedServices,
  onToggle,
}: {
  category: ServiceCategory;
  services: ServiceDefinition[];
  selectedServices: ServiceId[];
  onToggle: (id: ServiceId) => void;
}) {
  const categoryMeta = SERVICE_CATEGORIES[category];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{categoryMeta.name}</h3>
        <p className="text-sm text-muted-foreground">{categoryMeta.description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedServices.includes(service.id)}
            onToggle={() => onToggle(service.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PricingSummary({
  selectedServices,
  onContinue,
}: {
  selectedServices: ServiceId[];
  onContinue: () => void;
}) {
  const services = getServicesByIds(selectedServices);
  const pricing = calculateCustomPlanPrice(selectedServices);

  if (selectedServices.length === 0) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">You haven&apos;t selected any services yet.</p>
            <p className="text-xs mt-1">Browse the services and toggle the ones you need.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Your Plan
        </CardTitle>
        <CardDescription>
          {pricing.serviceCount} service{pricing.serviceCount !== 1 ? "s" : ""} selected
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between text-sm py-1"
            >
              <span className="truncate">{service.name}</span>
              <span className="text-muted-foreground ml-2">
                {service.baseMonthlyPrice === 0
                  ? "Free"
                  : formatPrice(service.baseMonthlyPrice)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(pricing.baseTotal)}</span>
          </div>

          {pricing.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Multi-service discount ({pricing.discountPercentage}%)
              </span>
              <span>-{formatPrice(pricing.discount)}</span>
            </div>
          )}

          {pricing.discountPercentage === 0 && pricing.serviceCount < 4 && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 Add {4 - pricing.serviceCount} more service{4 - pricing.serviceCount !== 1 ? "s" : ""} to unlock a 10% discount!
            </p>
          )}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total / month</span>
            <span className="text-lg">{formatPrice(pricing.finalTotal)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={onContinue}>
          Continue with Custom Plan
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function PricingPage() {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceId[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setDemoServices, activeServices, initializeSubscription, isDemoMode } = useSubscription();
  const { toast } = useToast();
  const router = useRouter();

  const servicesByCategory = getServicesGroupedByCategory();
  const categoryOrder: ServiceCategory[] = ["core", "sales_and_customers", "operations", "advanced"];

  // Check if Paystack is configured
  const isPaystackConfigured = !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const handleBundleSelect = async (bundleId: string) => {
    setSelectedBundle(bundleId);
    setIsProcessing(true);
    
    // Get bundle services
    const bundle = getBundleById(bundleId);
    if (!bundle) {
      toast({
        title: "Error",
        description: "Invalid plan selected",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // Try real payment if Paystack is configured
    if (isPaystackConfigured) {
      const result = await initializeSubscription('bundle', bundleId);
      
      if (result.success && result.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = result.authorizationUrl;
        return;
      } else if (result.error) {
        console.error('Payment initialization failed:', result.error);
        // Fall back to demo mode
      }
    }

    // Demo mode fallback
    setDemoServices(bundle.services);
    toast({
      title: `${bundle.name} Plan Activated!`,
      description: `You now have access to ${bundle.services.length} services. (Demo Mode)`,
    });
    
    setIsProcessing(false);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleServiceToggle = (serviceId: ServiceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCustomPlanContinue = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "No services selected",
        description: "Please select at least one service to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Try real payment if Paystack is configured
    if (isPaystackConfigured) {
      const result = await initializeSubscription('custom', undefined, selectedServices);
      
      if (result.success && result.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = result.authorizationUrl;
        return;
      } else if (result.error) {
        console.error('Payment initialization failed:', result.error);
        // Fall back to demo mode
      }
    }

    // Demo mode fallback
    setDemoServices(selectedServices);
    toast({
      title: "Custom Plan Activated!",
      description: `You now have access to ${selectedServices.length} services. (Demo Mode)`,
    });
    
    setIsProcessing(false);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Flexible Pricing
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Choose your TradaHub plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Pick a ready-made package to get started quickly, or build your own
              custom toolkit with only the services you need.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="packages" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Packages
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Build Your Own
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {BUNDLES.map((bundle) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  isSelected={selectedBundle === bundle.id}
                  onSelect={() => handleBundleSelect(bundle.id)}
                />
              ))}
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Not sure which plan is right for you?
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact">Talk to our team</Link>
              </Button>
            </div>
          </TabsContent>

          {/* Build Your Own Tab */}
          <TabsContent value="custom">
            <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
              {/* Services List */}
              <div className="space-y-8">
                {categoryOrder.map((category) => {
                  const services = servicesByCategory[category];
                  if (!services || services.length === 0) return null;
                  return (
                    <CategorySection
                      key={category}
                      category={category}
                      services={services}
                      selectedServices={selectedServices}
                      onToggle={handleServiceToggle}
                    />
                  );
                })}
              </div>

              {/* Summary Sidebar */}
              <div className="lg:order-last order-first">
                <PricingSummary
                  selectedServices={selectedServices}
                  onContinue={handleCustomPlanContinue}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* FAQ/Help Section */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Need help choosing?</h2>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you find the perfect plan for your business.
              All plans include free setup, training, and 24/7 support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
