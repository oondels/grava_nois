<template>
  <v-container fluid class="py-6">
    <div class="d-flex flex-wrap align-center justify-space-between mb-4 ga-3">
      <div>
        <h1 class="text-h5 font-weight-bold">Pagamentos</h1>
        <div class="text-caption text-medium-emphasis">
          Acompanhe cobranças, status e acesso ao link de pagamento.
        </div>
      </div>
    </div>

    <PaymentFilters
      :model-value="filters"
      :loading="loading"
      @update:model-value="handleFiltersUpdate"
      @clear="clearFilters"
    />

    <v-card>
      <v-card-text>
        <ErrorState
          v-if="error"
          :description="error"
          @retry="fetchPayments"
        />

        <EmptyState
          v-else-if="showEmptyState"
          title="Nenhum pagamento encontrado"
          description="Não existem pagamentos para os filtros selecionados."
          :action-text="hasActiveFilters ? 'Limpar filtros' : undefined"
          :action-handler="hasActiveFilters ? clearFilters : undefined"
        />

        <PaymentsTable
          v-else
          :items="items"
          :loading="loading"
          @open-payment="handleOpenPayment"
        />
      </v-card-text>
    </v-card>

    <PaymentsPagination
      v-if="!error && (total > 0 || loading)"
      :total="total"
      :page="page"
      :limit="limit"
      :loading="loading"
      @previous="goToPreviousPage"
      @next="goToNextPage"
    />
  </v-container>
</template>

<script setup lang="ts">
import EmptyState from "@/components/EmptyState.vue";
import ErrorState from "@/components/ErrorState.vue";
import PaymentFilters from "@/components/client/payments/PaymentFilters.vue";
import PaymentsPagination from "@/components/client/payments/PaymentsPagination.vue";
import PaymentsTable from "@/components/client/payments/PaymentsTable.vue";
import { useClientPayments } from "@/composables/useClientPayments";
import { useSnackbar } from "@/composables/useSnackbar";
import type { ClientPaymentsFilters, PaymentListItem } from "@/types/payments";

const { showSnackbar } = useSnackbar();

const {
  items,
  total,
  page,
  limit,
  loading,
  error,
  filters,
  showEmptyState,
  hasActiveFilters,
  fetchPayments,
  clearFilters,
  goToPreviousPage,
  goToNextPage,
} = useClientPayments();

const handleFiltersUpdate = (value: ClientPaymentsFilters): void => {
  filters.status = value.status;
  filters.provider = value.provider;
  filters.from = value.from;
  filters.to = value.to;
};

const handleOpenPayment = (payment: PaymentListItem): void => {
  const paymentUrl = payment.paymentUrl?.trim();
  if (!paymentUrl) {
    showSnackbar("Este pagamento ainda não possui link disponível.", "warning");
    return;
  }

  if (typeof window !== "undefined") {
    window.open(paymentUrl, "_blank", "noopener,noreferrer");
  }
};
</script>
