import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorDetail, ApiResponse } from "@/types/Api";

export const api = axios.create({
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
    const value = headers.get("X-Skip-Auth");
    return value === true || value === "true" || value === "1";
  }

  const value = headers["X-Skip-Auth"];
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
          try {
            await store?.logout?.();
          } finally {
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
