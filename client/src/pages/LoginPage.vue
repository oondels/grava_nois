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

                <div class="d-flex align-center justify-center my-5">
                  <!-- <v-btn variant="text" size="small" class="text-primary"> Esqueci minha senha </v-btn> -->

                  <div class="d-flex justify-center align-center">
                    <!-- <span> Não possui uma conta? </span> -->
                    <RouterLink
                      to="/register"
                      class="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-[.98]"
                      aria-label="Ir para página de cadastro"
                    >
                      <v-btn variant="text" size="small" class="text-primary"> Cadastre-se </v-btn>
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

                <v-btn
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
                </v-btn>
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
import { useRouter, useRoute } from 'vue-router'

const rules = {
  required: (value: string) => !!value || "Campo obrigatório",
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "Email inválido";
  },
};

const router = useRouter()
const route = useRoute()
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

    // Redirect after successful email login
    const desired = (localStorage.getItem('postAuthRedirect') || '').trim()
    const target = desired && desired.startsWith('/') ? desired : '/lances-gravanois'
    localStorage.removeItem('postAuthRedirect')
    router.replace(target)
  } catch (error: any) {
    showSnackbar(error.message, "error");
    console.error("signIn error:", error);
  } finally {
    loadingAuth.value = false;
  }
};

// Carrega script do Google apenas nesta rota
onMounted(async () => {
  try {
    const { ensureGoogleClientScript } = await import('@/utils/loadGoogleScript')
    await ensureGoogleClientScript()
  } catch {}
})
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
