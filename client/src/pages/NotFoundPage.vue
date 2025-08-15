<template>
  <div class="not-found-page d-flex align-center justify-center min-height-screen">
    <v-container class="text-center" fluid>
      <div class="error-content">
        <div class="error-icon mb-6">
          <v-icon :icon="customIcons.alert" size="120" color="error" />
        </div>

        <h1 class="text-h3 font-weight-bold mb-4">404</h1>

        <h2 class="text-h5 font-weight-medium mb-4">Página Não Encontrada</h2>

        <p class="text-h6 text-medium-emphasis mb-6" >
          A página que você está procurando não existe ou foi movida para outro local.
        </p>

        <div class="d-flex justify-center flex-wrap ga-4">
          <v-btn @click="$router.push('/')" color="primary" variant="flat" size="large">
            <v-icon :icon="customIcons.home" class="me-2" />
            Voltar ao Início
          </v-btn>

          <v-btn @click="$router.go(-1)" variant="outlined" size="large"> Página Anterior </v-btn>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { customIcons } from "@/utils/icons";
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(var(--v-theme-error), 0.05) 0%, rgba(var(--v-theme-surface), 1) 100%);
}

/* 
.min-height-screen {
  min-height: 100vh;
}

.error-content {
  margin: 0 auto;
}

.error-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
} */
</style>
