"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useShop } from "@/context/ShopContext";

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type QrCodeDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  products: Product[];
  total: number;
};

type PaymentResponse = {
  id: string;
  reference: string;
  qrDataUrl: string;
  paymentUrl?: string;
  amount: number;
  status: string;
  isTestMode: boolean;
};

export default function QrCodeDialog({
  isOpen,
  onOpenChange,
  products,
  total,
}: QrCodeDialogProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sellProduct, shop } = useShop();

  // Create payment when dialog opens
  const createPayment = useCallback(async () => {
    if (!isOpen || products.length === 0) return;

    setIsLoading(true);
    setPaymentConfirmed(false);
    setQrUrl("");
    setPaymentUrl("");
    setPaymentId("");

    try {
      // Convert total to cents
      const amountCents = Math.round(total * 100);
      
      // Generate order reference
      const orderReference = `ORD-${Date.now().toString().slice(-6)}`;

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountCents,
          orderReference,
          shopId: shop?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment");
      }

      const payment: PaymentResponse = await response.json();
      
      setQrUrl(payment.qrDataUrl);
      setPaymentUrl(payment.paymentUrl || "");
      setPaymentId(payment.id);
      setIsTestMode(payment.isTestMode);
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, products, total, shop, toast]);

  useEffect(() => {
    createPayment();
  }, [createPayment]);

  // Poll for payment status (for both test and real mode)
  useEffect(() => {
    if (!isOpen || !paymentId || paymentConfirmed) return;

    // In test mode, auto-confirm after 8 seconds
    if (isTestMode) {
      const timer = setTimeout(() => {
        setPaymentConfirmed(true);
        // Record each product sale as a transaction
        products.forEach((p) => {
          sellProduct(p.id, p.price * p.quantity);
        });
        toast({
          title: "Payment Received!",
          description: `Successfully received R${total.toFixed(2)} for selected products.`,
          variant: "default",
          className: "bg-primary text-primary-foreground border-primary",
        });
        onOpenChange(false);
      }, 8000);

      return () => clearTimeout(timer);
    }

    // In real mode, poll for status
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "completed") {
            setPaymentConfirmed(true);
            clearInterval(pollInterval);
            
            // Record sales
            products.forEach((p) => {
              sellProduct(p.id, p.price * p.quantity);
            });
            
            toast({
              title: "Payment Received!",
              description: `Successfully received R${total.toFixed(2)} for selected products.`,
              variant: "default",
              className: "bg-primary text-primary-foreground border-primary",
            });
            
            // Close dialog after short delay
            setTimeout(() => onOpenChange(false), 2000);
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [isOpen, paymentId, paymentConfirmed, isTestMode, products, total, sellProduct, toast, onOpenChange]);

  // Open payment URL in new tab
  const handlePaymentClick = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Payment Request</DialogTitle>
          <DialogDescription asChild>
            <div>
              {isTestMode ? (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  Test Mode
                </span>
              ) : (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Live Payment
                </span>
              )}
              <p className="mt-2">
                Customer pays{" "}
                <span className="font-bold">R{total.toFixed(2)}</span> for:
              </p>
              <ul className="mt-2 ml-4 text-sm list-disc">
                {products.map((p) => (
                  <li key={p.id}>
                    {p.name}{" "}
                    <span className="text-muted-foreground">
                      (R{p.price.toFixed(2)})
                    </span>
                    {p.quantity > 1 && (
                      <span className="ml-2 text-xs text-primary">
                        x{p.quantity}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="rounded-lg border bg-white p-4 shadow-md">
            {isLoading ? (
              <div className="h-48 w-48 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : qrUrl ? (
              <img src={qrUrl} alt="Payment QR" className="h-48 w-48" />
            ) : (
              <div className="h-48 w-48 flex items-center justify-center text-muted-foreground">
                Unable to generate QR
              </div>
            )}
          </div>

          {paymentConfirmed ? (
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              Payment Confirmed!
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for payment confirmation...</span>
              </div>
              
              {paymentUrl && !isTestMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePaymentClick}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Payment Link
                </Button>
              )}
              
              {isTestMode && (
                <p className="text-xs text-muted-foreground text-center">
                  In test mode, payment auto-confirms in a few seconds.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
