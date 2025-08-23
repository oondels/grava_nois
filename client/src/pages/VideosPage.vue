<template>
  <v-container class="py-6" fluid>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-4">
      <img :src="LogoGravaNois" alt="Logo Grava Nóis" />

      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Replays e Lances</h1>
        <p class="text-medium-emphasis mb-0">
          Descubra clipes por localização e horário — organize por Estado, Cidade e Quadra.
        </p>
      </div>

      <div v-if="filteredByLocation.length" class="text-right">
        <div class="text-h5 font-weight-medium">{{ filteredByLocation.length }}</div>
        <div class="text-caption text-medium-emphasis">
          {{ filteredByLocation.length === 1 ? "resultado" : "resultados" }}
        </div>
      </div>
    </div>

    <!-- Filtros (moderno/compacto) -->
    <v-sheet class="mb-6" color="surface" rounded="lg" border>
      <v-expansion-panels variant="accordion" class="filters-panel" :multiple="false" elevation="0">
        <v-expansion-panel>
          <v-expansion-panel-title :expand-icon="customIcons.chevronDown" :collapse-icon="customIcons.chevronDown">
            <div class="d-flex align-center ga-2">
              <v-icon :icon="customIcons.filter" size="20" class="text-medium-emphasis" />
              <span class="text-subtitle-1">Filtros</span>
              <div class="d-none d-sm-flex ga-2 ms-3 active-filters">
                <v-chip v-if="selectedEstado" size="small" variant="tonal" color="primary">{{ selectedEstado }}</v-chip>
                <v-chip v-if="selectedCidade" size="small" variant="tonal" color="primary">{{ selectedCidade }}</v-chip>
                <v-chip v-if="selectedQuadra" size="small" variant="tonal" color="primary">{{ selectedQuadra }}</v-chip>
              </div>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="d-flex flex-wrap ga-3 align-center">
              <v-select
                v-model="selectedEstado"
                :items="estadoOptions"
                label="Estado"
                density="comfortable"
                clearable
                variant="outlined"
                class="filter-item"
                hide-details="auto"
              />

              <v-select
                v-model="selectedCidade"
                :items="cidadeOptions"
                label="Cidade"
                density="comfortable"
                clearable
                :disabled="!selectedEstado"
                variant="outlined"
                class="filter-item"
                hide-details="auto"
              />

              <v-select
                v-model="selectedQuadra"
                :items="quadraOptions"
                label="Quadra"
                density="comfortable"
                clearable
                :disabled="!selectedCidade"
                variant="outlined"
                class="filter-item"
                hide-details="auto"
              />

              <v-spacer />

              <v-btn variant="text" color="secondary" :prepend-icon="customIcons.refresh" @click="clearLocalFilters">
                Limpar
              </v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-sheet>

    <!-- Resultados -->
    <div v-if="filteredByLocation.length > 0">
      <v-row v-if="viewMode === 'grid'">
        <v-col v-for="clip in filteredByLocation" :key="clip.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="result-card" rounded="xl" elevation="3">
            <div class="thumb-wrapper">
              <v-img :src="clip.thumbUrl" :aspect-ratio="16 / 9" cover class="thumb-img">
                <template #placeholder>
                  <div class="d-flex align-center justify-center h-100">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </v-img>

              <!-- Overlay + Play -->
              <div class="thumb-overlay"></div>
              <div class="play-badge">
                <v-icon :icon="customIcons.play" size="40" />
              </div>

              <!-- Duração -->
              <div class="duration-badge">{{ formatDuration(clip.durationSec) }}</div>
            </div>

            <v-card-text class="pt-3">
              <div class="d-flex align-center justify-space-between mb-1">
                <div class="text-subtitle-2 font-weight-medium text-truncate">{{ clip.venue }}</div>
                <v-chip size="x-small" color="primary" variant="tonal">
                  <v-icon :icon="getSportIcon(clip.sport)" size="16" class="me-1" />
                  {{ getSportLabel(clip.sport) }}
                </v-chip>
              </div>

              <div class="d-flex align-center ga-3 text-medium-emphasis text-caption">
                <span class="d-inline-flex align-center ga-1">{{ clip.camera }}</span>
                <span class="d-inline-flex align-center ga-1">• {{ formatDateTime(clip.recordedAt) }}</span>
              </div>

              <div class="d-flex flex-wrap ga-2 mt-3">
                <v-chip size="x-small" variant="tonal" color="secondary">{{ getLocation(clip.id)?.estado }}</v-chip>
                <v-chip size="x-small" variant="tonal" color="secondary">{{ getLocation(clip.id)?.cidade }}</v-chip>
                <v-chip size="x-small" variant="tonal" color="secondary" class="text-truncate max-w-100">
                  {{ getLocation(clip.id)?.quadra }}
                </v-chip>
              </div>
            </v-card-text>

            <v-card-actions class="pt-0">
              <v-btn size="small" variant="text" :prepend-icon="customIcons.play" @click.stop="openClip(clip)"
                >Abrir</v-btn
              >
              <v-btn size="small" variant="text" :prepend-icon="customIcons.share" @click.stop="shareClip(clip)"
                >Compartilhar</v-btn
              >
              <v-spacer />
              <v-btn
                size="small"
                color="primary"
                variant="tonal"
                :prepend-icon="customIcons.download"
                @click.stop="downloadClip(clip)"
                >Baixar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <div v-else>
        <v-card v-for="clip in filteredByLocation" :key="clip.id" class="result-card mb-3" rounded="xl" elevation="2">
          <v-row class="g-0">
            <v-col cols="12" md="4">
              <div class="thumb-wrapper">
                <v-img :src="clip.thumbUrl" :aspect-ratio="16 / 9" cover class="thumb-img">
                  <template #placeholder>
                    <div class="d-flex align-center justify-center h-100">
                      <v-progress-circular indeterminate color="primary" />
                    </div>
                  </template>
                </v-img>
                <div class="duration-badge">{{ formatDuration(clip.durationSec) }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="8">
              <v-card-text>
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="text-subtitle-1 font-weight-medium text-truncate">{{ clip.venue }}</div>
                  <v-chip size="x-small" color="primary" variant="tonal">
                    <v-icon :icon="getSportIcon(clip.sport)" size="16" class="me-1" />
                    {{ getSportLabel(clip.sport) }}
                  </v-chip>
                </div>

                <div class="text-caption text-medium-emphasis mb-2">
                  {{ clip.camera }} • {{ formatDateTime(clip.recordedAt) }}
                </div>

                <div class="d-flex flex-wrap ga-2 mb-3">
                  <v-chip size="x-small" variant="tonal" color="secondary">{{ getLocation(clip.id)?.estado }}</v-chip>
                  <v-chip size="x-small" variant="tonal" color="secondary">{{ getLocation(clip.id)?.cidade }}</v-chip>
                  <v-chip size="x-small" variant="tonal" color="secondary">{{ getLocation(clip.id)?.quadra }}</v-chip>
                </div>

                <div class="d-flex align-center">
                  <v-btn
                    class="me-2"
                    size="small"
                    variant="text"
                    :prepend-icon="customIcons.play"
                    @click.stop="openClip(clip)"
                    >Abrir</v-btn
                  >
                  <v-btn
                    class="me-2"
                    size="small"
                    variant="text"
                    :prepend-icon="customIcons.share"
                    @click.stop="shareClip(clip)"
                    >Compartilhar</v-btn
                  >
                  <v-spacer />
                  <v-btn
                    size="small"
                    color="primary"
                    variant="tonal"
                    :prepend-icon="customIcons.download"
                    @click.stop="downloadClip(clip)"
                    >Baixar</v-btn
                  >
                </div>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </div>

    <div v-else class="py-8">
      <EmptyState title="Nenhum vídeo encontrado" description="Tente ajustar os filtros de Estado, Cidade e Quadra." />
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useClipsStore } from "@/store/clips";
import EmptyState from "@/components/EmptyState.vue";
import { formatDuration, formatDateTime, getSportIcon, getSportLabel } from "@/utils/formatters";
import { customIcons } from "@/utils/icons";

import LogoGravaNois from "@/assets/icons/grava-nois-branco.webp";

type LocalLocation = { estado: string; cidade: string; quadra: string };

// Clips (mock) + mapeamento de localização (temporário)
const clipsStore = useClipsStore();

const clipLocationMap: Record<string, LocalLocation> = reactive({
  // id: { estado, cidade, quadra }
  abc123: { estado: "BA", cidade: "Santo Estêvão", quadra: "Quadra Voley/Futvoley Lagoa de Plínio" },
});

// Estado dos filtros
const selectedEstado = ref<string | null>("BA");
const selectedCidade = ref<string | null>("Santo Estêvão");
const selectedQuadra = ref<string | null>("Quadra Voley/Futvoley Lagoa de Plínio");
const viewMode = ref<"grid" | "list">("grid");

// Opções dinâmicas
const estadoOptions = computed(() => {
  const set = new Set<string>();
  clipsStore.clips.forEach((c) => {
    const loc = clipLocationMap[c.id];
    if (loc) set.add(loc.estado);
  });
  return Array.from(set).sort();
});

const cidadeOptions = computed(() => {
  const set = new Set<string>();
  clipsStore.clips.forEach((c) => {
    const loc = clipLocationMap[c.id];
    if (!loc) return;
    if (selectedEstado.value && loc.estado !== selectedEstado.value) return;
    set.add(loc.cidade);
  });
  return Array.from(set).sort();
});

const quadraOptions = computed(() => {
  const set = new Set<string>();
  clipsStore.clips.forEach((c) => {
    const loc = clipLocationMap[c.id];
    if (!loc) return;
    if (selectedEstado.value && loc.estado !== selectedEstado.value) return;
    if (selectedCidade.value && loc.cidade !== selectedCidade.value) return;
    set.add(loc.quadra);
  });
  return Array.from(set).sort();
});

// Filtragem por localização sobre os clips existentes (além de filtros globais)
const filteredByLocation = computed(() => {
  const base = clipsStore.filteredClips; // respeita filtros globais existentes
  return base.filter((c) => {
    const loc = clipLocationMap[c.id];
    if (!loc) return false;
    if (selectedEstado.value && loc.estado !== selectedEstado.value) return false;
    if (selectedCidade.value && loc.cidade !== selectedCidade.value) return false;
    if (selectedQuadra.value && loc.quadra !== selectedQuadra.value) return false;
    return true;
  });
});

//

function getLocation(id: string): LocalLocation | null {
  return clipLocationMap[id] ?? null;
}

function clearLocalFilters() {
  selectedEstado.value = null;
  selectedCidade.value = null;
  selectedQuadra.value = null;
}

// Ações (apenas logs)
function openClip(clip: any) {
  console.log("[VideosPage] Abrir clip", clip?.id);
}
function shareClip(clip: any) {
  console.log("[VideosPage] Compartilhar clip", clip?.id);
}
function downloadClip(clip: any) {
  console.log("[VideosPage] Baixar clip", clip?.id);
}

//
</script>

<style scoped>
/* header reverted to simple layout */

.filter-item {
  min-width: 220px;
}

.filters-panel :deep(.v-expansion-panel-title) {
  padding: 12px 16px;
}

.result-card {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.result-card:hover {
  transform: translateY(-2px);
}

.thumb-wrapper {
  position: relative;
}
.thumb-img {
  filter: saturate(1.05);
}
.thumb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.45) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.result-card:hover .thumb-overlay {
  opacity: 1;
}

.play-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.result-card:hover .play-badge {
  opacity: 0.85;
}

.duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.active-filters {
  opacity: 0.8;
}
.max-w-100 {
  max-width: 100%;
}
</style>
