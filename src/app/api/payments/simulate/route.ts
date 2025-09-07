import { NextResponse } from "next/server";
import { PaymentStore } from "@/lib/store";

export async function POST(req: Request) {
  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !["success", "failed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const rec = PaymentStore.setStatus(id, status);
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rec);
}
