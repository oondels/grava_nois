export type ViaCepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento: string;
};

type ViaCepPayload = Partial<ViaCepAddress> & {
  erro?: boolean;
};

function sanitizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function fetchViaCepAddress(rawCep: string): Promise<ViaCepAddress | null> {
  const cep = rawCep.replace(/\D/g, "");
  if (cep.length !== 8) return null;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`ViaCEP respondeu com status ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") {
      throw new Error("Resposta inválida do ViaCEP");
    }

    const data = payload as ViaCepPayload;
    if (data.erro) return null;

    return {
      cep: sanitizeString(data.cep) || cep,
      logradouro: sanitizeString(data.logradouro),
      bairro: sanitizeString(data.bairro),
      localidade: sanitizeString(data.localidade),
      uf: sanitizeString(data.uf),
      complemento: sanitizeString(data.complemento),
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
