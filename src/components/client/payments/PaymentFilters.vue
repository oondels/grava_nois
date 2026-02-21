<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            label="Status"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            :items="statusOptions"
            item-title="title"
            item-value="value"
            :disabled="loading"
            :model-value="modelValue.status || null"
            @update:model-value="onStatusChange"
          />
        </v-col>

        <!-- <v-col cols="12" sm="6" md="3">
          <v-select
            label="Provedor"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            :items="providerOptions"
            item-title="title"
            item-value="value"
            :disabled="loading"
            :model-value="modelValue.provider || null"
            @update:model-value="onProviderChange"
          />
        </v-col> -->

        <v-col cols="12" sm="6" md="2">
          <v-text-field
            label="De"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            :disabled="loading"
            :model-value="modelValue.from"
            @update:model-value="onFromChange"
          />
        </v-col>

        <v-col cols="12" sm="6" md="2">
          <v-text-field
            label="Até"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            :disabled="loading"
            :model-value="modelValue.to"
            @update:model-value="onToChange"
          />
        </v-col>

        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn
            block
            variant="text"
            color="primary"
            :disabled="loading || !hasAnyFilter"
            @click="emit('clear')"
          >
            Limpar filtros
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  ClientPaymentsFilters,
  PaymentProvider,
  PaymentStatus,
} from "@/types/payments";

interface Props {
  modelValue: ClientPaymentsFilters;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: ClientPaymentsFilters];
  clear: [];
}>();

const statusOptions: Array<{ title: string; value: PaymentStatus }> = [
  { title: "Pendente", value: "pending" },
  { title: "Pago", value: "paid" },
  { title: "Falhou", value: "failed" },
  { title: "Reembolsado", value: "refunded" },
  { title: "Parcialmente reembolsado", value: "partially_refunded" },
  { title: "Cancelado", value: "canceled" },
];

const providerOptions: Array<{ title: string; value: PaymentProvider }> = [
  { title: "Stripe", value: "stripe" },
  { title: "Mercado Pago", value: "mercado_pago" },
  { title: "Abacate Pay", value: "abacate_pay" },
  { title: "Manual", value: "manual" },
];

const hasAnyFilter = computed(() => {
  return Boolean(
    props.modelValue.status ||
      props.modelValue.provider ||
      props.modelValue.from ||
      props.modelValue.to
  );
});

const updateFilters = (patch: Partial<ClientPaymentsFilters>): void => {
  emit("update:modelValue", {
    ...props.modelValue,
    ...patch,
  });
};

const onStatusChange = (value: PaymentStatus | null): void => {
  updateFilters({ status: value ?? "" });
};

const onProviderChange = (value: PaymentProvider | null): void => {
  updateFilters({ provider: value ?? "" });
};

const onFromChange = (value: string | null): void => {
  updateFilters({ from: value ?? "" });
};

const onToChange = (value: string | null): void => {
  updateFilters({ to: value ?? "" });
};
</script>
