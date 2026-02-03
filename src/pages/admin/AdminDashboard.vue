<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">Dashboard</h1>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row>
      <v-col v-for="item in cards" :key="item.label" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4">
          <div class="text-medium-emphasis mb-1">{{ item.label }}</div>
          <div class="text-h5 font-weight-bold">{{ item.value }}</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { adminService, type DashboardStats } from "@/services/admin.service";

const stats = ref<DashboardStats | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

function formatNumber(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR");
}

const cards = computed(() => [
  { label: "Usuários Ativos", value: formatNumber(stats.value?.totalUsers?.active ?? null) },
  { label: "Usuários Inativos", value: formatNumber(stats.value?.totalUsers?.inactive ?? null) },
  { label: "Clientes", value: formatNumber(stats.value?.totalClients ?? null) },
  { label: "Quadras Online", value: formatNumber(stats.value?.totalVenues?.online ?? null) },
  { label: "Quadras Offline", value: formatNumber(stats.value?.totalVenues?.offline ?? null) },
  { label: "Vídeos", value: formatNumber(stats.value?.totalVideos ?? null) },
]);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await adminService.getDashboardStats();
    stats.value = response.data;
  } catch (err: any) {
    error.value = err?.message || "Não foi possível carregar o dashboard.";
  } finally {
    loading.value = false;
  }
});
</script>
