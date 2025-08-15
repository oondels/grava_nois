import axios from 'axios';

export const solicitarInstalacao = async (form: Record<string, any>) => {
  try {
    const response = await axios.post("http://localhost:3000/send-email", form, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Dados enviados:", form);
    return response.data
  } catch (error: any) {
    throw new Error("Erro ao solicitar instalação: " + error.message);
  }
}