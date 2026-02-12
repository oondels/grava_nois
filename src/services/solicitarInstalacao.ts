import { api } from "@/services/api";
import type { ApiResponse } from "@/types/Api";

export type SolicitarInstalacaoResult = Record<string, unknown>;

export const solicitarInstalacao = async (form: Record<string, any>): Promise<SolicitarInstalacaoResult> => {
  try {
    const response = await api.post<ApiResponse<SolicitarInstalacaoResult>>("/notifications/contact", form, {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        "X-Skip-Auth": true,
      },
    });

    console.log("Dados enviados:", form);
    return response.data.data;
  } catch (error: any) {
    throw new Error("Erro ao solicitar instalação: " + error.message);
  }
};
