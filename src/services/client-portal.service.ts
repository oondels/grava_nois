import { api } from "@/services/api";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  requestId?: string;
  message?: string;
};

export type ClientDashboardStats = {
  totalVideos: number;
  totalLinkedUsers: number;
  storageUsed: string;
};

async function getDashboardStats(): Promise<ApiResponse<ClientDashboardStats>> {
  const { data } = await api.get<ApiResponse<ClientDashboardStats>>("/api/clients/me/stats");
  return data;
}

export const clientPortalService = {
  getDashboardStats,
};
