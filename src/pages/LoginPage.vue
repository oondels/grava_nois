<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <transition name="fade-slide">
          <v-card elevation="10" class="login-card rounded-xl overflow-hidden">
            <!-- Header -->
            <v-card-title class="text-center pa-6 pb-2">
              <div class="d-flex flex-column align-center justify-center mb-1">
                <img :src="LogoGravaNoisBranco" alt="Grava Nóis" class="brand-logo mb-2" />
                <p class="text-body-2 text-medium-emphasis mb-0">Seus melhores lances em alta qualidade!</p>
              </div>
            </v-card-title>

            <!-- Form -->
            <v-card-text class="pa-6 pt-3">
              <v-form>
                <div class="relative my-4">
                  <v-text-field
                    v-model.trim="loginData.email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    :rules="[rules.required, rules.email]"
                    class="mb-4"
                    autocomplete="email"
                    autofocus
                  >
                    <template #prepend-inner>
                      <Mail :size="18" class="text-medium-emphasis" />
                    </template>
                  </v-text-field>

                  <v-text-field
                    v-model.trim="loginData.password"
                    :type="showPassword ? 'text' : 'password'"
                    label="Senha"
                    variant="outlined"
                    :rules="[rules.required]"
                    class="mb-2"
                    autocomplete="current-password"
                    @keyup.enter="submitLogin"
                  >
                    <template #prepend-inner>
                      <Lock :size="18" class="text-medium-emphasis" />
                    </template>

                    <template #append-inner>
                      <v-btn
                        size="small"
                        variant="text"
                        :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                        @click="showPassword = !showPassword"
                      >
                        <Eye v-if="!showPassword" :size="18" />
                        <EyeOff v-else :size="18" />
                      </v-btn>
                    </template>
                  </v-text-field>

                  <div class="absolute bottom-0 left-0 right-0 d-flex justify-space-between auth-links">
                    <RouterLink class="text-blue p-1" to="/auth/change-password" aria-label="Ir para tela de alterar senha">
                      Alterar senha
                    </RouterLink>
                    <RouterLink class="text-blue p-1" to="/register" aria-label="Ir para página de cadastro">
                      Cadastre-se
                    </RouterLink>
                  </div>
                </div>

                <v-btn
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  :loading="loadingAuth"
                  class="mb-4 login-action"
                  @click="submitLogin"
                >
                  <template #prepend>
                    <LogIn :size="18" class="me-1" />
                  </template>
                  Entrar
                </v-btn>

                <div ref="googleBtnEl" class="google-btn"></div>
              </v-form>
            </v-card-text>
          </v-card>
        </transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { useAuthStore } from "@/store/auth";

import { useSnackbar } from "@/composables/useSnackbar";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-vue-next";
import LogoGravaNoisBranco from "@/assets/icons/grava-nois-branco.webp";
const { showSnackbar } = useSnackbar();
import { useRouter } from "vue-router";

const rules = {
  required: (value: string) => !!value || "Campo obrigatório",
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "Email inválido";
  },
};

const router = useRouter();
const auth = useAuthStore();

const loadingAuth = ref(false);

const showPassword = ref(false);
const loginData = reactive({
  email: "",
  password: "",
});

function getPostAuthRedirect(): string {
  try {
    const saved = localStorage.getItem("postAuthRedirect");
    localStorage.removeItem("postAuthRedirect");
    if (saved && saved.startsWith("/") && saved !== "/login" && saved !== "/register") {
      return saved;
    }
  } catch { /* ignore */ }
  return "/lances-gravanois";
}

const submitLogin = async () => {
  loadingAuth.value = true;
  try {
    await auth.signInWithEmail(loginData.email, loginData.password);
    showSnackbar("Login efetuado com sucesso!", "success");
    router.push(getPostAuthRedirect());
  } catch (error: any) {
    showSnackbar(error.message, "error");
    console.error("signIn error:", error);
  } finally {
    loadingAuth.value = false;
  }
};

const googleBtnEl = ref<HTMLElement | null>(null);
let googleBtnResizeObserver: ResizeObserver | null = null;

function renderGoogleButton() {
  if (!googleBtnEl.value) return;
  // Limpa renderizações anteriores (ex.: resize)
  googleBtnEl.value.innerHTML = "";

  const width = Math.floor(googleBtnEl.value.getBoundingClientRect().width);
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 320;

  // @ts-ignore
  google.accounts.id.renderButton(googleBtnEl.value, {
    theme: "outline",
    size: "large",
    width: safeWidth,
    text: "signin_with",
    shape: "rectangular",
    logo_alignment: "center",
  });
}

const handleGoogleCredential = async (credential: string) => {
  try {
    await auth.signInWithGoogleCredential(credential);
    showSnackbar("Login com Google efetuado com sucesso!", "success");
    router.push(getPostAuthRedirect());
  } catch (error) {
    showSnackbar("Erro ao efetuar login com Google, tente novamente!", "error");
    console.error("Erro ao efetuar login com google, tente novamente!");
    console.error(error);
  }
};

// Carrega script do Google apenas nesta rota
onMounted(async () => {
  const isLogged = auth.isAuthenticated;

  if (isLogged) {
    router.push("/lances-gravanois");
    return;
  }

  try {
    const { ensureGoogleClientScript } = await import("@/utils/loadGoogleScript");
    await ensureGoogleClientScript();

    // Inicializa o botão para entrar com o google
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (response: any) => handleGoogleCredential(response.credential),
    });

    if (googleBtnEl.value) {
      await nextTick();
      renderGoogleButton();

      if (typeof ResizeObserver !== "undefined") {
        googleBtnResizeObserver = new ResizeObserver(() => {
          renderGoogleButton();
        });
        googleBtnResizeObserver.observe(googleBtnEl.value);
      }
    }
  } catch {}
});

onUnmounted(() => {
  googleBtnResizeObserver?.disconnect();
  googleBtnResizeObserver = null;
});

// const handleForgotPassword = () => {
//   console.log("Trocando senha");

//   auth.sendReset(loginData.email);
// };
</script>

<style scoped>
.login-card {
  min-height: 85vh;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.min-height-screen {
  min-height: 100vh;
}

/* Microinterações e transições sutis */
.fade-slide-enter-active {
  transition: all 0.35s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.login-action:hover {
  filter: brightness(1.05);
}
.login-action :deep(svg) {
  transition: transform 0.2s ease;
}
.login-action:hover :deep(svg) {
  transform: translateX(2px);
}

.brand-logo {
  height: 80px;
  width: auto;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}

.google-btn {
  width: 100%;
  display: flex;
  justify-content: center;
}

.google-btn :deep(iframe) {
  width: 100% !important;
  max-width: 100% !important;
}

.auth-links {
  pointer-events: auto;
}
</style>
