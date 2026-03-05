<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">Dashboard</h1>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row class="mb-2">
      <v-col v-for="item in cards" :key="item.label" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4 h-100">
          <div class="text-medium-emphasis mb-1">{{ item.label }}</div>
          <div class="text-h5 font-weight-bold">{{ item.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="7">
        <v-card class="pa-4 h-100">
          <div class="text-subtitle-1 font-weight-medium mb-2">Ativos x Inativos</div>
          <VueApexCharts
            type="bar"
            height="320"
            :options="statusBarOptions"
            :series="statusBarSeries"
          />
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="pa-4 h-100">
          <div class="text-subtitle-1 font-weight-medium mb-2">Distribuição</div>
          <VueApexCharts
            type="donut"
            height="320"
            :options="distributionOptions"
            :series="distributionSeries"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12">
        <v-card class="pa-4">
          <div class="text-subtitle-1 font-weight-medium mb-2">Totais do Sistema</div>
          <VueApexCharts
            type="line"
            height="320"
            :options="totalsLineOptions"
            :series="totalsLineSeries"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { ApexOptions } from "apexcharts";
import VueApexCharts from "vue3-apexcharts";
import { adminService, type DashboardMetrics } from "@/services/admin.service";

const stats = ref<DashboardMetrics | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const chartTextColor = "#c7d0d9";

function formatNumber(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR");
}

const totalUsers = computed(
  () => (stats.value?.totalUsers?.active ?? 0) + (stats.value?.totalUsers?.inactive ?? 0)
);
const totalVenues = computed(
  () => (stats.value?.totalVenues?.online ?? 0) + (stats.value?.totalVenues?.offline ?? 0)
);

const cards = computed(() => [
  { label: "Usuários (Total)", value: formatNumber(totalUsers.value) },
  { label: "Clientes", value: formatNumber(stats.value?.totalClients ?? 0) },
  { label: "Quadras (Total)", value: formatNumber(totalVenues.value) },
  { label: "Vídeos", value: formatNumber(stats.value?.totalVideos ?? 0) },
  { label: "Usuários Ativos", value: formatNumber(stats.value?.totalUsers?.active ?? 0) },
  { label: "Quadras Online", value: formatNumber(stats.value?.totalVenues?.online ?? 0) },
]);

const statusBarOptions = computed<ApexOptions>(() => ({
  chart: {
    toolbar: { show: false },
    foreColor: chartTextColor,
  },
  noData: { text: "Sem dados" },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: "42%",
    },
  },
  xaxis: {
    categories: ["Usuários", "Quadras"],
  },
  yaxis: {
    labels: {
      formatter: (value: number) => Math.round(value).toString(),
    },
  },
  dataLabels: { enabled: false },
  legend: { position: "top" },
  colors: ["#10B981", "#EF4444"],
  grid: {
    borderColor: "rgba(148,163,184,0.18)",
  },
}));

const statusBarSeries = computed(() => [
  {
    name: "Ativo / Online",
    data: [stats.value?.totalUsers?.active ?? 0, stats.value?.totalVenues?.online ?? 0],
  },
  {
    name: "Inativo / Offline",
    data: [stats.value?.totalUsers?.inactive ?? 0, stats.value?.totalVenues?.offline ?? 0],
  },
]);

const distributionOptions = computed<ApexOptions>(() => ({
  chart: {
    foreColor: chartTextColor,
  },
  labels: [
    "Usuários Ativos",
    "Usuários Inativos",
    "Quadras Online",
    "Quadras Offline",
    "Clientes",
  ],
  legend: {
    position: "bottom",
  },
  dataLabels: {
    enabled: true,
    formatter: (value: number) => `${value.toFixed(1)}%`,
  },
  noData: { text: "Sem dados" },
  colors: ["#10B981", "#EF4444", "#3B82F6", "#F97316", "#EAB308"],
  stroke: {
    colors: ["#10151e"],
  },
}));

const distributionSeries = computed(() => [
  stats.value?.totalUsers?.active ?? 0,
  stats.value?.totalUsers?.inactive ?? 0,
  stats.value?.totalVenues?.online ?? 0,
  stats.value?.totalVenues?.offline ?? 0,
  stats.value?.totalClients ?? 0,
]);

const totalsLineOptions = computed<ApexOptions>(() => ({
  chart: {
    toolbar: { show: false },
    foreColor: chartTextColor,
  },
  xaxis: {
    categories: ["Usuários", "Clientes", "Quadras", "Vídeos"],
  },
  yaxis: {
    labels: {
      formatter: (value: number) => Math.round(value).toString(),
    },
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  markers: {
    size: 5,
  },
  noData: { text: "Sem dados" },
  colors: ["#60A5FA"],
  grid: {
    borderColor: "rgba(148,163,184,0.18)",
  },
}));

const totalsLineSeries = computed(() => [
  {
    name: "Quantidade",
    data: [
      totalUsers.value,
      stats.value?.totalClients ?? 0,
      totalVenues.value,
      stats.value?.totalVideos ?? 0,
    ],
  },
]);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await adminService.getDashboardStats();
    stats.value = response.dashboard ?? null;
  } catch (err: any) {
    error.value = err?.message || "Não foi possível carregar o dashboard.";
  } finally {
    loading.value = false;
  }
});
</script>
