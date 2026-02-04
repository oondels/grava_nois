import { api } from "@/services/api";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  requestId?: string;
  message?: string;
};

export type ClientProfile = {
  id?: string;
  legalName?: string | null;
  tradeName?: string | null;
  document?: string | null;
  cnpjCpf?: string | null;
  responsibleName?: string | null;
  responsibleEmail?: string | null;
  responsiblePhone?: string | null;
};

export type ClientProfileUpdate = {
  tradeName?: string | null;
  responsibleName?: string | null;
  responsibleEmail?: string | null;
  responsiblePhone?: string | null;
};

async function getMyProfile(): Promise<ApiResponse<ClientProfile>> {
  const { data } = await api.get<ApiResponse<ClientProfile>>("/client/profile");
  return data;
}

async function updateProfile(payload: ClientProfileUpdate): Promise<ApiResponse<ClientProfile>> {
  const { data } = await api.patch<ApiResponse<ClientProfile>>("/client/profile", payload);
  return data;
}

export const clientService = {
  getMyProfile,
  updateProfile,
};
