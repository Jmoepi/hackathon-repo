import { NextResponse } from "next/server";
import { PaymentStore } from "@/lib/store";
import { parseWebhook } from "@/lib/payments/paystack";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = parseWebhook(body);

  if (parsed.type === "success" && parsed.id) {
    PaymentStore.setStatus(parsed.id, "success");
    return NextResponse.json({ ok: true });
  }
  if (parsed.type === "failed" && parsed.id) {
    PaymentStore.setStatus(parsed.id, "failed");
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, reason: "unknown_event" }, { status: 400 });
}
