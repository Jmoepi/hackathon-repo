export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";
export type PaymentRecord = {
  id: string;
  amount: number;
  reference: string;
  status: PaymentStatus;
  createdAt: number;
};

const payments = new Map<string, PaymentRecord>();

export const PaymentStore = {
  put(p: PaymentRecord) { payments.set(p.id, p); return p; },
  get(id: string) { return payments.get(id) || null; },
  setStatus(id: string, status: PaymentStatus) {
    const rec = payments.get(id);
    if (!rec) return null;
    rec.status = status;
    payments.set(id, rec);
    return rec;
  },
};
