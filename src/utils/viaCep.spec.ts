import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchViaCepAddress } from "./viaCep";

const fetchMock = vi.fn();

describe("fetchViaCepAddress", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns null when cep is invalid", async () => {
    const result = await fetchViaCepAddress("12345");

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns data from ViaCEP when provider succeeds", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          cep: "44190-000",
          logradouro: "Rua Exemplo",
          bairro: "Centro",
          localidade: "Feira de Santana",
          uf: "BA",
          complemento: "",
        }),
        { status: 200 },
      ),
    );

    const result = await fetchViaCepAddress("44190000");

    expect(result).toEqual({
      cep: "44190-000",
      logradouro: "Rua Exemplo",
      bairro: "Centro",
      localidade: "Feira de Santana",
      uf: "BA",
      complemento: "",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://viacep.com.br/ws/44190000/json/",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("uses BrasilAPI fallback when ViaCEP fails with network/CORS error", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("NetworkError when attempting to fetch resource."));
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          cep: "44190000",
          state: "BA",
          city: "Feira de Santana",
          neighborhood: "Centro",
          street: "Rua Exemplo Fallback",
        }),
        { status: 200 },
      ),
    );

    const result = await fetchViaCepAddress("44190000");

    expect(result).toEqual({
      cep: "44190000",
      logradouro: "Rua Exemplo Fallback",
      bairro: "Centro",
      localidade: "Feira de Santana",
      uf: "BA",
      complemento: "",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://brasilapi.com.br/api/cep/v1/44190000",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("returns null when providers report cep as not found", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ erro: true }), { status: 200 }));
    fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));

    const result = await fetchViaCepAddress("44190000");

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
