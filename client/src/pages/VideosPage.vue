<template>
  <v-container class="py-4" fluid>
    <!-- Filtros -->
    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <div class="d-flex flex-wrap ga-3">
          <v-select
            v-model="selectedEstado"
            :items="estadoOptions"
            label="Estado"
            density="comfortable"
            clearable
            class="filter-item"
          />

          <v-select
            v-model="selectedCidade"
            :items="cidadeOptions"
            label="Cidade"
            density="comfortable"
            clearable
            :disabled="!selectedEstado"
            class="filter-item"
          />

          <v-select
            v-model="selectedQuadra"
            :items="quadraOptions"
            label="Quadra"
            density="comfortable"
            clearable
            :disabled="!selectedCidade"
            class="filter-item"
          />

          <v-spacer />

          <v-btn variant="text" @click="clearLocalFilters">Limpar</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Resultados -->
    <div v-if="filteredByLocation.length > 0">
      <v-row>
        <v-col v-for="clip in filteredByLocation" :key="clip.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="result-card" elevation="2">
            <div class="position-relative">
              <v-img :src="clip.thumbUrl" :aspect-ratio="16/9" cover>
                <template #placeholder>
                  <div class="d-flex align-center justify-center h-100">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </v-img>

              <div class="duration-badge">{{ formatDuration(clip.durationSec) }}</div>
            </div>

            <v-card-text>
              <div class="text-subtitle-2 font-weight-medium text-truncate">{{ clip.venue }}</div>
              <div class="text-caption text-medium-emphasis">{{ clip.camera }} • {{ formatDateTime(clip.recordedAt) }}</div>

              <div class="text-caption mt-2">
                <span class="me-2">{{ getLocation(clip.id)?.estado }}</span>
                <span class="me-2">• {{ getLocation(clip.id)?.cidade }}</span>
                <span>• {{ getLocation(clip.id)?.quadra }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="py-8">
      <EmptyState
        title="Nenhum vídeo encontrado"
        description="Tente ajustar os filtros de Estado, Cidade e Quadra."
      />
    </div>
  </v-container>
  
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useClipsStore } from '@/store/clips'
import EmptyState from '@/components/EmptyState.vue'
import { formatDuration, formatDateTime } from '@/utils/formatters'

type LocalLocation = { estado: string; cidade: string; quadra: string }

// Clips (mock) + mapeamento de localização (temporário)
const clipsStore = useClipsStore()

const clipLocationMap: Record<string, LocalLocation> = reactive({
  // id: { estado, cidade, quadra }
  abc123: { estado: 'SP', cidade: 'São Paulo', quadra: 'Quadra Cond. Primavera' },
  def456: { estado: 'MG', cidade: 'Belo Horizonte', quadra: 'Academia Central' },
  ghi789: { estado: 'SP', cidade: 'São Paulo', quadra: 'Club Atlético' },
  jkl012: { estado: 'RJ', cidade: 'Rio de Janeiro', quadra: 'Praia do Flamengo' },
  mno345: { estado: 'RJ', cidade: 'Rio de Janeiro', quadra: 'Campo do Botafogo' },
  pqr678: { estado: 'MG', cidade: 'Belo Horizonte', quadra: 'Ginásio Municipal' },
})

// Estado dos filtros
const selectedEstado = ref<string | null>(null)
const selectedCidade = ref<string | null>(null)
const selectedQuadra = ref<string | null>(null)

// Opções dinâmicas
const estadoOptions = computed(() => {
  const set = new Set<string>()
  clipsStore.clips.forEach(c => { const loc = clipLocationMap[c.id]; if (loc) set.add(loc.estado) })
  return Array.from(set).sort()
})

const cidadeOptions = computed(() => {
  const set = new Set<string>()
  clipsStore.clips.forEach(c => {
    const loc = clipLocationMap[c.id]
    if (!loc) return
    if (selectedEstado.value && loc.estado !== selectedEstado.value) return
    set.add(loc.cidade)
  })
  return Array.from(set).sort()
})

const quadraOptions = computed(() => {
  const set = new Set<string>()
  clipsStore.clips.forEach(c => {
    const loc = clipLocationMap[c.id]
    if (!loc) return
    if (selectedEstado.value && loc.estado !== selectedEstado.value) return
    if (selectedCidade.value && loc.cidade !== selectedCidade.value) return
    set.add(loc.quadra)
  })
  return Array.from(set).sort()
})

// Filtragem por localização sobre os clips existentes (além de filtros globais)
const filteredByLocation = computed(() => {
  const base = clipsStore.filteredClips // respeita filtros globais existentes
  return base.filter(c => {
    const loc = clipLocationMap[c.id]
    if (!loc) return false
    if (selectedEstado.value && loc.estado !== selectedEstado.value) return false
    if (selectedCidade.value && loc.cidade !== selectedCidade.value) return false
    if (selectedQuadra.value && loc.quadra !== selectedQuadra.value) return false
    return true
  })
})

function getLocation(id: string): LocalLocation | null {
  return clipLocationMap[id] ?? null
}

function clearLocalFilters() {
  selectedEstado.value = null
  selectedCidade.value = null
  selectedQuadra.value = null
}
</script>

<style scoped>
.filter-item { min-width: 220px; }
.result-card { overflow: hidden; }
.duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
</style>

