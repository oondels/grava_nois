<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <transition name="fade-slide">
          <v-card elevation="10" class="auth-card rounded-xl overflow-hidden">
            <v-card-title class="text-center pa-6 pb-2">
              <div class="d-flex flex-column align-center justify-center mb-1">
                <img :src="LogoGravaNoisBranco" alt="Grava Nóis" class="brand-logo mb-2" />
                <p class="text-body-2 text-medium-emphasis mb-0">Defina sua nova senha para acessar sua conta.</p>
              </div>
            </v-card-title>

            <v-card-text class="pa-6 pt-3">
              <v-alert
                v-if="tokenMissing"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                Link inválido ou ausente. Solicite um novo link de recuperação.
              </v-alert>

              <v-alert
                v-else-if="tokenInvalid"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                Este link é inválido, expirou ou já foi utilizado. Solicite um novo link.
              </v-alert>

              <v-alert
                v-else-if="isVerifyingToken"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                Validando link de recuperação...
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

              <v-text-field
                v-model="newPassword"
                label="Nova senha"
                :type="showNewPassword ? 'text' : 'password'"
                variant="outlined"
                class="mb-2"
                :error-messages="newPasswordErrors"
                :aria-invalid="newPasswordErrors.length > 0"
                autocomplete="new-password"
                @update:model-value="clearErrors"
              >
                <template #prepend-inner>
                  <KeyRound :size="18" class="text-medium-emphasis" />
                </template>
                <template #append-inner>
                  <v-btn
                    size="small"
                    variant="text"
                    :aria-label="showNewPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <Eye v-if="!showNewPassword" :size="18" />
                    <EyeOff v-else :size="18" />
                  </v-btn>
                </template>
              </v-text-field>

              <v-progress-linear
                class="mb-2"
                :color="passwordStrength.color"
                :model-value="passwordStrength.score"
                height="8"
                rounded
              />
              <p class="text-caption text-medium-emphasis mb-3">
                Força da senha: <strong>{{ passwordStrength.label }}</strong>
              </p>

              <v-text-field
                v-model="confirmNewPassword"
                label="Confirmar nova senha"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                class="mb-2"
                :error-messages="confirmPasswordError ? [confirmPasswordError] : []"
                :aria-invalid="Boolean(confirmPasswordError)"
                autocomplete="new-password"
                @update:model-value="clearErrors"
              >
                <template #prepend-inner>
                  <Lock :size="18" class="text-medium-emphasis" />
                </template>
                <template #append-inner>
                  <v-btn
                    size="small"
                    variant="text"
                    :aria-label="showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <Eye v-if="!showConfirmPassword" :size="18" />
                    <EyeOff v-else :size="18" />
                  </v-btn>
                </template>
              </v-text-field>

              <v-btn
                color="primary"
                variant="flat"
                size="large"
                block
                class="mb-2 auth-action"
                :loading="loading"
                :disabled="isSubmitDisabled"
                @click="submitPasswordReset"
              >
                {{ submitLabel }}
              </v-btn>

              <v-btn
                v-if="canRetryVerify"
                variant="text"
                size="small"
                block
                class="mb-3"
                :disabled="isRateLimited || isVerifyingToken"
                @click="verifyToken"
              >
                Validar link novamente
              </v-btn>

              <div class="d-flex align-center justify-space-between mt-2">
                <RouterLink to="/auth/forgot-password" aria-label="Solicitar novo link de recuperação">
                  <v-btn variant="text" size="small" class="text-primary">Solicitar novo link</v-btn>
                </RouterLink>
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-vue-next";
import { useSnackbar } from "@/composables/useSnackbar";
import {
  resetPasswordWithToken,
  verifyPasswordResetToken,
  type PasswordRecoveryError,
} from "@/services/passwordRecovery";
import {
  clearHashFromBrowserUrl,
  getPasswordRulesErrors,
  isPasswordStrong,
  parseResetTokenFromHash,
  validatePasswordRules,
} from "@/utils/passwordRecovery";
import LogoGravaNoisBranco from "@/assets/icons/grava-nois-branco.webp";

type TokenState = "checking" | "valid" | "invalid" | "missing" | "unverified";

const router = useRouter();
const { showSnackbar } = useSnackbar();

const token = ref<string | null>(null);
const tokenState = ref<TokenState>("checking");
const loading = ref(false);
const isVerifyingToken = ref(false);
const generalError = ref("");
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const newPassword = ref("");
const confirmNewPassword = ref("");

const newPasswordErrors = ref<string[]>([]);
const confirmPasswordError = ref("");

const cooldownSeconds = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;
const errorAlertRef = ref<HTMLElement | null>(null);

const isRateLimited = computed(() => cooldownSeconds.value > 0);
const tokenMissing = computed(() => tokenState.value === "missing");
const tokenInvalid = computed(() => tokenState.value === "invalid");
const canRetryVerify = computed(() => tokenState.value === "unverified" || tokenState.value === "checking");

const isSubmitDisabled = computed(() =>
  loading.value
  || isRateLimited.value
  || tokenMissing.value
  || tokenInvalid.value
  || isVerifyingToken.value
);

const submitLabel = computed(() =>
  isRateLimited.value ? `Aguarde ${cooldownSeconds.value}s` : "Redefinir senha"
);

const passwordStrength = computed(() => {
  const rules = validatePasswordRules(newPassword.value);
  const scorePoints = Object.values(rules).filter(Boolean).length;
  const score = scorePoints * 25;

  if (score >= 100) return { score, label: "Forte", color: "success" };
  if (score >= 75) return { score, label: "Boa", color: "light-green-darken-2" };
  if (score >= 50) return { score, label: "Média", color: "warning" };
  if (score >= 25) return { score, label: "Fraca", color: "deep-orange" };
  return { score, label: "Muito fraca", color: "error" };
});

function clearErrors() {
  newPasswordErrors.value = [];
  confirmPasswordError.value = "";
  generalError.value = "";
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

function validateForm() {
  newPasswordErrors.value = getPasswordRulesErrors(newPassword.value);
  confirmPasswordError.value =
    confirmNewPassword.value === newPassword.value ? "" : "As senhas não conferem";

  return newPasswordErrors.value.length === 0 && !confirmPasswordError.value;
}

async function verifyToken() {
  if (!token.value) {
    tokenState.value = "missing";
    return;
  }

  isVerifyingToken.value = true;
  generalError.value = "";

  try {
    const response = await verifyPasswordResetToken(token.value);
    if (response.ok) {
      tokenState.value = "valid";
      return;
    }
    tokenState.value = "invalid";
  } catch (error: any) {
    const parsedError = error as PasswordRecoveryError;

    if (parsedError.status === 429) {
      setCooldown(parsedError.retryAfterSeconds || 60);
      generalError.value = "Muitas tentativas. Aguarde e valide o link novamente.";
      tokenState.value = "unverified";
      return;
    }

    if (parsedError.status && parsedError.status >= 400 && parsedError.status < 500) {
      tokenState.value = "invalid";
      return;
    }

    tokenState.value = "unverified";
    generalError.value = "Não foi possível validar o link agora. Você pode tentar redefinir a senha mesmo assim.";
  } finally {
    isVerifyingToken.value = false;
  }
}

async function submitPasswordReset() {
  clearErrors();

  if (!token.value) {
    tokenState.value = "missing";
    return;
  }

  if (tokenInvalid.value) {
    generalError.value = "Este link não é mais válido. Solicite um novo link de recuperação.";
    return;
  }

  if (!validateForm()) {
    return;
  }

  loading.value = true;
  try {
    const response = await resetPasswordWithToken(token.value, newPassword.value);
    if (!response.ok) {
      generalError.value = "Não foi possível redefinir a senha. Solicite um novo link de recuperação.";
      return;
    }

    showSnackbar("Senha redefinida com sucesso. Faça login com sua nova senha.", "success");
    router.push({ path: "/login", query: { reset: "success" } });
  } catch (error: any) {
    const parsedError = error as PasswordRecoveryError;

    if (parsedError.status === 429) {
      setCooldown(parsedError.retryAfterSeconds || 60);
      generalError.value = "Muitas tentativas. Aguarde e tente novamente.";
      showSnackbar(generalError.value, "warning");
      return;
    }

    if (parsedError.status && parsedError.status >= 400 && parsedError.status < 500) {
      tokenState.value = "invalid";
      generalError.value = "Link inválido, expirado ou já utilizado. Solicite um novo link.";
      showSnackbar(generalError.value, "error");
      return;
    }

    generalError.value = "Erro ao redefinir senha. Tente novamente em instantes.";
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

watch(newPassword, () => {
  if (!newPasswordErrors.value.length) return;
  newPasswordErrors.value = getPasswordRulesErrors(newPassword.value);
});

watch(confirmNewPassword, () => {
  if (!confirmPasswordError.value) return;
  confirmPasswordError.value =
    confirmNewPassword.value === newPassword.value ? "" : "As senhas não conferem";
});

onMounted(async () => {
  const extractedToken = parseResetTokenFromHash(window.location.hash);
  if (window.location.hash) {
    clearHashFromBrowserUrl();
  }

  token.value = extractedToken;

  if (!token.value) {
    tokenState.value = "missing";
    return;
  }

  tokenState.value = "checking";
  await verifyToken();
});

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
});

defineExpose({
  submitPasswordReset,
  verifyToken,
  validateForm,
  isPasswordStrong,
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
