import QRCode from "qrcode";
import { PaymentStore } from "@/lib/store";

export async function createPayment(amount: number) {
  const id = `pay_${Math.random().toString(36).slice(2, 10)}`;
  const reference = `TT-${Date.now().toString().slice(-6)}`;

  const record = PaymentStore.put({
    id, amount, reference, status: "pending", createdAt: Date.now(),
  });

  const payload = JSON.stringify({ provider: "MOCK", id, amount, reference });
  const qrDataUrl = await QRCode.toDataURL(payload);

  const auto = Number(process.env.PAYMENT_AUTO_SETTLE_SECONDS || 0);
  if (auto > 0) {
    setTimeout(async () => {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/webhooks/mock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "payment.success", data: { id, reference, amount } }),
      }).catch(() => {});
    }, auto * 1000);
  }

  return { id, reference, qrDataUrl, amount, status: record.status };
}

export function parseWebhook(body: any) {
  if (body?.event === "payment.success" && body?.data?.id) {
    return { type: "success", id: body.data.id };
  }
  if (body?.event === "payment.failed" && body?.data?.id) {
    return { type: "failed", id: body.data.id };
  }
  return { type: "unknown" as const, id: null };
}
