<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">Quadras</h1>
    </div>

    <v-card>
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          item-value="id"
        >
          <template #item.name="{ item }">
            <div class="font-weight-medium">{{ getVenueName(item) }}</div>
          </template>

          <template #item.client="{ item }">
            {{ getClientName(item) }}
          </template>

          <template #item.paymentStatus="{ item }">
            <v-chip size="small" :color="paymentColor(item.paymentStatus)" variant="tonal">
              {{ formatPaymentStatus(item.paymentStatus) }}
            </v-chip>
          </template>

          <template #item.isOnline="{ item }">
            <v-icon :color="item.isOnline ? 'success' : 'error'">
              {{ item.isOnline ? "mdi-wifi" : "mdi-wifi-off" }}
            </v-icon>
            <span class="ms-2">{{ item.isOnline ? "Online" : "Offline" }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { adminService, type AdminVenue } from "@/services/admin.service";

const headers = [
  { title: "Nome da Quadra", key: "name" },
  { title: "Cliente (Dono)", key: "client" },
  { title: "Status Pagamento", key: "paymentStatus" },
  { title: "Online/Offline", key: "isOnline" },
];

const items = ref<AdminVenue[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

function getVenueName(venue: AdminVenue) {
  return (
    (venue as any).venueName ||
    (venue as any).name ||
    (venue as any).quadraName ||
    (venue as any).title ||
    "—"
  );
}

function getClientName(venue: AdminVenue) {
  const client = venue.client;
  if (!client) return "—";
  return client.tradeName || client.legalName || "—";
}

function formatPaymentStatus(status?: string | null) {
  if (!status) return "Não informado";
  if (status === "past_due") return "Em atraso";
  if (status === "active") return "Ativo";
  if (status === "canceled") return "Cancelado";
  if (status === "none") return "Sem cobrança";
  return status;
}

function paymentColor(status?: string | null) {
  if (status === "active") return "success";
  if (status === "past_due") return "warning";
  if (status === "canceled") return "error";
  return "default";
}

async function fetchVenues() {
  loading.value = true;
  error.value = null;
  try {
    const response = await adminService.getVenues();
    console.log(response);
    
    items.value = response;
  } catch (err: any) {
    error.value = err?.message || "Não foi possível carregar as quadras.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchVenues);
</script>
