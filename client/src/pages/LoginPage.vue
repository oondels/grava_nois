<template>
  <div class="login-page d-flex align-center justify-center min-height-screen">
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
                <v-form validate-on="submit lazy">
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

                  <div class="d-flex align-center justify-space-between mb-4">
                    <v-btn variant="text" size="small" class="text-primary" @click="handleForgotPassword">
                      Esqueci minha senha
                    </v-btn>
                  </div>

                  <v-btn
                    type="submit"
                    color="primary"
                    variant="flat"
                    size="large"
                    block
                    :loading="authStore.loading"
                    class="mb-4 login-action"
                  >
                    <template #prepend>
                      <LogIn :size="18" class="me-1" />
                    </template>
                    Entrar
                  </v-btn>

                  <v-btn
                    color="red"
                    variant="outlined"
                    size="large"
                    block
                    :loading="authStore.loading"
                    class="mb-4 d-flex align-center justify-center"
                  >
                    <img src="@/assets/google.svg" alt="Google" width="18" height="18" class="me-2" />
                    Entrar com Google
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </transition>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useClipsStore } from "@/store/clips";
import { useSnackbar } from "@/composables/useSnackbar";
import { authServiceInstance } from "@/services/auth";
import { Mail, Lock, LogIn, PlayCircle, DownloadCloud, Filter, ShieldCheck, Eye, EyeOff } from "lucide-vue-next";
import LogoGravaNoisBranco from "@/assets/icons/grava-nois-branco.webp";

const router = useRouter();
const authStore = useAuthStore();
const clipsStore = useClipsStore();
const { showSnackbar } = useSnackbar();

const loginData = reactive({
  email: "",
  password: "",
});

const remember = ref(false);
const showPassword = ref(false);

const rules = {
  required: (value: string) => !!value || "Campo obrigatório",
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "Email inválido";
  },
};

// const handleLogin = async () => {
//   if (!loginData.email || !loginData.password) {
//     showSnackbar("Por favor, preencha todos os campos.", "error");
//     return;
//   }

//   const success = await authStore.login(loginData.email, loginData.password);
//   if (success) {
//     showSnackbar("Login realizado com sucesso!", "success");
//     router.push("/meus-lances");
//   } else {
//     showSnackbar("Erro ao fazer login. Tente novamente.", "error");
//   }
// };

// const handleGoogleLogin = async () => {
//   try {
//     await authServiceInstance.signInGoogle();
//     showSnackbar("Login realizado com sucesso!", "success");
//     router.push("/meus-lances");
//   } catch (error) {
//     console.error("Erro ao fazer login com Google:", error);
//     showSnackbar("Erro ao fazer login com Google. Tente novamente.", "error");
//   }
// };

const handleForgotPassword = () => {
  showSnackbar("Recuperação de senha indisponível na demo.", "info");
};

const handleDemoLogin = async () => {
  await authStore.loginDemo();
  showSnackbar("Bem-vindo ao modo demonstração!", "info");
  router.push("/meus-lances");
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: radial-gradient(1000px 500px at 15% -10%, rgba(var(--v-theme-primary), 0.1), transparent 60%),
    radial-gradient(800px 420px at 110% 0%, rgba(var(--v-theme-secondary), 0.06), transparent 55%),
    linear-gradient(180deg, #050506 0%, #0a0b0c 100%);
}

.login-card {
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
  height: 44px;
  width: auto;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}
</style>
