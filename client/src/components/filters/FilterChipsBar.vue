<template>
  <v-sheet class="filter-bar px-3 py-2 d-flex align-center ga-2 overflow-x-auto" color="surface" elevation="1">
    <!-- Scrollable chips (mobile-first) -->
    <div class="chips-row d-flex align-center ga-2 flex-nowrap">
      <!-- Ação Filtros (mobile) -->
      <v-btn
        class="d-sm-none"
        color="secondary"
        @click="$emit('open-filters')"
        variant="outlined"
      >
        Filtros
      </v-btn>

      <v-chip
        v-for="sport in sports"
        :key="sport.value"
        :color="sport.selected ? 'primary' : undefined"
        :variant="sport.selected ? 'flat' : 'tonal'"
        size="small"
        class="chip"
        @click="$emit('toggle-sport', sport.value)"
      >
        <v-icon v-if="sport.icon" :icon="sport.icon" size="16" class="me-1" />
        {{ sport.label }}
      </v-chip>

      <v-chip
        :color="estado ? 'primary' : undefined"
        :variant="estado ? 'flat' : 'tonal'"
        size="small"
        class="chip"
        @click="$emit('open-filters')"
      >
        Estado
        <template #append>
          <v-btn
            v-if="estado"
            icon
            size="x-small"
            variant="text"
            class="ms-1"
            aria-label="Limpar estado"
            @click.stop="$emit('clear-estado')"
          >
            <v-icon icon="mdi-close" size="14" />
          </v-btn>
        </template>
      </v-chip>

      <v-chip
        :color="cidade ? 'primary' : undefined"
        :variant="cidade ? 'flat' : 'tonal'"
        size="small"
        class="chip"
        @click="$emit('open-filters')"
      >
        Cidade
        <template #append>
          <v-btn
            v-if="cidade"
            icon
            size="x-small"
            variant="text"
            class="ms-1"
            aria-label="Limpar cidade"
            @click.stop="$emit('clear-cidade')"
          >
            <v-icon icon="mdi-close" size="14" />
          </v-btn>
        </template>
      </v-chip>

      <v-chip
        :color="quadra ? 'primary' : undefined"
        :variant="quadra ? 'flat' : 'tonal'"
        size="small"
        class="chip"
        @click="$emit('open-filters')"
      >
        Quadra
        <template #append>
          <v-btn
            v-if="quadra"
            icon
            size="x-small"
            variant="text"
            class="ms-1"
            aria-label="Limpar quadra"
            @click.stop="$emit('clear-quadra')"
          >
            <v-icon icon="mdi-close" size="14" />
          </v-btn>
        </template>
      </v-chip>

      <v-chip size="small" variant="tonal" class="chip" @click="$emit('open-filters')"> Data/Hora </v-chip>
      <v-chip size="small" variant="tonal" class="chip" @click="$emit('open-filters')"> Duração </v-chip>
      <v-chip size="small" variant="tonal" class="chip" @click="$emit('open-filters')"> Preço </v-chip>
    </div>

    <v-spacer />

    <!-- Ordenação -->
    <v-select
      class="ms-2 sort-select d-none d-sm-flex"
      :items="sortOptions"
      v-model="internalSort"
      variant="outlined"
      hide-details
      density="comfortable"
      style="min-width: 210px"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface ChipItem {
  label: string;
  value: string;
  selected?: boolean;
  icon?: string;
}

interface Props {
  sports: ChipItem[];
  estado: string | null;
  cidade: string | null;
  quadra: string | null;
  sort: string;
  sortOptions: string[];
  filterIcon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filterIcon: "mdi-filter",
});

const emit = defineEmits([
  "update:sort",
  "open-filters",
  "toggle-sport",
  "clear-estado",
  "clear-cidade",
  "clear-quadra",
]);

const internalSort = ref(props.sort);
watch(
  () => props.sort,
  (v) => (internalSort.value = v)
);
watch(internalSort, (v) => emit("update:sort", v));
</script>

<style scoped>
.filter-bar {
  position: sticky;
  top: var(--gn-sticky-top, 64px);
  z-index: 10;
  border-radius: 16px;
}
.chips-row {
  -webkit-overflow-scrolling: touch;
}
.chip {
  border-radius: 16px;
}

/* Mobile-first touch targets */
.chip :deep(.v-chip__underlay),
.chip :deep(.v-chip__content) {
  min-height: 44px;
}

@media (min-width: 600px) {
  .chip :deep(.v-chip__underlay),
  .chip :deep(.v-chip__content) {
    min-height: 36px;
  }
}
.sort-select :deep(.v-field) {
  border-radius: 14px;
}
</style>
