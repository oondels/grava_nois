<template>
  <v-container fluid class="py-6">
    <div class="d-flex flex-wrap align-center justify-space-between mb-4 gap-3">
      <div>
        <h1 class="text-h5 font-weight-bold">{{ title }}</h1>
        <div class="text-caption text-medium-emphasis">Acompanhe sua assinatura e faturas</div>
      </div>
      <v-btn color="primary" class="font-weight-medium">
        <BanknoteIcon/>
        {{ actionLabel }}
      </v-btn>
    </div>

    <v-alert v-if="usingMock" type="warning" variant="tonal" class="mb-4">
      Não foi possível carregar dados reais. Exibindo dados de demonstração.
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row class="mb-2">
      <v-col cols="12" md="5">
        <v-card class="overflow-hidden">
          <div
            class="px-5 py-4 flex items-center justify-between bg-gradient-to-br"
            :class="statusBackground"
          >
            <div>
              <div class="text-caption uppercase tracking-wider text-white/80">Status da Assinatura</div>
              <div class="text-h5 font-weight-bold text-white">{{ statusLabel }}</div>
              <div class="text-caption text-white/80" v-if="subscription?.nextBillingDate">
                Próxima cobrança: {{ formatDate(subscription?.nextBillingDate) }}
              </div>
            </div>
            <div class="rounded-full bg-white/20 pa-3">
              <wallet2-icon class="h-8 w-8 text-white" />
            </div>
          </div>
          <!-- <v-card-text class="pt-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Plano</div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ subscription?.planName || "Plano Essencial" }}
                </div>
              </div>
              <v-chip size="small" :color="statusColor" variant="tonal">
                {{ statusLabel }}
              </v-chip>
            </div>
          </v-card-text> -->
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card class="h-100">
          <v-card-title class="text-subtitle-1 font-weight-bold">Histórico de Faturas</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="invoices"
              :loading="loading"
              item-value="reference"
              class="rounded-lg"
            >
              <template #item.date="{ item }">
                <div class="font-weight-medium">{{ formatDate(item.date) }}</div>
              </template>

              <template #item.amount="{ item }">
                <div class="font-weight-medium">{{ formatCurrency(item.amount) }}</div>
              </template>

              <template #item.status="{ item }">
                <v-chip size="small" :color="invoiceColor(item.status)" variant="tonal">
                  {{ formatInvoiceStatus(item.status) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  clientPortalService,
  type ClientInvoice,
  type ClientSubscriptionStatus,
} from "@/services/client-portal.service";
import {BanknoteIcon, Wallet2, Wallet2Icon} from "lucide-vue-next"

const { title = "Financeiro" } = defineProps<{ title?: string }>();

const loading = ref(false);
const usingMock = ref(false);
const subscription = ref<ClientSubscriptionStatus | null>(null);
const invoices = ref<ClientInvoice[]>([]);

const headers = [
  { title: "Data", key: "date" },
  { title: "Valor", key: "amount" },
  { title: "Referência", key: "reference" },
  { title: "Status", key: "status" },
];

const mockSubscription: ClientSubscriptionStatus = {
  status: "active",
  planName: "Plano Essencial",
  nextBillingDate: "2026-02-15",
};

const mockInvoices: ClientInvoice[] = [
  { date: "2026-02-01", amount: 129.9, reference: "FAT-2026-02", status: "pending" },
  { date: "2026-01-01", amount: 129.9, reference: "FAT-2026-01", status: "paid" },
  { date: "2025-12-01", amount: 129.9, reference: "FAT-2025-12", status: "paid" },
];

const statusLabel = computed(() => {
  if (!subscription.value) return "—";
  if (subscription.value.status === "active") return "Ativa";
  if (subscription.value.status === "pending") return "Pendente";
  if (subscription.value.status === "past_due") return "Em atraso";
  if (subscription.value.status === "canceled") return "Cancelada";
  return "—";
});

const statusColor = computed(() => {
  if (!subscription.value) return "default";
  if (subscription.value.status === "active") return "success";
  if (subscription.value.status === "pending") return "warning";
  if (subscription.value.status === "past_due") return "error";
  if (subscription.value.status === "canceled") return "grey";
  return "default";
});

const statusBackground = computed(() => {
  if (!subscription.value) return "from-slate-500 via-slate-600 to-slate-700";
  if (subscription.value.status === "active") return "from-emerald-500 via-emerald-600 to-teal-700";
  if (subscription.value.status === "pending") return "from-amber-500 via-amber-600 to-orange-700";
  if (subscription.value.status === "past_due") return "from-rose-500 via-rose-600 to-red-700";
  if (subscription.value.status === "canceled") return "from-slate-500 via-slate-600 to-slate-700";
  return "from-slate-500 via-slate-600 to-slate-700";
});

const actionLabel = computed(() => {
  if (!subscription.value) return "Pagar Fatura";
  return subscription.value.status === "active" ? "Pagar Fatura" : "Regularizar";
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatInvoiceStatus(status: ClientInvoice["status"]) {
  return status === "paid" ? "Pago" : "Pendente";
}

function invoiceColor(status: ClientInvoice["status"]) {
  return status === "paid" ? "success" : "warning";
}

onMounted(async () => {
  loading.value = true;
  try {
    const [subscriptionResponse, invoicesResponse] = await Promise.all([
      clientPortalService.getSubscriptionStatus(),
      clientPortalService.getInvoices(),
    ]);
    subscription.value = subscriptionResponse;
    invoices.value = invoicesResponse;
  } catch {
    usingMock.value = true;
    subscription.value = mockSubscription;
    invoices.value = mockInvoices;
  } finally {
    loading.value = false;
  }
});
</script>
