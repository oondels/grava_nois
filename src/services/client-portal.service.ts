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

export type ClientSubscriptionStatus = {
  status: "active" | "pending" | "past_due" | "canceled";
  planName?: string | null;
  nextBillingDate?: string | null;
};

export type ClientInvoice = {
  date: string;
  amount: number;
  reference: string;
  status: "paid" | "pending";
};

async function getDashboardStats(): Promise<ApiResponse<ClientDashboardStats>> {
  const { data } = await api.get<ApiResponse<ClientDashboardStats>>("/api/clients/me/stats");
  return data;
}

async function getSubscriptionStatus(): Promise<ApiResponse<ClientSubscriptionStatus>> {
  throw new Error("Not implemented");
}

async function getInvoices(): Promise<ApiResponse<ClientInvoice[]>> {
  throw new Error("Not implemented");
}

export const clientPortalService = {
  getDashboardStats,
  getSubscriptionStatus,
  getInvoices,
};
