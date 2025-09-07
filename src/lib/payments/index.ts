import * as Mock from "./mock";

export const Payments = {
  create: Mock.createPayment,
};

export type CreatePaymentResponse = Awaited<ReturnType<typeof Mock.createPayment>>;
