"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

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

export default function QrCodeDialog({
  isOpen,
  onOpenChange,
  products,
  total,
}: QrCodeDialogProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const { toast } = useToast();

  // Generate QR code when dialog opens or items change
  useEffect(() => {
    if (!isOpen || products.length === 0) return;

    setPaymentConfirmed(false);

    const payload = JSON.stringify({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
      total,
      timestamp: Date.now(),
    });

    QRCode.toDataURL(
      payload,
      { width: 256, margin: 2 },
      (err: unknown, url?: string) => {
        if (!err && url) setQrUrl(url);
      }
    );
  }, [isOpen, products, total]);

  // Mock payment confirmation after 8 seconds
  useEffect(() => {
    if (!isOpen || products.length === 0) return;

    setPaymentConfirmed(false);
    const timer = setTimeout(() => {
      setPaymentConfirmed(true);
      toast({
        title: "Payment Received!",
        description: `Successfully received R${total.toFixed(2)} for selected products.`,
        variant: "default",
        className: "bg-primary text-primary-foreground border-primary",
      });
      onOpenChange(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [isOpen, products, total, onOpenChange, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Payment Request</DialogTitle>
          <DialogDescription asChild>
            <div>
              Ask your customer to scan the QR code to pay{" "}
              <span className="font-bold">R{total.toFixed(2)}</span> for:
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
            {qrUrl ? (
              <img src={qrUrl} alt="Payment QR" className="h-48 w-48" />
            ) : (
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            )}
          </div>

          {!paymentConfirmed ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waiting for payment confirmation...</span>
            </div>
          ) : (
            <div className="text-green-600 font-bold">Payment Confirmed!</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
