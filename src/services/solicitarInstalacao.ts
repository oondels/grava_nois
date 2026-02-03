import { api } from "@/services/api";

export const solicitarInstalacao = async (form: Record<string, any>) => {
  try {
    const response = await api.post("http://82.29.56.105:2399/send-email", form, {
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
