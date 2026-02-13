export const PASSWORD_RULES_MESSAGES = {
  minLength: "Nova senha deve ter pelo menos 8 caracteres",
  uppercase: "Senha deve conter pelo menos uma letra maiúscula",
  lowercase: "Senha deve conter pelo menos uma letra minúscula",
  digit: "Senha deve conter pelo menos um número",
} as const;

export type PasswordRulesResult = {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  digit: boolean;
};

export function validatePasswordRules(password: string): PasswordRulesResult {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /[0-9]/.test(password),
  };
}

export function getPasswordRulesErrors(password: string): string[] {
  const result = validatePasswordRules(password);
  const errors: string[] = [];

  if (!result.minLength) errors.push(PASSWORD_RULES_MESSAGES.minLength);
  if (!result.uppercase) errors.push(PASSWORD_RULES_MESSAGES.uppercase);
  if (!result.lowercase) errors.push(PASSWORD_RULES_MESSAGES.lowercase);
  if (!result.digit) errors.push(PASSWORD_RULES_MESSAGES.digit);

  return errors;
}

export function isPasswordStrong(password: string): boolean {
  const result = validatePasswordRules(password);
  return result.minLength && result.uppercase && result.lowercase && result.digit;
}

export function parseResetTokenFromHash(hash: string): string | null {
  if (!hash) return null;

  const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalizedHash);
  const token = params.get("token");
  if (!token) return null;

  const normalizedToken = token.trim();
  return normalizedToken.length > 0 ? normalizedToken : null;
}

export function buildCleanUrl(pathname: string, search: string): string {
  return `${pathname}${search || ""}`;
}

export function clearHashFromBrowserUrl(): void {
  if (typeof window === "undefined") return;

  const cleanUrl = buildCleanUrl(window.location.pathname, window.location.search);
  window.history.replaceState({}, document.title, cleanUrl);
}
