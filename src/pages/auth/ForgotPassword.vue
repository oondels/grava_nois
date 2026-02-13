<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <transition name="fade-slide">
          <v-card elevation="10" class="auth-card rounded-xl overflow-hidden">
            <v-card-title class="text-center pa-6 pb-2">
              <div class="d-flex flex-column align-center justify-center mb-1">
                <img :src="LogoGravaNoisBranco" alt="Grava Nóis" class="brand-logo mb-2" />
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Informe seu e-mail para receber o link de recuperação.
                </p>
              </div>
            </v-card-title>

            <v-card-text class="pa-6 pt-3">
              <v-text-field
                v-model.trim="email"
                label="Email"
                type="email"
                variant="outlined"
                class="mb-2"
                :error-messages="emailError ? [emailError] : []"
                :aria-invalid="Boolean(emailError)"
                autocomplete="email"
                autofocus
                @update:model-value="clearErrors"
              >
                <template #prepend-inner>
                  <Mail :size="18" class="text-medium-emphasis" />
                </template>
              </v-text-field>

              <v-alert
                v-if="genericFeedbackVisible"
                type="success"
                density="compact"
                variant="tonal"
                class="mb-4"
              >
                {{ genericFeedbackMessage }}
              </v-alert>

              <v-alert
                v-if="generalError"
                ref="errorAlertRef"
                type="error"
                density="compact"
                variant="tonal"
                class="mb-4"
                tabindex="-1"
              >
                {{ generalError }}
              </v-alert>

              <v-btn
                color="primary"
                variant="flat"
                size="large"
                block
                class="mb-4 auth-action"
                :loading="loading"
                :disabled="loading || isRateLimited"
                @click="submitForgotPassword"
              >
                {{ submitLabel }}
              </v-btn>

              <div class="d-flex align-center justify-space-between mt-2">
                <span class="text-body-2 text-medium-emphasis">Já lembrou sua senha?</span>
                <RouterLink to="/login" aria-label="Voltar para o login">
                  <v-btn variant="text" size="small" class="text-primary">Entrar</v-btn>
                </RouterLink>
              </div>
            </v-card-text>
          </v-card>
        </transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { Mail } from "lucide-vue-next";
import { useSnackbar } from "@/composables/useSnackbar";
import { requestPasswordReset, type PasswordRecoveryError } from "@/services/passwordRecovery";
import LogoGravaNoisBranco from "@/assets/icons/grava-nois-branco.webp";

const GENERIC_FORGOT_MESSAGE = "Se o e-mail existir, você receberá um link para redefinir sua senha.";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const { showSnackbar } = useSnackbar();

const email = ref("");
const emailError = ref("");
const generalError = ref("");
const genericFeedbackVisible = ref(false);
const loading = ref(false);

const cooldownSeconds = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const isRateLimited = computed(() => cooldownSeconds.value > 0);
const submitLabel = computed(() =>
  isRateLimited.value ? `Aguarde ${cooldownSeconds.value}s` : "Enviar link de recuperação"
);
const genericFeedbackMessage = GENERIC_FORGOT_MESSAGE;
const errorAlertRef = ref<HTMLElement | null>(null);

function clearErrors() {
  emailError.value = "";
  generalError.value = "";
}

function validateEmail() {
  if (!EMAIL_PATTERN.test(email.value)) {
    emailError.value = "Email inválido";
    return false;
  }
  return true;
}

function setCooldown(seconds: number) {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }

  cooldownSeconds.value = Math.max(0, Math.floor(seconds));
  if (cooldownSeconds.value <= 0) return;

  cooldownTimer = setInterval(() => {
    if (cooldownSeconds.value <= 1) {
      cooldownSeconds.value = 0;
      if (cooldownTimer) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
      }
      return;
    }
    cooldownSeconds.value -= 1;
  }, 1000);
}

async function submitForgotPassword() {
  clearErrors();
  genericFeedbackVisible.value = false;

  if (!validateEmail()) {
    return;
  }

  loading.value = true;
  try {
    await requestPasswordReset(email.value);
    genericFeedbackVisible.value = true;
    showSnackbar(GENERIC_FORGOT_MESSAGE, "success");
  } catch (error: any) {
    const parsedError = error as PasswordRecoveryError;

    if (parsedError.status === 429) {
      setCooldown(parsedError.retryAfterSeconds || 60);
      genericFeedbackVisible.value = true;
      showSnackbar(GENERIC_FORGOT_MESSAGE, "success");
      return;
    }

    if (parsedError.status) {
      // Resposta controlada da API: mantém mensagem genérica para não enumerar usuário.
      genericFeedbackVisible.value = true;
      showSnackbar(GENERIC_FORGOT_MESSAGE, "success");
      return;
    }

    generalError.value = "Não foi possível processar sua solicitação no momento. Tente novamente.";
    showSnackbar(generalError.value, "error");
  } finally {
    loading.value = false;
  }
}

watch(generalError, async (value) => {
  if (!value) return;
  await nextTick();
  errorAlertRef.value?.focus();
});

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
});
</script>

<style scoped>
.auth-card {
  min-height: 85vh;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

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

.brand-logo {
  height: 80px;
  width: auto;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}
</style>
