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
                      \
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

                  <!-- <span> Não possui uma conta? </span> -->
                  <RouterLink class="absolute bottom-0 right-0" to="/register" aria-label="Ir para página de cadastro">
                    <a class="text-blue p-1" href="#">Cadastre-se</a>
                  </RouterLink>
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

                <!-- <v-btn
                  color="red"
                  variant="outlined"
                  size="large"
                  block
                  :loading="loadingAuth"
                  class="mb-4 d-flex align-center justify-center"
                  @click="auth.signInWithGoogle"
                >
                  <img src="@/assets/google.svg" alt="Google" width="18" height="18" class="me-2" />
                  Entrar com Google
                </v-btn> -->

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
import { ref, reactive, onMounted } from "vue";
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

const submitLogin = async () => {
  loadingAuth.value = true;
  try {
    await auth.signInWithEmail(loginData.email, loginData.password);
    showSnackbar("Login efetuado com sucesso!", "success");
    router.push("/lances-gravanois");
  } catch (error: any) {
    showSnackbar(error.message, "error");
    console.error("signIn error:", error);
  } finally {
    loadingAuth.value = false;
  }
};

const googleBtnEl = ref<HTMLElement | null>(null);
const handleGoogleCredential = async (credential: string) => {
  try {
    await auth.signInWithGoogleCredential(credential);
    showSnackbar("Login com Google efetuado com sucesso!", "success");
    router.push("/lances-gravanois");
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
      // @ts-ignore
      google.accounts.id.renderButton(googleBtnEl.value, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "center",
      });
    }
  } catch {}
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
</style>
