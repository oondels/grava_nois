import { api } from "@/services/api";
import type { ApiResponse } from "@/types/Api";

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

async function getDashboardStats(): Promise<ClientDashboardStats> {
  const response = await api.get<ApiResponse<ClientDashboardStats>>("/api/clients/me/stats");
  return response.data.data;
}

async function getSubscriptionStatus(): Promise<ClientSubscriptionStatus> {
  throw new Error("Not implemented");
}

async function getInvoices(): Promise<ClientInvoice[]> {
  throw new Error("Not implemented");
}

export const clientPortalService = {
  getDashboardStats,
  getSubscriptionStatus,
  getInvoices,
};
