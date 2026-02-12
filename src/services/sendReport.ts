import { api } from "@/services/api";
import type { ApiResponse } from "@/types/Api";

export type ReportPayload = {
  name?: string;
  email?: string;
  page?: string;
  title?: string;
  description: string;
  steps?: string;
  severity?: 'Baixa' | 'Média' | 'Alta';
  userAgent?: string;
  url?: string;
};

export type SendReportResult = Record<string, unknown>;

export const sendReport = async (payload: ReportPayload): Promise<SendReportResult> => {
  try {
    const response = await api.post<ApiResponse<SendReportResult>>("/notifications/report", payload, {
      withCredentials: false,
      headers: { "Content-Type": "application/json", "X-Skip-Auth": true },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error("Erro ao enviar relatório: " + error.message);
  }
};
