<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <transition name="fade-slide">
          <v-card elevation="10" class="auth-card rounded-xl overflow-hidden">
            <!-- Header -->
            <v-card-title class="text-center pa-6 pb-2">
              <div class="d-flex flex-column align-center justify-center mb-1">
                <img :src="LogoGravaNoisBranco" alt="Grava Nóis" class="brand-logo mb-2" />
                <p class="text-body-2 text-medium-emphasis mb-0">Crie sua conta e comece a publicar!</p>
              </div>
            </v-card-title>

            <!-- Form -->
            <v-card-text class="pa-6 pt-3">
              <v-form ref="formRef" v-model="isValid" @submit.prevent="onRegister">
                <v-text-field
                  v-model.trim="registerData.name"
                  label="Nome"
                  variant="outlined"
                  class="mb-4"
                  :rules="[rules.required, rules.min(3)]"
                  autocomplete="name"
                >
                  <template #prepend-inner>
                    <User :size="18" class="text-medium-emphasis" />
                  </template>
                </v-text-field>

                <v-text-field
                  v-model.trim="registerData.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  class="mb-4"
                  :rules="[rules.required, rules.email]"
                  autocomplete="email"
                >
                  <template #prepend-inner>
                    <Mail :size="18" class="text-medium-emphasis" />
                  </template>
                </v-text-field>

                <v-text-field
                  v-model.trim="registerData.password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Senha"
                  variant="outlined"
                  class="mb-3"
                  :rules="[rules.required, rules.min(8)]"
                  autocomplete="new-password"
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

                <v-text-field
                  v-model.trim="registerData.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  label="Confirmar Senha"
                  variant="outlined"
                  class="mb-6"
                  :rules="[rules.required, rules.samePassword]"
                  autocomplete="new-password"
                >
                  <template #prepend-inner>
                    <Lock :size="18" class="text-medium-emphasis" />
                  </template>
                  <template #append-inner>
                    <v-btn
                      size="small"
                      variant="text"
                      :aria-label="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <Eye v-if="!showConfirmPassword" :size="18" />
                      <EyeOff v-else :size="18" />
                    </v-btn>
                  </template>
                </v-text-field>
              </v-form>

              <div class="d-flex align-center justify-space-between my-5">
                <span class="text-body-2 text-medium-emphasis">Já possui uma conta?</span>
                <RouterLink
                  to="/login"
                  class="flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition px-2 py-1 active:scale-[.98]"
                  aria-label="Ir para página de login"
                >
                  <v-btn variant="text" size="small" class="text-primary"> Entrar </v-btn>
                </RouterLink>
              </div>

              <v-btn
                @click="onRegister"
                color="primary"
                variant="flat"
                size="large"
                block
                class="mb-4 auth-action"
                :loading="loading"
                :disabled="loading || !isValid"
              >
                <template #prepend>
                  <UserPlus :size="18" class="me-1" />
                </template>
                Criar conta
              </v-btn>

              <div ref="googleBtnEl" class="google-btn"></div>
            </v-card-text>
          </v-card>
        </transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from "lucide-vue-next";
import LogoGravaNoisBranco from "@/assets/icons/grava-nois-branco.webp";
const router = useRouter();
const loading = ref(false);

import { useAuthStore } from "@/store/auth";
const auth = useAuthStore();
import { useSnackbar } from "@/composables/useSnackbar";
const { showSnackbar } = useSnackbar();

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const formRef = ref();
const isValid = ref(false);
const googleBtnEl = ref<HTMLElement | null>(null);

const registerData = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const rules = {
  required: (value: string) => !!value || "Campo obrigatório",
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "Email inválido";
  },
  min: (n: number) => (value: string) => (value?.length ?? 0) >= n || `Mínimo de ${n} caracteres`,
  samePassword: (value: string) => value === registerData.password || "Senhas não conferem",
};

async function onRegister() {
  // Dispara validação do formulário
  const validation = await formRef.value?.validate?.();
  const valid = typeof validation === "boolean" ? validation : validation?.valid;
  if (!valid) {
    showSnackbar("Corrija os campos destacados.", "warning");
    return;
  }

  loading.value = true;
  try {
    await auth.signUpNewUser(registerData.email, registerData.password, { name: registerData.name });

    showSnackbar("Cadastro realizado com sucesso!", "success");
    router.push("/lances-gravanois");
  } catch (e: any) {
    console.error("Registration error:", e);
    showSnackbar(e?.message || "Erro ao cadastrar. Tente novamente.", "error");
  } finally {
    loading.value = false;
  }
}
const handleGoogleCredential = async (credential: string) => {
  try {
    await auth.signInWithGoogleCredential(credential);
    showSnackbar("Cadastro com Google efetuado com sucesso!", "success");
    router.push("/lances-gravanois");
  } catch (error) {
    showSnackbar("Erro ao efetuar cadastro com Google, tente novamente!", "error");
    console.error("Erro ao efetuar cadastro com google, tente novamente!");
    console.error(error);
  }
};

// Carrega script do Google apenas nesta rota (opcional)
onMounted(async () => {
  try {
    const isLogged = auth.isAuthenticated;

    if (isLogged) {
      router.push("/lances-gravanois");
      return;
    }

    const { ensureGoogleClientScript } = await import("@/utils/loadGoogleScript");
    await ensureGoogleClientScript();

    // Inicializa o botão para cadastrar com o google
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
        text: "signup_with",
        shape: "rectangular",
        logo_alignment: "center",
      });
    }
  } catch {}
});
</script>

<style scoped>
.auth-card {
  min-height: 85vh;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Microinterações e transições sutis */
.fade-slide-enter-active {
  transition: all 0.35s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.auth-action:hover {
  filter: brightness(1.05);
}
.auth-action :deep(svg) {
  transition: transform 0.2s ease;
}
.auth-action:hover :deep(svg) {
  transform: translateX(2px);
}

.brand-logo {
  height: 80px;
  width: auto;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}
</style>
