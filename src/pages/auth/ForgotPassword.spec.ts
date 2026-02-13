import { mount } from "@vue/test-utils";
import ForgotPassword from "@/pages/auth/ForgotPassword.vue";
import { createTestVuetify } from "@/test/vuetify";
import { requestPasswordReset } from "@/services/passwordRecovery";

const showSnackbar = vi.fn();

vi.mock("@/composables/useSnackbar", () => ({
  useSnackbar: () => ({
    showSnackbar,
  }),
}));

vi.mock("@/services/passwordRecovery", () => ({
  requestPasswordReset: vi.fn(),
}));

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("ForgotPassword.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve exibir mensagem genérica mesmo em erro controlado", async () => {
    vi.mocked(requestPasswordReset).mockRejectedValue({
      status: 404,
      message: "Usuário não encontrado",
    });

    const wrapper = mount(ForgotPassword, {
      global: {
        plugins: [createTestVuetify()],
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    const input = wrapper.find("input[type='email']");
    await input.setValue("naoexiste@gravanois.com");
    await wrapper.find("button").trigger("click");
    await flushPromises();

    expect(requestPasswordReset).toHaveBeenCalledWith("naoexiste@gravanois.com");
    expect(wrapper.text()).toContain("Se o e-mail existir, você receberá um link para redefinir sua senha.");
    expect(showSnackbar).toHaveBeenCalledWith(
      "Se o e-mail existir, você receberá um link para redefinir sua senha.",
      "success"
    );
  });
});
