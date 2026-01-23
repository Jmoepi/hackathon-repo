import { NextRequest, NextResponse } from "next/server";
import { PaymentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { getPaymentRequestStatus } from "@/lib/payments/stitch";

export async function GET(
  _req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // First check in-memory store (for mock payments)
  const rec = PaymentStore.get(id);
  if (rec) {
    return NextResponse.json(rec);
  }

  // Check database for Stitch payments
  try {
    const supabase = await createClient();
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("stitch_payment_id", id)
      .single();

    if (payment) {
      return NextResponse.json({
        id: payment.stitch_payment_id,
        reference: payment.order_reference,
        amount: payment.amount_cents,
        status: payment.status,
        createdAt: payment.created_at,
        completedAt: payment.completed_at,
      });
    }

    // If not in DB, try to get status directly from Stitch
    const stitchStatus = await getPaymentRequestStatus(id);
    if (stitchStatus) {
      const statusMap: Record<string, string> = {
        "PaymentInitiationRequestCompleted": "completed",
        "PaymentInitiationRequestCancelled": "cancelled",
        "PaymentInitiationRequestExpired": "failed",
        "PaymentInitiationRequestPending": "pending",
      };
      
      return NextResponse.json({
        id: stitchStatus.id,
        reference: stitchStatus.beneficiaryReference,
        amount: parseFloat(stitchStatus.amount.quantity) * 100,
        status: statusMap[stitchStatus.status.__typename] || "pending",
        createdAt: stitchStatus.created,
      });
    }
  } catch (error) {
    console.error("Error fetching payment status:", error);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
