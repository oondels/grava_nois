import { api } from "@/services/api";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  requestId?: string;
  message?: string;
};

export type DashboardStats = {
  totalUsers: { active: number; inactive: number };
  totalClients: number;
  totalVenues: { online: number; offline: number };
  totalVideos: number;
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
  success: boolean;
  message: string;
  user: AdminUser;
  requestId?: string;
};

export type UpdateClientResponse = {
  success: boolean;
  message: string;
  client: AdminClient;
  requestId?: string;
};

async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const { data } = await api.get<ApiResponse<DashboardStats>>("/admin/dashboard");
  return data;
}

async function getUsers(params?: UsersQuery) {
  const { data } = await api.get<ApiResponse<UsersList>>("/admin/users", { params });
  return data;
}

async function getClients(params?: ClientsQuery) {
  const { data } = await api.get<ApiResponse<ClientsList>>("/admin/clients", { params });
  return data;
}

async function getVenues(params?: VenuesQuery) {
  const { data } = await api.get<ApiResponse<AdminVenue[]>>("/admin/venues", { params });
  return data;
}

async function updateUser(id: string, payload: UpdateUserPayload) {
  const { data } = await api.patch<UpdateUserResponse>(`/admin/users/${id}`, payload);
  return data;
}

async function updateClient(id: string, payload: UpdateClientPayload) {
  const { data } = await api.patch<UpdateClientResponse>(`/admin/clients/${id}`, payload);
  return data;
}

export const adminService = {
  getDashboardStats,
  getUsers,
  getClients,
  getVenues,
  updateUser,
  updateClient,
};
