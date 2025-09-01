import axios from 'axios';

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
    const base = ((import.meta as any).env?.VITE_API_BASE as string | undefined) || 'http://82.29.56.105:2399'
    const api = base.replace(/\/$/, '') + '/send-report'
    const response = await axios.post(api, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error("Erro ao enviar relatório: " + error.message);
  }
}
