// Tipos e cliente HTTP para listagem de vídeos
import type { ApiResponse } from "@/types/Api";

export type VideoListItem = {
  clip_id: string;
  path: string | null;
  bucket: string;
  size: number | null;
  last_modified: string | null;
  url?: string | null;
  missing: boolean;
  captured_at: string | null;
  contract_type: 'monthly_subscription' | 'per_video' | string;
};

export type VideoListResponse = {
  items: VideoListItem[];
  count: number;
  hasMore: boolean;
  nextToken: string | null;
};

export async function fetchVideos({
  limit = 100,
  token,
  includeSignedUrl = false,
  ttl = 3600,
  venueId,
}: {
  limit?: number;
  token?: string;
  includeSignedUrl?: boolean;
  ttl?: number;
  venueId: string;
}): Promise<VideoListResponse> {
  if (limit < 1 || limit > 100) {
    throw new Error('limit fora do intervalo permitido (1..100)');
  }
  if (includeSignedUrl && (ttl < 60 || ttl > 3600)) {
    throw new Error('ttl fora do intervalo permitido (60..3600)');
  }
  if (!venueId) {
    throw new Error('venueId é obrigatório');
  }

  const params = new URLSearchParams({
    venueId,
    limit: String(limit),
    includeSignedUrl: String(includeSignedUrl),
    ttl: String(ttl),
  });
  if (token) params.set('token', token);

  const base = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  const baseUrl = base ? base.replace(/\/$/, '') : '';
  const url = `${baseUrl}/api/videos/list?${params.toString()}`;

  const res = await fetch(url, { credentials: 'include' });
  const body = await res.json().catch(() => null as ApiResponse<VideoListResponse> | VideoListResponse | null);
  if (!res.ok) {
    const message =
      (body && "message" in body && typeof body.message === "string" ? body.message : undefined) ||
      (body && "error" in body && body.error && typeof body.error === "object" && "code" in body.error
        ? String(body.error.code)
        : undefined) ||
      'Falha ao listar vídeos';
    throw new Error(message);
  }

  if (!body) {
    throw new Error('Resposta vazia ao listar vídeos');
  }

  if ("data" in body && body.data && typeof body.data === "object") {
    return body.data as VideoListResponse;
  }

  return body as VideoListResponse;
}
