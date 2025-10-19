<template>
  <div class="maintenance-page d-flex align-center justify-center">
    <v-container class="text-center" fluid>
      <div class="mm-card mx-auto">
        <div class="mm-icon mb-6">
          <v-icon :icon="customIcons.alert" size="96" color="warning" />
        </div>

        <h1 class="mm-title">Modo de manutenção</h1>
        <p class="mm-subtitle">Estamos realizando alguns ajustes e voltaremos em breve. Obrigado pela compreensão.</p>

        <div class="mm-actions d-flex justify-center flex-wrap ga-3 mt-6">
          <!-- <v-btn @click="reload" color="primary" variant="   e"> Ir para o início </v-btn> -->

          <p>
            Dúvidas entre em contato por:
            <a class="stronger text-green underline" href="https://wa.me/5575982466703">Whatsapp</a>
          </p>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { customIcons } from "@/utils/icons";

const reload = () => {
  if (typeof window !== "undefined") window.location.reload();
};
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  position: relative;
  padding: 32px 16px;
  background: radial-gradient(1200px 600px at 10% -10%, rgba(var(--v-theme-warning), 0.08), transparent 60%),
    radial-gradient(900px 500px at 95% 10%, rgba(var(--v-theme-primary), 0.06), transparent 60%),
    linear-gradient(180deg, #0b0c0f 0%, #0a0a0a 100%);
}

.mm-card {
  max-width: 820px;
  padding: 32px 24px;
  border-radius: 16px;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mm-icon {
  animation: float 4s ease-in-out infinite;
}

.mm-title {
  margin: 0 0 8px;
  font-size: clamp(20px, 4vw, 32px);
  font-weight: 700;
}

.mm-subtitle {
  margin: 0 auto;
  max-width: 56ch;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@media (min-width: 960px) {
  .mm-card {
    padding: 40px 36px;
  }
}
</style>
