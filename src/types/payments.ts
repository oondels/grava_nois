export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "canceled";

export type PaymentProvider =
  | "stripe"
  | "mercado_pago"
  | "abacate_pay"
  | "manual";

export type PaymentMethod =
  | "card"
  | "pix"
  | "boleto"
  | "cash";

export interface PaymentListItem {
  id: string;
  chargedAt: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paidAt?: string | null;
  dueAt?: string | null;
  provider: PaymentProvider;
  method?: PaymentMethod | null;
  description?: string | null;
  providerPaymentId?: string | null;
  paymentUrl?: string | null;
}

export interface PaymentListResponse {
  items: PaymentListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ClientPaymentsQuery {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  provider?: PaymentProvider;
  from?: string;
  to?: string;
}

export type PaymentFilterValue<T extends string> = T | "";

export interface ClientPaymentsFilters {
  status: PaymentFilterValue<PaymentStatus>;
  provider: PaymentFilterValue<PaymentProvider>;
  from: string;
  to: string;
}
