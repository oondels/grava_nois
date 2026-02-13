<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">{{ title }}</h1>
    </div>

    <v-alert v-if="usingMock" type="warning" variant="tonal" class="mb-4">
      Não foi possível carregar dados reais. Exibindo dados de demonstração.
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4 d-flex align-center justify-space-between">
          <div>
            <div class="text-medium-emphasis mb-1">Vídeos Gerados</div>
            <div class="text-h4 font-weight-bold">{{ formatNumber(stats?.totalVideos) }}</div>
          </div>
          <div class="rounded-lg bg-black/5 dark:bg-white/10 pa-2">
            <Video :size="28" class="text-primary" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4 d-flex align-center justify-space-between">
          <div>
            <div class="text-medium-emphasis mb-1">Fãs da Quadra (Usuários)</div>
            <div class="text-h4 font-weight-bold">{{ formatNumber(stats?.totalLinkedUsers) }}</div>
          </div>
          <div class="rounded-lg bg-black/5 dark:bg-white/10 pa-2">
            <Users :size="28" class="text-success" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4 d-flex align-center justify-space-between">
          <div>
            <div class="text-medium-emphasis mb-1">Armazenamento</div>
            <div class="text-h4 font-weight-bold">{{ formatStorage(stats?.storageUsed) }}</div>
          </div>
          <div class="rounded-lg bg-black/5 dark:bg-white/10 pa-2">
            <HardDrive :size="28" class="text-info" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Video, Users, HardDrive } from "lucide-vue-next";
import { clientPortalService, type ClientDashboardStats } from "@/services/client-portal.service";

const { title = "Visão Geral" } = defineProps<{ title?: string }>();

const stats = ref<ClientDashboardStats | null>(null);
const loading = ref(false);
const usingMock = ref(false);

const mockStats: ClientDashboardStats = {
  totalVideos: 128,
  totalLinkedUsers: 842,
  storageUsed: "12.4 GB",
};

function formatNumber(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR");
}

function formatStorage(value?: string | number | null) {
  if (value === null || value === undefined) return "—";
  
  // Se já é uma string formatada (ex: "12.4 GB"), retorna diretamente
  if (typeof value === "string" && value.includes("GB")) return value;
  
  // Converte bytes para GB
  const bytes = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(bytes)) return "—";
  
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

onMounted(async () => {
  loading.value = true;
  try {
    const response = await clientPortalService.getDashboardStats();
    
    stats.value = response.stats ?? null;
  } catch {
    usingMock.value = true;
    stats.value = mockStats;
  } finally {
    loading.value = false;
  }
});
</script>
