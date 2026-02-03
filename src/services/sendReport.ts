import { api } from "@/services/api";

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

export const sendReport = async (payload: ReportPayload) => {
  try {
    const base = ((import.meta as any).env?.VITE_API_BASE as string | undefined) || "http://82.29.56.105:2399";
    const endpoint = base.replace(/\/$/, "") + "/send-report";
    const response = await api.post(endpoint, payload, {
      withCredentials: false,
      headers: { "Content-Type": "application/json", "X-Skip-Auth": true },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Erro ao enviar relatório: " + error.message);
  }
}
