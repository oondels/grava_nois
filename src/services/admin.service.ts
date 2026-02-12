import { api } from "@/services/api";
import type { ApiResponse } from "@/types/Api";

export type DashboardStats = {
  totalUsers: { active: number; inactive: number };
  totalClients: number;
  totalVenues: { online: number; offline: number };
  totalVideos: number;
  dashboard?: {
    totalUsers: { active: number; inactive: number };
    totalClients: number;
    totalVenues: { online: number; offline: number };
    totalVideos: number;
  }
};

export type AdminUser = {
  id: string;
  email: string;
  role?: string;
  isActive?: boolean;
  name?: string | null;
  username?: string | null;
  [key: string]: unknown;
};

export type AdminClient = {
  id: string;
  legalName?: string | null;
  tradeName?: string | null;
  responsibleName?: string | null;
  responsibleEmail?: string | null;
  responsiblePhone?: string | null;
  retentionDays?: number | null;
  venueCount?: number;
  generalStatus?: "ok" | "attention" | string;
  [key: string]: unknown;
};

export type AdminVenue = {
  id?: string;
  name?: string | null;
  venueName?: string | null;
  paymentStatus?: string | null;
  isOnline?: boolean;
  client?: AdminClient | null;
  [key: string]: unknown;
  venues?: AdminVenue[];
};

export type UsersList = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

export type ClientsList = {
  clients: AdminClient[];
  total: number;
  page: number;
  limit: number;
};

export type ListParams = Record<string, unknown>;

export type UsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
};

export type ClientsQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export type VenuesQuery = {
  paymentStatus?: "none" | "active" | "past_due" | "canceled";
  installationStatus?: "active" | "paused" | "decommissioned";
  isOnline?: boolean | "true" | "false";
  active?: boolean | "true" | "false";
};

export type UpdateUserPayload = {
  isActive?: boolean;
  role?: string;
  name?: string;
  username?: string | null;
};

export type UpdateClientPayload = {
  legalName?: string;
  tradeName?: string | null;
  responsibleName?: string | null;
  responsibleEmail?: string | null;
  responsiblePhone?: string | null;
  retentionDays?: number;
};

export type UpdateUserResponse = {
  user: AdminUser;
};

export type UpdateClientResponse = {
  client: AdminClient;
};

async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<ApiResponse<DashboardStats>>("/admin/dashboard");
  return response.data.data;
}

async function getUsers(params?: UsersQuery): Promise<UsersList> {
  const response = await api.get<ApiResponse<UsersList>>("/admin/users", { params });
  const payload = response.data.data;
  const meta = response.data.meta;

  return {
    users: payload?.users ?? [],
    total: payload?.total ?? meta?.total ?? 0,
    page: payload?.page ?? meta?.page ?? params?.page ?? 1,
    limit: payload?.limit ?? meta?.limit ?? params?.limit ?? 20,
  };
}

async function getClients(params?: ClientsQuery): Promise<ClientsList> {
  const response = await api.get<ApiResponse<ClientsList>>("/admin/clients", { params });
  const payload = response.data.data;
  const meta = response.data.meta;

  return {
    clients: payload?.clients ?? [],
    total: payload?.total ?? meta?.total ?? 0,
    page: payload?.page ?? meta?.page ?? params?.page ?? 1,
    limit: payload?.limit ?? meta?.limit ?? params?.limit ?? 20,
  };
}

async function getVenues(params?: VenuesQuery): Promise<AdminVenue[]> {
  const response = await api.get<ApiResponse<AdminVenue[] | { venues?: AdminVenue[] }>>("/admin/venues", { params });
  const data = response?.data?.data;
  const payload = Array.isArray(data) ? data : data?.venues;

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload ?? [];
}

async function updateUser(id: string, payload: UpdateUserPayload): Promise<UpdateUserResponse> {
  const response = await api.patch<ApiResponse<UpdateUserResponse>>(`/admin/users/${id}`, payload);
  return response.data.data;
}

async function updateClient(id: string, payload: UpdateClientPayload): Promise<UpdateClientResponse> {
  const response = await api.patch<ApiResponse<UpdateClientResponse>>(`/admin/clients/${id}`, payload);
  return response.data.data;
}

export const adminService = {
  getDashboardStats,
  getUsers,
  getClients,
  getVenues,
  updateUser,
  updateClient,
};
