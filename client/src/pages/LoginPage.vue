<template>
  <div class="login-page d-flex align-center justify-center min-height-screen">
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="5" lg="4">
          <v-card elevation="8" class="login-card">
            <!-- Header -->
            <v-card-title class="text-center pa-6 pb-4">
              <div class="d-flex align-center justify-center mb-3">
                <v-icon color="primary" size="48" class="me-3">
                  {{ customIcons.play }}
                </v-icon>
                <div>
                  <h1 class="text-h4 text-primary font-weight-bold">
                    SportClips
                  </h1>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Seus melhores lances em alta qualidade
                  </p>
                </div>
              </div>
            </v-card-title>

            <v-card-text class="pa-6 pt-2">
              <v-form @submit.prevent="handleLogin" ref="loginForm">
                <v-text-field
                  v-model="loginData.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  class="mb-4"
                  autofocus
                />
                
                <v-text-field
                  v-model="loginData.password"
                  label="Senha"
                  type="password"
                  variant="outlined"
                  :rules="[rules.required]"
                  class="mb-6"
                />
                
                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  :loading="authStore.loading"
                  class="mb-4"
                >
                  Entrar
                </v-btn>
              </v-form>

              <!-- Demo Mode -->
              <v-divider class="my-4" />
              
              <div class="text-center">
                <p class="text-body-2 text-medium-emphasis mb-3">
                  Ou explore nossa demonstração
                </p>
                
                <v-btn
                  @click="handleDemoLogin"
                  variant="outlined"
                  color="secondary"
                  :loading="authStore.loading"
                  block
                >
                  <v-icon :icon="customIcons.play" class="me-2" />
                  Ver Demonstração
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Features -->
          <div class="mt-6">
            <v-row>
              <v-col cols="12" md="4" class="text-center">
                <v-icon color="primary" size="32" class="mb-2">
                  {{ customIcons.cloudDownload }}
                </v-icon>
                <h3 class="text-body-1 font-weight-medium mb-1">
                  Downloads Rápidos
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  Baixe seus lances em alta qualidade
                </p>
              </v-col>
              
              <v-col cols="12" md="4" class="text-center">
                <v-icon color="primary" size="32" class="mb-2">
                  {{ customIcons.filter }}
                </v-icon>
                <h3 class="text-body-1 font-weight-medium mb-1">
                  Filtros Inteligentes
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  Encontre exatamente o que procura
                </p>
              </v-col>
              
              <v-col cols="12" md="4" class="text-center">
                <v-icon color="primary" size="32" class="mb-2">
                  {{ customIcons.check }}
                </v-icon>
                <h3 class="text-body-1 font-weight-medium mb-1">
                  Pagamento Seguro
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  Transações protegidas e confiáveis
                </p>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useClipsStore } from '@/store/clips'
import { customIcons } from '@/utils/icons'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const authStore = useAuthStore()
const clipsStore = useClipsStore()
const { showSnackbar } = useSnackbar()

const loginForm = ref()
const loginData = reactive({
  email: '',
  password: ''
})

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  }
}

const handleLogin = async () => {
  const { valid } = await loginForm.value.validate()
  
  if (valid) {
    const success = await authStore.login(loginData.email, loginData.password)
    
    if (success) {
      showSnackbar('Login realizado com sucesso!', 'success')
      router.push('/meus-lances')
    } else {
      showSnackbar('Erro ao fazer login. Tente novamente.', 'error')
    }
  }
}

const handleDemoLogin = async () => {
  await authStore.loginDemo()
  showSnackbar('Bem-vindo ao modo demonstração!', 'info')
  router.push('/meus-lances')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(var(--v-theme-primary), 0.1) 0%, 
    rgba(var(--v-theme-secondary), 0.05) 100%
  );
}

.login-card {
  backdrop-filter: blur(10px);
}

.min-height-screen {
  min-height: 100vh;
}
</style>