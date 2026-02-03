import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean; _skipRefresh?: boolean };

export function setupInterceptors(store: any, router: any) {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const headers = config.headers ?? {};
    const skipAuth = Boolean((headers as any)["X-Skip-Auth"]);
    if (skipAuth) {
      (config as RetryRequestConfig)._skipRefresh = true;
      const deleteHeader = (headers as any).delete;
      if (typeof deleteHeader === "function") {
        deleteHeader.call(headers, "X-Skip-Auth");
      } else {
        delete (headers as any)["X-Skip-Auth"];
      }
      config.headers = headers;
      return config;
    }

    const token = store?.token;
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
    config.headers = headers;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryRequestConfig | undefined;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      const requestUrl = originalRequest.url || "";
      if (originalRequest._skipRefresh || requestUrl.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await api.post<{ accessToken: string }>("/auth/refresh");
          const accessToken = refreshResponse.data.accessToken;

          store.setToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          store.logout();
          router.push("/login");
          return Promise.reject(new Error("Sessao expirada"));
        }
      }

      return Promise.reject(error);
    }
  );
}
