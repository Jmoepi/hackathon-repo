
import * as Mock from "./mock";
import * as Paystack from "./paystack";

const provider = process.env.PROVIDER_PAYMENTS || "MOCK";

export const Payments = {
  create:
    provider === "PAYSTACK"
      ? Paystack.createPayment
      : Mock.createPayment,
};

export type CreatePaymentResponse =
  | Awaited<ReturnType<typeof Mock.createPayment>>
  | Awaited<ReturnType<typeof Paystack.createPayment>>;
