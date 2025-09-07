import { NextResponse } from "next/server";
import { Payments } from "@/lib/payments";

export async function POST(req: Request) {
  const { amount } = await req.json().catch(() => ({}));
  if (!amount || isNaN(amount)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  const payment = await Payments.create(Number(amount));
  return NextResponse.json(payment);
}
