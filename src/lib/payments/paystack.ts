import axios from "axios";
import QRCode from "qrcode";
import { PaymentStore } from "@/lib/store";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = "https://api.paystack.co";

export async function createPayment(amount: number) {
  // Convert amount to kobo (Paystack expects NGN in kobo)
  const koboAmount = Math.round(amount * 100);
  const reference = `TT-${Date.now().toString().slice(-6)}`;

  // Initiate transaction
  const res = await axios.post(
    `${BASE_URL}/transaction/initialize`,
    {
      amount: koboAmount,
      email: `demo+${reference}@example.com`, // Use a dummy email for demo
      reference,
      channels: ["qr"],
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const { data } = res.data;
  // Store payment record locally for status polling
  const id = data.reference;
  PaymentStore.put({
    id,
    amount,
    reference,
    status: "pending",
    createdAt: Date.now(),
  });

  // Generate QR code for the payment URL
  const qrDataUrl = await QRCode.toDataURL(data.authorization_url);

  return {
    id,
    reference,
    qrDataUrl,
    amount,
    status: "pending",
    paystack: data,
  };
}

export function parseWebhook(body: any) {
  // Paystack sends event type and reference
  if (body?.event === "charge.success" && body?.data?.reference) {
    return { type: "success", id: body.data.reference };
  }
  if (body?.event === "charge.failed" && body?.data?.reference) {
    return { type: "failed", id: body.data.reference };
  }
  return { type: "unknown" as const, id: null };
}
