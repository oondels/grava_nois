import { api } from "@/services/api";
import type { ApiResponse } from "@/types/Api";

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

async function getMyProfile(): Promise<ClientProfile> {
  const response = await api.get<ApiResponse<ClientProfile>>("/client/profile");
  return response.data.data;
}

async function updateProfile(payload: ClientProfileUpdate): Promise<ClientProfile> {
  const response = await api.patch<ApiResponse<ClientProfile>>("/client/profile", payload);
  return response.data.data;
}

export const clientService = {
  getMyProfile,
  updateProfile,
};
