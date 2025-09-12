<template>
  <v-dialog v-model="open" transition="dialog-bottom-transition" width="100%" :scrim="true">
    <template #activator="{ props: activatorProps }">
      <slot name="activator" v-bind="activatorProps" />
    </template>

    <v-card rounded="xl" class="sheet-card" color="surface">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-subtitle-1">Filtros</span>
        <v-btn icon variant="text" aria-label="Fechar" @click="open = false">
          <v-icon :icon="customIcons.close" />
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="py-4 d-flex flex-column ga-4">
        <div>
          <div class="text-body-2 text-medium-emphasis mb-2">Esporte</div>
          <v-chip-group v-model="localSports" multiple selected-class="text-primary" column>
            <v-chip v-for="s in sportOptions" :key="s.value" :value="s.value" :prepend-icon="s.icon">{{ s.label }}</v-chip>
          </v-chip-group>
        </div>

        <div>
          <div class="text-body-2 text-medium-emphasis mb-2">Local</div>
          <div class="d-flex ga-2 flex-wrap">
            <v-select v-model="localEstado" :items="estadoOptions" label="Estado" variant="outlined" clearable hide-details density="comfortable" style="min-width: 160px" />
            <v-select v-model="localCidade" :items="cidadeOptions" label="Cidade" variant="outlined" clearable hide-details density="comfortable" :disabled="!localEstado" style="min-width: 200px" />
            <v-select v-model="localQuadra" :items="quadraOptions" label="Quadra" variant="outlined" clearable hide-details density="comfortable" :disabled="!localCidade" style="min-width: 240px" />
          </div>
        </div>

        <div>
          <div class="text-body-2 text-medium-emphasis mb-2">Tempo</div>
          <div class="d-flex ga-2 flex-wrap">
            <v-text-field v-model="localDateStart" label="Início" type="date" variant="outlined" density="comfortable" hide-details style="max-width: 180px" />
            <v-text-field v-model="localDateEnd" label="Fim" type="date" variant="outlined" density="comfortable" hide-details style="max-width: 180px" />
          </div>
        </div>

        <div>
          <div class="text-body-2 text-medium-emphasis mb-2">Preço</div>
          <v-chip-group v-model="localPrice" selected-class="text-primary" column>
            <v-chip value="gratis">Grátis</v-chip>
            <v-chip value="pago">Pago</v-chip>
          </v-chip-group>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-btn variant="text" color="secondary" @click="onClear">Limpar filtros</v-btn>
        <v-spacer />
        <v-btn color="primary" @click="onApply">Aplicar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { customIcons } from '@/utils/icons'

interface SportOption { label: string; value: string; icon?: string }

interface Props {
  modelValue: boolean
  sportOptions: SportOption[]
  estadoOptions: string[]
  cidadeOptions: string[]
  quadraOptions: string[]
  selectedSports: string[]
  estado: string | null
  cidade: string | null
  quadra: string | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'apply', 'clear'])

const open = ref(props.modelValue)
watch(() => props.modelValue, v => (open.value = v))
watch(open, v => emit('update:modelValue', v))

const localSports = ref<string[]>([...props.selectedSports])
const localEstado = ref<string | null>(props.estado)
const localCidade = ref<string | null>(props.cidade)
const localQuadra = ref<string | null>(props.quadra)
const localDateStart = ref<string | null>(null)
const localDateEnd = ref<string | null>(null)
const localPrice = ref<string | null>(null)

watch(() => [props.selectedSports, props.estado, props.cidade, props.quadra], () => {
  localSports.value = [...props.selectedSports]
  localEstado.value = props.estado
  localCidade.value = props.cidade
  localQuadra.value = props.quadra
}, { deep: true })

const dateRange = computed(() => (localDateStart.value && localDateEnd.value) ? [localDateStart.value, localDateEnd.value] : null)

function onClear() {
  localSports.value = []
  localEstado.value = null
  localCidade.value = null
  localQuadra.value = null
  localDateStart.value = null
  localDateEnd.value = null
  localPrice.value = null
  emit('clear')
}

function onApply() {
  emit('apply', {
    sports: localSports.value,
    estado: localEstado.value,
    cidade: localCidade.value,
    quadra: localQuadra.value,
    dateRange: dateRange.value,
    price: localPrice.value
  })
  open.value = false
}
</script>

<style scoped>
.sheet-card {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
}
</style>
