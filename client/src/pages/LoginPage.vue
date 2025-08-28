<template>
  <!-- <div class="login-page d-flex align-center justify-center min-height-screen">

  </div> -->
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

                <div class="d-flex align-center justify-space-between my-5">
                  <v-btn variant="text" size="small" class="text-primary" @click="handleForgotPassword">
                    Esqueci minha senha
                  </v-btn>

                  <div>
                    <!-- <span> Não possui uma conta? </span> -->
                    <v-btn variant="text" size="small" class="text-primary" @click="handleForgotPassword">
                      Cadastre-se
                    </v-btn>
                  </div>
                </div>

                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  :loading="loadingAuth"
                  class="mb-4 login-action"
                  @click="auth.signUpEmail(loadingAuth)"
                >
                  <template #prepend>
                    <LogIn :size="18" class="me-1" />
                  </template>
                  Entrar
                </v-btn>

                <!-- <div
                  id="g_id_onload"
                  data-client_id="grava-nois-470322"
                  data-context="signin"
                  data-ux_mode="popup"
                  data-callback="signInWithOAuth"
                  data-nonce=""
                  data-auto_select="true"
                  data-itp_support="true"
                  data-use_fedcm_for_prompt="true"
                ></div>
                <div
                  class="g_id_signin"
                  data-type="standard"
                  data-shape="pill"
                  data-theme="outline"
                  data-text="signin_with"
                  data-size="large"
                  data-logo_alignment="left"
                ></div> -->
                <v-btn
                  color="red"
                  variant="outlined"
                  size="large"
                  block
                  :loading="loadingAuth"
                  class="mb-4 d-flex align-center justify-center"
                  @click="auth.signInWithGoogleRedirect(loadingAuth)"
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
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useSnackbar } from "@/composables/useSnackbar";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-vue-next";
import LogoGravaNoisBranco from "@/assets/icons/grava-nois-branco.webp";
const { showSnackbar } = useSnackbar();

const auth = useAuthStore();
console.log(auth.isAuthenticated);

const router = useRouter();
const loadingAuth = ref(false);

const remember = ref(false);
const showPassword = ref(false);
const loginData = reactive({
  email: "",
  password: "",
});

const rules = {
  required: (value: string) => !!value || "Campo obrigatório",
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "Email inválido";
  },
};

const handleForgotPassword = () => {
  showSnackbar("Recuperação de senha indisponível na demonstração.", "info");
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
  height: 80px;
  width: auto;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}
</style>
