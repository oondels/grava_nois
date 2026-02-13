import { mount } from "@vue/test-utils";
import EmailResetPassword from "@/pages/auth/EmailResetPassword.vue";
import { createTestVuetify } from "@/test/vuetify";
import { resetPasswordWithToken, verifyPasswordResetToken } from "@/services/passwordRecovery";

const showSnackbar = vi.fn();
const pushMock = vi.fn();

vi.mock("@/composables/useSnackbar", () => ({
  useSnackbar: () => ({
    showSnackbar,
  }),
}));

vi.mock("vue-router", async () => {
  const actual = await vi.importActual<typeof import("vue-router")>("vue-router");
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
    }),
  };
});

vi.mock("@/services/passwordRecovery", () => ({
  verifyPasswordResetToken: vi.fn(),
  resetPasswordWithToken: vi.fn(),
}));

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

function mountPage() {
  return mount(EmailResetPassword, {
    global: {
      plugins: [createTestVuetify()],
      stubs: {
        RouterLink: {
          template: "<a><slot /></a>",
        },
      },
    },
  });
}

async function fillPasswords(wrapper: ReturnType<typeof mount>, value = "NovaSenha123") {
  const passwordInputs = wrapper.findAll("input[type='password']");
  await passwordInputs[0].setValue(value);
  await passwordInputs[1].setValue(value);
}

describe("EmailResetPassword.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/auth/password/reset");
  });

  it("deve enviar nova senha quando token for válido", async () => {
    window.history.replaceState({}, "", "/auth/password/reset#token=token-valido");
    vi.mocked(verifyPasswordResetToken).mockResolvedValue({ ok: true });
    vi.mocked(resetPasswordWithToken).mockResolvedValue({ ok: true, message: "ok" });

    const wrapper = mountPage();
    await flushPromises();

    expect(window.location.hash).toBe("");
    await fillPasswords(wrapper);
    await (wrapper.vm as any).submitPasswordReset();
    await flushPromises();

    expect(verifyPasswordResetToken).toHaveBeenCalledWith("token-valido");
    expect(resetPasswordWithToken).toHaveBeenCalledWith("token-valido", "NovaSenha123");
    expect(pushMock).toHaveBeenCalledWith({ path: "/login", query: { reset: "success" } });
  });

  it("deve mostrar estado de erro quando token estiver ausente", async () => {
    vi.mocked(verifyPasswordResetToken).mockResolvedValue({ ok: false });
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain("Link inválido ou ausente. Solicite um novo link de recuperação.");
    expect(resetPasswordWithToken).not.toHaveBeenCalled();
  });

  it("deve mostrar estado de erro quando token for inválido", async () => {
    window.history.replaceState({}, "", "/auth/password/reset#token=token-invalido");
    vi.mocked(verifyPasswordResetToken).mockResolvedValue({ ok: false });

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain("Este link é inválido, expirou ou já foi utilizado.");
  });

  it("deve tratar rate limit (429) ao redefinir senha", async () => {
    window.history.replaceState({}, "", "/auth/password/reset#token=token-429");
    vi.mocked(verifyPasswordResetToken).mockResolvedValue({ ok: true });
    vi.mocked(resetPasswordWithToken).mockRejectedValue({ status: 429, retryAfterSeconds: 30 });

    const wrapper = mountPage();
    await flushPromises();

    await fillPasswords(wrapper);
    await (wrapper.vm as any).submitPasswordReset();
    await flushPromises();

    expect(wrapper.text()).toContain("Muitas tentativas. Aguarde e tente novamente.");
    expect(wrapper.text()).toContain("Aguarde 30s");
    expect(showSnackbar).toHaveBeenCalledWith("Muitas tentativas. Aguarde e tente novamente.", "warning");
  });
});
