import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean; _skipRefresh?: boolean };
type FailedQueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
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

export function setupInterceptors(store: any, router: any) {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryRequestConfig | undefined;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      const requestUrl = originalRequest.url || "";
      if (originalRequest._skipRefresh || hasSkipAuthHeader(originalRequest) || requestUrl.includes("/auth/refresh")) {
        return Promise.reject(error);
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
          processQueue(refreshError, null);
          try {
            await store?.logout?.();
          } finally {
            router?.push?.("/login");
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
