import { apiNoRefresh } from "@/services/api";
import type { ApiResponse } from "@/types/Api";

type PasswordRecoveryEnvelope<T = any> = ApiResponse<T>;

export type PasswordRecoveryError = Error & {
  status?: number;
  code?: string;
  retryAfterSeconds?: number;
};

type VerifyResetResponse = { ok?: boolean };
type ResetResponse = { ok?: boolean };

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const parseRetryAfterSeconds = (headers: unknown): number | undefined => {
  if (!isRecord(headers)) return undefined;
  const raw = headers["retry-after"];
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  if (typeof raw === "string") {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

const parseErrorMessage = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) return undefined;

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  const error = payload.error;
  if (!isRecord(error)) return undefined;

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return undefined;
};

const parseErrorCode = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) return undefined;

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  const error = payload.error;
  if (!isRecord(error)) return undefined;

  if (typeof error.code === "string" && error.code.trim()) {
    return error.code;
  }

  return undefined;
};

const normalizeError = (error: any, fallbackMessage: string): PasswordRecoveryError => {
  const status = typeof error?.response?.status === "number" ? error.response.status : undefined;
  const payload = error?.response?.data;

  const normalizedError = new Error(parseErrorMessage(payload) || fallbackMessage) as PasswordRecoveryError;
  normalizedError.status = status;
  normalizedError.code = parseErrorCode(payload);
  normalizedError.retryAfterSeconds = parseRetryAfterSeconds(error?.response?.headers);

  return normalizedError;
};

export async function requestPasswordReset(email: string) {
  try {
    const { data } = await apiNoRefresh.post<PasswordRecoveryEnvelope<null>>("/auth/password/forgot", { email });
    return {
      success: data?.success ?? true,
      message: data?.message || "Se o e-mail existir, você receberá um link para redefinir sua senha.",
      requestId: data?.requestId,
    };
  } catch (error: any) {
    throw normalizeError(error, "Não foi possível solicitar a recuperação de senha no momento.");
  }
}

export async function verifyPasswordResetToken(token: string) {
  try {
    const { data } = await apiNoRefresh.post<PasswordRecoveryEnvelope<VerifyResetResponse>>(
      "/auth/password/reset/verify",
      { token }
    );

    return {
      ok: data?.data?.ok === true,
      message: data?.message,
      requestId: data?.requestId,
    };
  } catch (error: any) {
    throw normalizeError(error, "Não foi possível validar o link de recuperação.");
  }
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  try {
    const { data } = await apiNoRefresh.post<PasswordRecoveryEnvelope<ResetResponse>>("/auth/password/reset", {
      token,
      newPassword,
    });

    return {
      ok: data?.data?.ok === true,
      message: data?.message || "Senha redefinida com sucesso.",
      requestId: data?.requestId,
    };
  } catch (error: any) {
    throw normalizeError(error, "Não foi possível redefinir a senha.");
  }
}
