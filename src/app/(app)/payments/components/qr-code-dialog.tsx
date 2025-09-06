"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

type QrCodeDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  amount: number;
};

export default function QrCodeDialog({ isOpen, onOpenChange, amount }: QrCodeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Payment Request</DialogTitle>
          <DialogDescription>
            Ask your customer to scan the QR code to pay R{amount.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="rounded-lg border bg-white p-4 shadow-md">
                <svg width="200" height="200" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-48 w-48">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 0H13V13H0V0ZM3 3H10V10H3V3Z" fill="black"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M20 0H33V13H20V0ZM23 3H30V10H23V3Z" fill="black"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 20H13V33H0V20ZM3 23H10V30H3V23Z" fill="black"/>
                    <path d="M20 20H23V23H20V20Z" fill="black"/>
                    <path d="M23 20H26V23H23V20Z" fill="black"/>
                    <path d="M26 20H29V23H26V20Z" fill="black"/>
                    <path d="M29 20H32V23H29V20Z" fill="black"/>
                    <path d="M20 23H23V26H20V23Z" fill="black"/>
                    <path d="M26 23H29V26H26V23Z" fill="black"/>
                    <path d="M29 23H32V26H29V23Z" fill="black"/>
                    <path d="M20 26H23V29H20V26Z" fill="black"/>
                    <path d="M23 26H26V29H23V26Z" fill="black"/>
                    <path d="M26 26H29V29H26V26Z" fill="black"/>
                    <path d="M20 29H23V32H20V29Z" fill="black"/>
                    <path d="M23 29H26V32H23V29Z" fill="black"/>
                    <path d="M29 29H32V32H29V29Z" fill="black"/>
                </svg>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for payment confirmation...</span>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
