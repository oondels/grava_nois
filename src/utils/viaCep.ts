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

type BrasilApiPayload = {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
};

type LookupResult =
  | { kind: "success"; address: ViaCepAddress }
  | { kind: "not_found" }
  | { kind: "error"; error: unknown };

function sanitizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function parseViaCepPayload(payload: unknown, cep: string): ViaCepAddress | null {
  if (!payload || typeof payload !== "object") return null;

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
}

function parseBrasilApiPayload(payload: unknown, cep: string): ViaCepAddress | null {
  if (!payload || typeof payload !== "object") return null;

  const data = payload as BrasilApiPayload;
  return {
    cep: sanitizeString(data.cep) || cep,
    logradouro: sanitizeString(data.street),
    bairro: sanitizeString(data.neighborhood),
    localidade: sanitizeString(data.city),
    uf: sanitizeString(data.state),
    complemento: "",
  };
}

async function tryLookup(
  url: string,
  cep: string,
  parser: (payload: unknown, normalizedCep: string) => ViaCepAddress | null,
  signal: AbortSignal,
): Promise<LookupResult> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (response.status === 404) {
      return { kind: "not_found" };
    }

    if (!response.ok) {
      return { kind: "error", error: new Error(`CEP provider respondeu com status ${response.status}`) };
    }

    const payload: unknown = await response.json();
    const address = parser(payload, cep);

    if (!address) return { kind: "not_found" };
    return { kind: "success", address };
  } catch (error) {
    if (isAbortError(error)) throw error;
    return { kind: "error", error };
  }
}

export async function fetchViaCepAddress(rawCep: string): Promise<ViaCepAddress | null> {
  const cep = rawCep.replace(/\D/g, "");
  if (cep.length !== 8) return null;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const providers = [
      () => tryLookup(`https://viacep.com.br/ws/${cep}/json/`, cep, parseViaCepPayload, controller.signal),
      () => tryLookup(`https://brasilapi.com.br/api/cep/v1/${cep}`, cep, parseBrasilApiPayload, controller.signal),
    ];

    let lastError: unknown;
    let hasNotFoundResult = false;

    for (const resolveAddress of providers) {
      const result = await resolveAddress();

      if (result.kind === "success") return result.address;
      if (result.kind === "not_found") {
        hasNotFoundResult = true;
        continue;
      }

      lastError = result.error;
    }

    if (hasNotFoundResult) return null;

    throw lastError ?? new Error("Falha ao consultar CEP em todos os provedores");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
