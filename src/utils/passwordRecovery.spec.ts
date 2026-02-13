import {
  getPasswordRulesErrors,
  isPasswordStrong,
  parseResetTokenFromHash,
  validatePasswordRules,
} from "@/utils/passwordRecovery";

describe("passwordRecovery utils", () => {
  it("deve extrair token do hash", () => {
    expect(parseResetTokenFromHash("#token=abc123")).toBe("abc123");
    expect(parseResetTokenFromHash("token=abc123")).toBe("abc123");
    expect(parseResetTokenFromHash("#foo=bar&token=xyz")).toBe("xyz");
  });

  it("deve retornar null quando token não existir ou estiver vazio", () => {
    expect(parseResetTokenFromHash("")).toBeNull();
    expect(parseResetTokenFromHash("#foo=bar")).toBeNull();
    expect(parseResetTokenFromHash("#token=")).toBeNull();
    expect(parseResetTokenFromHash("#token=   ")).toBeNull();
  });

  it("deve validar regras de senha corretamente", () => {
    expect(validatePasswordRules("NovaSenha123")).toEqual({
      minLength: true,
      uppercase: true,
      lowercase: true,
      digit: true,
    });

    expect(validatePasswordRules("fraca")).toEqual({
      minLength: false,
      uppercase: false,
      lowercase: true,
      digit: false,
    });
  });

  it("deve retornar mensagens de erro das regras quebradas", () => {
    const errors = getPasswordRulesErrors("senha");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain("Nova senha deve ter pelo menos 8 caracteres");
    expect(errors).toContain("Senha deve conter pelo menos uma letra maiúscula");
    expect(errors).toContain("Senha deve conter pelo menos um número");
  });

  it("deve indicar quando senha é forte", () => {
    expect(isPasswordStrong("NovaSenha123")).toBe(true);
    expect(isPasswordStrong("novasenha")).toBe(false);
  });
});
