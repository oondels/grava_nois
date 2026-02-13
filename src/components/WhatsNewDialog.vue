<template>
  <v-dialog v-model="show" max-width="480" width="92vw" persistent>
    <v-card class="wn-card rounded-xl pa-5 pa-sm-6" color="surface">
      <!-- Header -->
      <div class="text-center mb-4">
        <img :src="LogoGravaNois" alt="Grava Nóis" class="brand-logo mb-3" />

        <div class="d-flex align-center justify-center ga-2">
          <RocketIcon color="green" :size="22" />
          <h2 class="wn-title text-green">Novidades da versão {{ APP_VERSION }}</h2>
        </div>

        <p class="wn-subtitle mt-1">Veja o que mudou nesta atualização</p>
      </div>

      <v-divider class="mb-4" />

      <!-- Bug fixes -->
      <div class="wn-section mb-4">
        <div class="d-flex align-center ga-2 mb-3">
          <BugOffIcon color="orange" :size="22" />
          <span class="wn-section-title">Correções</span>
        </div>

        <div v-for="(fix, i) in fixes" :key="i" class="wn-item d-flex align-center ga-3 py-2 px-3">
          <CheckCircle2 color="lightgreen" :size="20" />
          <span>{{ fix }}</span>
        </div>
      </div>

      <!-- New features -->
      <div v-if="features.length" class="wn-section mb-4">
        <div class="d-flex align-center ga-2 mb-3">
          <PlusSquareIcon color="green" :size="22" />
          <span class="wn-section-title">Novidades</span>
        </div>

        <div v-for="(feat, i) in features" :key="i" class="wn-item d-flex align-center ga-3 py-2 px-3">
          <Plus color="lightgreen" :size="20" />
          <span>{{ feat }}</span>
        </div>
      </div>

      <!-- Actions -->
      <v-card-actions class="justify-center pt-2">
        <v-btn color="primary" variant="flat" size="large" rounded="lg" min-width="180" @click="dismiss">
          Entendi
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RocketIcon, CheckCircle2, BugOffIcon, PlusSquareIcon, Plus } from "lucide-vue-next";
import LogoGravaNois from "@/assets/icons/grava-nois-branco.webp";

const APP_VERSION = "1.2.0";
const STORAGE_KEY = "whatsNewSeen";

const show = ref(false);

const fixes = [
  "Erro de login no iPhone corrigido",
  "Travamentos resolvidos",
];

const features = [
  "Reset de senha adicionado",
];

function dismiss() {
  show.value = false;
  try {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
  } catch {
    // localStorage indisponível — ignora
  }
}

onMounted(() => {
  try {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== APP_VERSION) {
      show.value = true;
    }
  } catch {
    // localStorage indisponível — não exibe
  }
});
</script>

<style scoped>
.wn-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-logo {
  width: 120px;
  height: auto;
  display: inline-block;
}

.wn-title {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
}

.wn-subtitle {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (min-width: 600px) {
  .brand-logo {
    width: 140px;
  }

  .wn-title {
    font-size: 1.25rem;
  }

  .wn-subtitle {
    font-size: 0.875rem;
  }
}

.wn-section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.7);
}

.wn-item {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  transition: background 0.15s ease;
}

.wn-item:hover {
  background: rgba(255, 255, 255, 0.04);
}
</style>
