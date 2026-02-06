import { api } from "@/services/api";

export const solicitarInstalacao = async (form: Record<string, any>) => {
  try {
    const response = await api.post("/notifications/contact", form, {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        "X-Skip-Auth": true,
      },
    });

    console.log("Dados enviados:", form);
    return response.data
  } catch (error: any) {
    throw new Error("Erro ao solicitar instalação: " + error.message);
  }
}
