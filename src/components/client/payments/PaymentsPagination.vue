<template>
  <v-card variant="outlined" class="mt-4">
    <v-card-text class="d-flex flex-wrap align-center justify-space-between ga-3">
      <div class="text-body-2 text-medium-emphasis">
        {{ summaryText }}
      </div>

      <div class="d-flex align-center ga-2">
        <v-btn
          variant="text"
          :disabled="loading || page <= 1"
          @click="emit('previous')"
        >
          Anterior
        </v-btn>
        <span class="text-body-2">
          Página {{ page }} de {{ totalPages }}
        </span>
        <v-btn
          variant="text"
          :disabled="loading || page >= totalPages"
          @click="emit('next')"
        >
          Próximo
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  previous: [];
  next: [];
}>();

const totalPages = computed(() => {
  if (props.total <= 0 || props.limit <= 0) return 1;
  return Math.max(1, Math.ceil(props.total / props.limit));
});

const rangeStart = computed(() => {
  if (props.total <= 0) return 0;
  return (props.page - 1) * props.limit + 1;
});

const rangeEnd = computed(() => {
  if (props.total <= 0) return 0;
  return Math.min(props.total, props.page * props.limit);
});

const summaryText = computed(() => {
  if (props.total <= 0) {
    return "Nenhum resultado";
  }

  return `${rangeStart.value}–${rangeEnd.value} de ${props.total} pagamentos`;
});
</script>
