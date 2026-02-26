// Tipos e cliente HTTP para listagem de vídeos
import { api } from "@/services/api";
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
  videos: VideoListItem[];
  count: number;
  hasMore: boolean;
  nextToken: string | null;
};

type VideoListApiEnvelope = ApiResponse<VideoListResponse>;
type VideoSignPayload = { url?: string };
type VideoSignApiEnvelope = ApiResponse<VideoSignPayload>;

const downloadUrlCache = new Map<string, string | null>();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isVideoListResponse = (value: unknown): value is VideoListResponse => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.videos) &&
    typeof value.count === "number" &&
    typeof value.hasMore === "boolean" &&
    (typeof value.nextToken === "string" || value.nextToken === null)
  );
};

const extractSignedUrl = (value: unknown): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.url === "string" && value.url.trim().length > 0) {
    return value.url;
  }

  if (isRecord(value.data) && typeof value.data.url === "string" && value.data.url.trim().length > 0) {
    return value.data.url;
  }

  return null;
};

const getDownloadCacheKey = (bucket: string, path: string) => `${bucket}:${path}`;

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

  const response = await api.get<VideoListResponse | VideoListApiEnvelope>("/api/videos/list", {
    params: {
      venueId,
      limit,
      includeSignedUrl,
      ttl,
      ...(token ? { token } : {}),
    },
  });

  const body = response.data;
  if (isVideoListResponse(body)) {
    return body;
  }

  if (isRecord(body) && "data" in body && isVideoListResponse(body.data)) {
    return body.data;
  }

  throw new Error("Não foi possível interpretar a resposta de vídeos.");
}

export function clearDownloadCache() {
  downloadUrlCache.clear();
}

export async function signDownload(path: string | null, bucket = "temp"): Promise<string | null> {
  if (!path) return null;

  const cacheKey = getDownloadCacheKey(bucket, path);
  if (downloadUrlCache.has(cacheKey)) {
    return downloadUrlCache.get(cacheKey) ?? null;
  }

  const response = await api.get<VideoSignPayload | VideoSignApiEnvelope>("/api/videos/sign", {
    params: {
      bucket,
      path,
      kind: "download",
      ttl: 3600,
    },
  });

  const signedUrl = extractSignedUrl(response.data);
  downloadUrlCache.set(cacheKey, signedUrl);
  return signedUrl;
}

export async function onDownload(file: Pick<VideoListItem, "path" | "bucket" | "url" | "missing">): Promise<string | null> {
  if (file.missing) return null;

  const fallbackUrl = typeof file.url === "string" && file.url.trim().length > 0 ? file.url : null;
  try {
    const signedUrl = await signDownload(file.path, file.bucket);
    return signedUrl || fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}
