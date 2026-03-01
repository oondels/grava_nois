import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { clientPaymentsService } from "@/services/client-payments.service";
import type {
  ClientPaymentsFilters,
  ClientPaymentsQuery,
  PaymentListItem,
} from "@/types/payments";

const DEFAULT_LIMIT = 20;
const FILTER_DEBOUNCE_MS = 300;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Não foi possível carregar os pagamentos. Tente novamente.";
};

const toQuery = (
  page: number,
  limit: number,
  filters: ClientPaymentsFilters
): ClientPaymentsQuery => {
  return {
    page,
    limit,
    status: filters.status || undefined,
    provider: filters.provider || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };
};

export function useClientPayments() {
  const items = ref<PaymentListItem[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(DEFAULT_LIMIT);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const filters = reactive<ClientPaymentsFilters>({
    status: "",
    provider: "",
    from: "",
    to: "",
  });

  let activeRequest = 0;
  let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  const totalPages = computed(() => {
    if (total.value <= 0) return 1;
    return Math.max(1, Math.ceil(total.value / limit.value));
  });

  const hasPreviousPage = computed(() => page.value > 1);
  const hasNextPage = computed(() => page.value < totalPages.value);
  const showEmptyState = computed(() => !loading.value && !error.value && items.value.length === 0);
  const hasActiveFilters = computed(() => {
    return Boolean(filters.status || filters.provider || filters.from || filters.to);
  });

  const fetchPayments = async (): Promise<void> => {
    const requestId = ++activeRequest;
    loading.value = true;
    error.value = null;

    try {
      const response = await clientPaymentsService.list(
        toQuery(page.value, limit.value, filters)
      );

      if (requestId !== activeRequest) {
        return;
      }

      items.value = response.items;
      total.value = response.total;
      page.value = response.page;
      limit.value = response.limit;
    } catch (err: unknown) {
      if (requestId !== activeRequest) {
        return;
      }

      items.value = [];
      total.value = 0;
      error.value = getErrorMessage(err);
    } finally {
      if (requestId === activeRequest) {
        loading.value = false;
      }
    }
  };

  const queueFetchWithFilters = (): void => {
    if (filterDebounceTimer) {
      clearTimeout(filterDebounceTimer);
    }

    filterDebounceTimer = setTimeout(() => {
      if (page.value !== 1) {
        page.value = 1;
        return;
      }

      void fetchPayments();
    }, FILTER_DEBOUNCE_MS);
  };

  const clearFilters = (): void => {
    filters.status = "";
    filters.provider = "";
    filters.from = "";
    filters.to = "";
  };

  const goToPreviousPage = (): void => {
    if (!hasPreviousPage.value) return;
    page.value -= 1;
  };

  const goToNextPage = (): void => {
    if (!hasNextPage.value) return;
    page.value += 1;
  };

  watch(page, () => {
    void fetchPayments();
  }, { immediate: true });

  watch(
    () => [filters.status, filters.provider, filters.from, filters.to],
    () => {
      queueFetchWithFilters();
    }
  );

  onBeforeUnmount(() => {
    if (filterDebounceTimer) {
      clearTimeout(filterDebounceTimer);
    }
  });

  return {
    items,
    total,
    page,
    limit,
    loading,
    error,
    filters,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    showEmptyState,
    hasActiveFilters,
    fetchPayments,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
  };
}
