<template>
  <v-card class="mb-4" elevation="1">
    <v-card-text>
      <!-- Filter Header -->
      <div class="d-flex align-center justify-space-between mb-3">
        <h3 class="text-h6 font-weight-medium">
          <v-icon :icon="customIcons.filter" class="me-2" />
          Filtros
        </h3>
        
        <v-btn 
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          variant="text"
          size="small"
          color="error"
        >
          Limpar filtros
        </v-btn>
      </div>

      <!-- Filters Row 1: Sports -->
      <div class="mb-3">
        <p class="text-body-2 text-medium-emphasis mb-2">Esportes</p>
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="sport in availableSports"
            :key="sport.value"
            @click="toggleSportFilter(sport.value)"
            :color="selectedSports.includes(sport.value) ? getSportColor(sport.value) : 'default'"
            :variant="selectedSports.includes(sport.value) ? 'flat' : 'outlined'"
            class="sport-filter-chip"
            size="small"
          >
            <v-icon :icon="sport.icon" size="16" class="me-1" />
            {{ sport.label }}
          </v-chip>
        </div>
      </div>

      <!-- Filters Row 2: Status & Date -->
      <v-row>
        <v-col cols="12" md="6">
          <p class="text-body-2 text-medium-emphasis mb-2">Status</p>
          <v-select
            v-model="selectedStatus"
            :items="availableStatus"
            label="Filtrar por status"
            variant="outlined"
            density="compact"
            multiple
            clearable
            hide-details
          />
        </v-col>
        
        <v-col cols="12" md="6">
          <p class="text-body-2 text-medium-emphasis mb-2">Período</p>
          <div class="d-flex ga-2">
            <v-text-field
              v-model="dateRange[0]"
              type="date"
              label="Data inicial"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-text-field
              v-model="dateRange[1]"
              type="date"
              label="Data final"
              variant="outlined"
              density="compact"
              hide-details
            />
          </div>
        </v-col>
      </v-row>

      <!-- Active Filters Summary -->
      <div v-if="hasActiveFilters" class="mt-3 pt-3" style="border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));">
        <div class="d-flex flex-wrap ga-1">
          <v-chip 
            v-for="filter in activeFiltersDisplay"
            :key="filter.key"
            @click:close="removeFilter(filter.key, filter.value)"
            size="small"
            closable
            color="primary"
            variant="tonal"
          >
            {{ filter.label }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useClipsStore } from '@/store/clips'
import { customIcons } from '@/utils/icons'
import { getSportColor, getSportIcon, getSportLabel, getStatusLabel } from '@/utils/formatters'

const clipsStore = useClipsStore()

const availableSports = [
  { value: 'futebol', label: 'Futebol', icon: customIcons.soccer },
  { value: 'basquete', label: 'Basquete', icon: customIcons.basketball },
  { value: 'volei', label: 'Vôlei', icon: customIcons.volleyball },
  { value: 'futevolei', label: 'Futevôlei', icon: customIcons.volleyball }
]

const availableStatus = [
  { title: 'Disponível p/ compra', value: 'disponivel' },
  { title: 'Processando', value: 'processando' },
  { title: 'Pago', value: 'pago' }
]

const selectedSports = computed({
  get: () => clipsStore.filters.sports,
  set: (value) => clipsStore.updateFilters({ sports: value })
})

const selectedStatus = computed({
  get: () => clipsStore.filters.status,
  set: (value) => clipsStore.updateFilters({ status: value })
})

const dateRange = computed({
  get: () => clipsStore.filters.dateRange || ['', ''],
  set: (value) => {
    const range = value[0] && value[1] ? [value[0], value[1]] as [string, string] : null
    clipsStore.updateFilters({ dateRange: range })
  }
})

const hasActiveFilters = computed(() => {
  const filters = clipsStore.filters
  return !!(
    filters.sports.length > 0 ||
    filters.status.length > 0 ||
    filters.dateRange
  )
})

const activeFiltersDisplay = computed(() => {
  const filters: Array<{ key: string, value: string, label: string }> = []
  
  // Sports
  selectedSports.value.forEach(sport => {
    const sportData = availableSports.find(s => s.value === sport)
    if (sportData) {
      filters.push({
        key: 'sport',
        value: sport,
        label: sportData.label
      })
    }
  })
  
  // Status
  selectedStatus.value.forEach(status => {
    const statusData = availableStatus.find(s => s.value === status)
    if (statusData) {
      filters.push({
        key: 'status',
        value: status,
        label: statusData.title
      })
    }
  })
  
  // Date range
  if (dateRange.value[0] && dateRange.value[1]) {
    filters.push({
      key: 'dateRange',
      value: 'range',
      label: `${dateRange.value[0]} até ${dateRange.value[1]}`
    })
  }
  
  return filters
})

const toggleSportFilter = (sport: string) => {
  const current = [...selectedSports.value]
  const index = current.indexOf(sport)
  
  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(sport)
  }
  
  selectedSports.value = current
}

const removeFilter = (key: string, value: string) => {
  if (key === 'sport') {
    selectedSports.value = selectedSports.value.filter(s => s !== value)
  } else if (key === 'status') {
    selectedStatus.value = selectedStatus.value.filter(s => s !== value)
  } else if (key === 'dateRange') {
    dateRange.value = ['', '']
  }
}

const clearAllFilters = () => {
  clipsStore.clearFilters()
}
</script>

<style scoped>
.sport-filter-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.sport-filter-chip:hover {
  transform: translateY(-1px);
}
</style>