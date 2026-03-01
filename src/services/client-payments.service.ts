import { api } from "@/services/api";
import type { ApiResponse } from "@/types/Api";
import type { ClientPaymentsQuery, PaymentListResponse } from "@/types/payments";

type PaymentListApiPayload = ApiResponse<{ invoices?: PaymentListResponse }>;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const toPositiveInt = (value: unknown, fallback: number): number => {
  if (!isNumber(value)) {
    return fallback;
  }

  const parsed = Math.floor(value);
  return parsed > 0 ? parsed : fallback;
};

const isPaymentListResponse = (value: unknown): value is PaymentListResponse => {
  if (!isRecord(value)) {
    return false;
  }

  const { items, total, page, limit } = value;
  return Array.isArray(items) && isNumber(total) && isNumber(page) && isNumber(limit);
};

const isApiResponseEnvelope = (value: unknown): value is PaymentListApiPayload => {
  if (!isRecord(value)) {
    return false;
  }

  return "success" in value && "data" in value;
};

const normalize = (
  payload: PaymentListResponse,
  fallbackPage: number,
  fallbackLimit: number
): PaymentListResponse => {
  return {
    items: Array.isArray(payload.items) ? payload.items : [],
    total: isNumber(payload.total) ? payload.total : 0,
    page: toPositiveInt(payload.page, fallbackPage),
    limit: toPositiveInt(payload.limit, fallbackLimit),
  };
};

async function list(params: ClientPaymentsQuery = {}): Promise<PaymentListResponse> {
  const requestedPage = toPositiveInt(params.page, DEFAULT_PAGE);
  const requestedLimit = toPositiveInt(params.limit, DEFAULT_LIMIT);

  const response = await api.get<PaymentListResponse | PaymentListApiPayload>("/api/clients/payments", {
    params,
  });

  const payload = response.data;

  if (isPaymentListResponse(payload)) {
    return normalize(payload, requestedPage, requestedLimit);
  }

  if (isApiResponseEnvelope(payload) && isPaymentListResponse(payload.data?.invoices)) {
    return normalize(payload.data.invoices, requestedPage, requestedLimit);
  }

  throw new Error("Não foi possível interpretar a resposta de pagamentos.");
}

export const clientPaymentsService = {
  list,
};
