<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

    <div v-if="isMobile" class="d-flex flex-column ga-3">
      <v-card v-for="payment in items" :key="payment.id" variant="outlined">
        <v-card-text class="d-flex flex-column ga-2">
          <!-- <div class="d-flex align-center justify-space-between ga-3">
            <span class="text-caption text-medium-emphasis">ID</span>
            <span class="text-body-2 font-weight-medium payment-id">{{ payment.id }}</span>
          </div> -->

          <div class="d-flex align-center justify-space-between ga-3">
            <span class="text-caption text-medium-emphasis">Data de criação</span>
            <span class="text-body-2">{{ formatDate(payment.chargedAt) }}</span>
          </div>

          <div class="d-flex align-center justify-space-between ga-3">
            <span class="text-caption text-medium-emphasis">Valor</span>
            <span class="text-body-2 font-weight-medium">{{ formatAmount(payment.amount) }}</span>
          </div>

          <div class="d-flex align-center justify-space-between ga-3">
            <span class="text-caption text-medium-emphasis">Status</span>
            <v-chip size="small" :color="statusColor(payment.status)" variant="tonal">
              {{ formatStatus(payment.status) }}
            </v-chip>
          </div>

          <div class="d-flex align-center justify-space-between ga-3">
            <span class="text-caption text-medium-emphasis">Método</span>
            <span class="text-body-2">{{ formatMethod(payment.method) }}</span>
          </div>

          <div class="d-flex align-center justify-space-between ga-3">
            <span class="text-caption text-medium-emphasis">Link de pagamento</span>
            <div class="d-flex align-center ga-2">
              <span v-if="!hasPaymentUrl(payment)" class="text-body-2 text-medium-emphasis">—</span>
              <!-- <a
                v-else
                :href="getPaymentUrl(payment)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-caption text-primary text-link"
              >
                {{ truncateLink(getPaymentUrl(payment)) }}
              </a> -->
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                :disabled="!hasPaymentUrl(payment)"
                @click="emit('openPayment', payment)"
              >
                Abrir pagamento
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-table v-else>
      <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">Data de criação</th>
          <th class="text-left">Valor (BRL)</th>
          <th class="text-left">Status</th>
          <th class="text-left">Método</th>
          <th class="text-left">Link de pagamento</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="payment in items" :key="payment.id">
          <td>
            <span class="payment-id">{{ payment.id }}</span>
          </td>
          <td>{{ formatDate(payment.chargedAt) }}</td>
          <td class="font-weight-medium">{{ formatAmount(payment.amount) }}</td>
          <td>
            <v-chip size="small" :color="statusColor(payment.status)" variant="tonal">
              {{ formatStatus(payment.status) }}
            </v-chip>
          </td>
          <td>{{ formatMethod(payment.method) }}</td>
          <td>
            <div class="d-flex align-center ga-2">
              <span v-if="!hasPaymentUrl(payment)" class="text-medium-emphasis">—</span>
              <a
                v-else
                :href="getPaymentUrl(payment)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-caption text-primary text-link"
              >
                {{ truncateLink(getPaymentUrl(payment)) }}
              </a>
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                :disabled="!hasPaymentUrl(payment)"
                @click="emit('openPayment', payment)"
              >
                Abrir pagamento
              </v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";
import type { PaymentListItem, PaymentMethod, PaymentStatus } from "@/types/payments";

interface Props {
  items: PaymentListItem[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  openPayment: [payment: PaymentListItem];
}>();

const display = useDisplay();
const isMobile = computed(() => display.smAndDown.value);

const formatDate = (value?: string | null): string => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
};

const formatAmount = (value: string): string => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "—";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
};

const formatStatus = (status: PaymentStatus): string => {
  if (status === "pending") return "Pendente";
  if (status === "paid") return "Pago";
  if (status === "failed") return "Falhou";
  if (status === "refunded") return "Reembolsado";
  if (status === "partially_refunded") return "Parcialmente reembolsado";
  if (status === "canceled") return "Cancelado";
  return status;
};

const statusColor = (status: PaymentStatus): string => {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "error";
  if (status === "canceled") return "default";
  if (status === "refunded" || status === "partially_refunded") return "info";
  return "default";
};

const formatMethod = (method?: PaymentMethod | null): string => {
  if (!method) return "—";
  if (method === "card") return "Cartão";
  if (method === "pix") return "PIX";
  if (method === "boleto") return "Boleto";
  if (method === "cash") return "Dinheiro";
  return method;
};

const hasPaymentUrl = (payment: PaymentListItem): boolean => {
  return Boolean(payment.paymentUrl?.trim());
};

const getPaymentUrl = (payment: PaymentListItem): string => {
  return payment.paymentUrl?.trim() ?? "";
};

const truncateLink = (value: string): string => {
  if (value.length <= 28) return value;
  return `${value.slice(0, 28)}...`;
};
</script>

<style scoped>
.payment-id {
  font-family: "Roboto Mono", monospace;
  font-size: 0.8125rem;
}

.text-link {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
