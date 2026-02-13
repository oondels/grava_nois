<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="6" lg="4">
        <transition name="fade-slide">
          <v-card elevation="10" class="auth-card rounded-xl overflow-hidden">
            <v-card-title class="text-center pa-6 pb-2">
              <div class="d-flex flex-column align-center justify-center mb-1">
                <img :src="LogoGravaNoisBranco" alt="Grava Nóis" class="brand-logo mb-2" />
                <p class="text-body-2 text-medium-emphasis mb-0">Atualize sua senha com segurança.</p>
              </div>
            </v-card-title>

            <v-card-text class="pa-6 pt-3">
              <v-form ref="formRef" @submit.prevent="submitChangePassword">
                <v-text-field
                  v-model.trim="form.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  class="mb-4"
                  :rules="[rules.email]"
                  :error-messages="serverErrors.email ? [serverErrors.email] : []"
                  autocomplete="email"
                  @update:model-value="clearFieldError('email')"
                >
                  <template #prepend-inner>
                    <Mail :size="18" class="text-medium-emphasis" />
                  </template>
                </v-text-field>

                <v-text-field
                  v-model="form.currentPassword"
                  label="Senha atual"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  variant="outlined"
                  class="mb-4"
                  :rules="[rules.currentPassword]"
                  :error-messages="serverErrors.currentPassword ? [serverErrors.currentPassword] : []"
                  autocomplete="current-password"
                  @update:model-value="clearFieldError('currentPassword')"
                >
                  <template #prepend-inner>
                    <Lock :size="18" class="text-medium-emphasis" />
                  </template>
                  <template #append-inner>
                    <v-btn
                      size="small"
                      variant="text"
                      :aria-label="showCurrentPassword ? 'Ocultar senha atual' : 'Mostrar senha atual'"
                      @click="showCurrentPassword = !showCurrentPassword"
                    >
                      <Eye v-if="!showCurrentPassword" :size="18" />
                      <EyeOff v-else :size="18" />
                    </v-btn>
                  </template>
                </v-text-field>

                <v-text-field
                  v-model="form.newPassword"
                  label="Nova senha"
                  :type="showNewPassword ? 'text' : 'password'"
                  variant="outlined"
                  class="mb-2"
                  :rules="[
                    rules.newPasswordMin,
                    rules.newPasswordUpper,
                    rules.newPasswordLower,
                    rules.newPasswordDigit,
                    rules.newPasswordDifferent,
                  ]"
                  :error-messages="serverErrors.newPassword ? [serverErrors.newPassword] : []"
                  autocomplete="new-password"
                  @update:model-value="clearFieldError('newPassword')"
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
                  v-model="form.confirmNewPassword"
                  label="Confirmar nova senha"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  variant="outlined"
                  class="mb-2"
                  :rules="[rules.confirmNewPassword]"
                  autocomplete="new-password"
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

                <v-alert
                  v-if="generalError"
                  class="mb-4"
                  type="error"
                  variant="tonal"
                  density="compact"
                >
                  {{ generalError }}
                </v-alert>

                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  class="mb-4 auth-action"
                  :loading="loadingAuth"
                  :disabled="loadingAuth || isRateLimited"
                >
                  {{ submitLabel }}
                </v-btn>
              </v-form>

              <div class="d-flex align-center justify-space-between mt-2">
                <span class="text-body-2 text-medium-emphasis">Já lembrou a senha?</span>
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-vue-next";
import { useAuthStore, type ChangePasswordError, type ChangePasswordField } from "@/store/auth";
import { useSnackbar } from "@/composables/useSnackbar";
import LogoGravaNoisBranco from "@/assets/icons/grava-nois-branco.webp";

type FormModel = {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

type ServerFieldErrors = Record<ChangePasswordField, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const auth = useAuthStore();
const { showSnackbar } = useSnackbar();

const formRef = ref<any>(null);
const loadingAuth = ref(false);
const generalError = ref("");

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const form = reactive<FormModel>({
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

const serverErrors = reactive<ServerFieldErrors>({
  email: "",
  currentPassword: "",
  newPassword: "",
});

const cooldownSeconds = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

const isRateLimited = computed(() => cooldownSeconds.value > 0);
const submitLabel = computed(() => {
  if (isRateLimited.value) {
    return `Tente novamente em ${cooldownSeconds.value}s`;
  }
  return "Alterar senha";
});

const passwordChecks = computed(() => ({
  minLength: form.newPassword.length >= 8,
  hasUppercase: /[A-Z]/.test(form.newPassword),
  hasLowercase: /[a-z]/.test(form.newPassword),
  hasDigit: /[0-9]/.test(form.newPassword),
}));

const passwordStrength = computed(() => {
  const scorePoints = Object.values(passwordChecks.value).filter(Boolean).length;
  const score = scorePoints * 25;

  if (score >= 100) return { score, label: "Forte", color: "success" };
  if (score >= 75) return { score, label: "Boa", color: "light-green-darken-2" };
  if (score >= 50) return { score, label: "Média", color: "warning" };
  if (score >= 25) return { score, label: "Fraca", color: "deep-orange" };
  return { score, label: "Muito fraca", color: "error" };
});

const rules = {
  email: (value: string) => EMAIL_PATTERN.test(value) || "Email inválido",
  currentPassword: (value: string) => (value?.length ?? 0) >= 1 || "Senha atual é obrigatória",
  newPasswordMin: (value: string) => value.length >= 8 || "Nova senha deve ter pelo menos 8 caracteres",
  newPasswordUpper: (value: string) => /[A-Z]/.test(value) || "Senha deve conter pelo menos uma letra maiúscula",
  newPasswordLower: (value: string) => /[a-z]/.test(value) || "Senha deve conter pelo menos uma letra minúscula",
  newPasswordDigit: (value: string) => /[0-9]/.test(value) || "Senha deve conter pelo menos um número",
  newPasswordDifferent: (value: string) =>
    value !== form.currentPassword || "A nova senha deve ser diferente da senha atual",
  confirmNewPassword: (value: string) => value === form.newPassword || "As senhas não conferem",
};

function clearFieldError(field: ChangePasswordField) {
  serverErrors[field] = "";
  generalError.value = "";
}

function clearAllServerErrors() {
  serverErrors.email = "";
  serverErrors.currentPassword = "";
  serverErrors.newPassword = "";
  generalError.value = "";
}

function setCooldown(seconds: number) {
  if (cooldownTimer) {
    clearInterval(cooldownTimer);
    cooldownTimer = null;
  }

  cooldownSeconds.value = Math.max(0, Math.floor(seconds));
  if (cooldownSeconds.value <= 0) {
    return;
  }

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

function applyBackendError(error: ChangePasswordError) {
  const status = error.status;
  const fieldErrors = error.fieldErrors || {};

  if (fieldErrors.email) {
    serverErrors.email = fieldErrors.email;
  }
  if (fieldErrors.currentPassword) {
    serverErrors.currentPassword = fieldErrors.currentPassword;
  }
  if (fieldErrors.newPassword) {
    serverErrors.newPassword = fieldErrors.newPassword;
  }

  if (status === 401 && !serverErrors.currentPassword) {
    serverErrors.currentPassword = "Senha atual incorreta.";
  } else if (status === 404 && !serverErrors.email) {
    serverErrors.email = "Email não encontrado.";
  } else if (status === 429) {
    setCooldown(error.retryAfterSeconds || 60);
  }

  if (!serverErrors.email && !serverErrors.currentPassword && !serverErrors.newPassword) {
    generalError.value = error.message || "Não foi possível alterar a senha.";
  }
}

function resetForm() {
  const currentEmail = auth.user?.email?.trim() || "";
  form.email = currentEmail;
  form.currentPassword = "";
  form.newPassword = "";
  form.confirmNewPassword = "";
}

async function submitChangePassword() {
  clearAllServerErrors();

  const validation = await formRef.value?.validate?.();
  const valid = typeof validation === "boolean" ? validation : validation?.valid;
  if (!valid) {
    showSnackbar("Corrija os campos destacados.", "warning");
    return;
  }

  loadingAuth.value = true;
  try {
    const response = await auth.updatePassword({
      email: form.email.trim(),
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });

    showSnackbar(response.message || "Senha alterada com sucesso.", "success");
    resetForm();
    formRef.value?.resetValidation?.();
  } catch (error: any) {
    const backendError = error as ChangePasswordError;
    applyBackendError(backendError);
    showSnackbar(backendError.message || "Erro ao alterar senha.", "error");
  } finally {
    loadingAuth.value = false;
  }
}

const stopUserWatch = watch(
  () => auth.user?.email,
  (email) => {
    if (typeof email === "string" && email.trim() && !form.email) {
      form.email = email.trim();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (auth.user?.email?.trim()) {
    form.email = auth.user.email.trim();
  }
});

onUnmounted(() => {
  stopUserWatch();
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
