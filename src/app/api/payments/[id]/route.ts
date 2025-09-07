import { NextResponse } from "next/server";
import { PaymentStore } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const rec = PaymentStore.get(params.id);
  if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rec);
}
