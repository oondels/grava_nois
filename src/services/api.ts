import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorDetail, ApiResponse } from "@/types/Api";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

// Cliente para endpoints que não devem disparar refresh automático em 401.
export const apiNoRefresh = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean; _skipRefresh?: boolean };
type FailedQueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};
type ApiEnvelopeErrorPayload = Partial<ApiResponse<unknown>> & {
  error?: Partial<ApiErrorDetail> & { message?: unknown };
};

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
      return;
    }

    promise.resolve(token);
  });
  failedQueue = [];
};

const hasSkipAuthHeader = (config: RetryRequestConfig) => {
  const headers = config.headers as any;
  if (!headers) {
    return false;
  }

  if (typeof headers.get === "function") {
    const value = headers.get("X-Skip-Auth") ?? headers.get("x-skip-auth");
    return value === true || value === "true" || value === "1";
  }

  const value = headers["X-Skip-Auth"] ?? headers["x-skip-auth"];
  return value === true || value === "true" || value === 1 || value === "1";
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const getApiErrorMessage = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) {
    return undefined;
  }

  const envelope = payload as ApiEnvelopeErrorPayload;
  if (typeof envelope.message === "string" && envelope.message.trim()) {
    return envelope.message;
  }

  if (!isRecord(envelope.error)) {
    return undefined;
  }

  if (typeof envelope.error.message === "string" && envelope.error.message.trim()) {
    return envelope.error.message;
  }

  if (typeof envelope.error.code === "string" && envelope.error.code.trim()) {
    return envelope.error.code;
  }

  return undefined;
};

const enrichAxiosErrorMessage = <T>(error: T): T => {
  if (!axios.isAxiosError(error)) {
    return error;
  }

  const serverMessage = getApiErrorMessage(error.response?.data);
  if (serverMessage) {
    error.message = serverMessage;
  }

  return error;
};

export function setupInterceptors(store: any, router: any) {
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiResponse<unknown>>) => {
      const originalRequest = error.config as RetryRequestConfig | undefined;
      if (!originalRequest) {
        return Promise.reject(enrichAxiosErrorMessage(error));
      }

      const requestUrl = originalRequest.url || "";
      if (originalRequest._skipRefresh || hasSkipAuthHeader(originalRequest) || requestUrl.includes("/auth/refresh")) {
        return Promise.reject(enrichAxiosErrorMessage(error));
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: () => {
                resolve(api(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await api.post("/auth/refresh", {}, { _skipRefresh: true } as any);
          processQueue(null, null);
          return api(originalRequest);
        } catch (refreshError) {
          const normalizedRefreshError = enrichAxiosErrorMessage(refreshError);
          processQueue(normalizedRefreshError, null);
          // skipApi=true: apenas limpa estado local, sem cascata de requests
          try {
            await store?.logout?.(true);
          } catch { /* ignora erro no logout */ }

          // Só redireciona se o app já inicializou (evita conflito com navegação inicial)
          if (store?.isReady || store?.isReady?.value) {
            router?.push?.("/login");
          }

          return Promise.reject(normalizedRefreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(enrichAxiosErrorMessage(error));
    }
  );
}
