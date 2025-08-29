<template>
  <v-container class="py-6" fluid>
    <!-- Header -->
    <div class="d-flex justify-center align-center mb-4">
      <img class="gravanois-logo" :src="LogoGravaNois" alt="Logo Grava Nóis" />
    </div>

    <div class="d-flex align-center justify-center mb-4 flex-wrap ga-4">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Replays e Lances</h1>
        <p class="text-medium-emphasis mb-0">
          "Resgates seus mehlores laces"
        </p>
      </div>

      <!-- <div v-if="filteredByLocation.length" class="text-right">
        <div class="text-h5 font-weight-medium">{{ filteredByLocation.length }}</div>
        <div class="text-caption text-medium-emphasis">
          {{ filteredByLocation.length === 1 ? "resultado" : "resultados" }}
        </div>
      </div> -->
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

      <div ref="sentinel" style="height: 1px"></div>

      <div v-if="!visibleClips.length" class="py-8">
        <EmptyState title="Nenhum clipe encontrado" description="Nenhum clipe encontrado com esses filtros." />
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useClipsStore } from "@/store/clips";
import EmptyState from "@/components/EmptyState.vue";
import { formatDuration, formatDateTime, getSportIcon, getSportLabel } from "@/utils/formatters";
import { customIcons } from "@/utils/icons";
import FilterChipsBar from "@/components/filters/FilterChipsBar.vue";
import FiltersSheet from "@/components/filters/FiltersSheet.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";
import VideoCard from "@/components/videos/VideoCard.vue";

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
const filtersOpen = ref(false);
const sort = ref<string>("Mais recentes");
const sortOptions = ["Mais recentes", "Mais vistos", "Melhor avaliados", "Próximos de mim"];
const loadingUI = ref(true);
const visibleCount = ref(9);
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

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
  let base = [...clipsStore.filteredClips];
  // Ordenação (simplificada)
  if (sort.value === "Mais recentes") {
    base.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }
  // Placeholder for other sorts: keep as-is

  return base.filter((c) => {
    const loc = clipLocationMap[c.id];
    if (!loc) return false;
    if (selectedEstado.value && loc.estado !== selectedEstado.value) return false;
    if (selectedCidade.value && loc.cidade !== selectedCidade.value) return false;
    if (selectedQuadra.value && loc.quadra !== selectedQuadra.value) return false;
    return true;
  });
});

const visibleClips = computed(() => filteredByLocation.value.slice(0, visibleCount.value));

onMounted(() => {
  // Simular carregamento inicial para exibir skeletons brevemente
  const t = setTimeout(() => (loadingUI.value = false), 500);

  // Infinite scroll
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        visibleCount.value = Math.min(visibleCount.value + 6, filteredByLocation.value.length);
      }
    }
  });
  if (sentinel.value) observer.observe(sentinel.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

watch(filteredByLocation, () => {
  // Reset paginação quando filtros mudarem
  visibleCount.value = 9;
});

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
function unlockClip(clip: any) {
  console.log("[VideosPage] Desbloquear clip", clip?.id);
}

// Filter bar helpers
const sportChips = computed(() => [
  { label: "Futebol", value: "futebol", icon: getSportIcon("futebol"), selected: clipsStore.filters.sports.includes("futebol") },
  { label: "Basquete", value: "basquete", icon: getSportIcon("basquete"), selected: clipsStore.filters.sports.includes("basquete") },
  { label: "Vôlei", value: "volei", icon: getSportIcon("volei"), selected: clipsStore.filters.sports.includes("volei") },
  { label: "Futevôlei", value: "futevolei", icon: getSportIcon("futevolei"), selected: clipsStore.filters.sports.includes("futevolei") },
]);

function toggleSport(sport: string) {
  const current = new Set(clipsStore.filters.sports);
  if (current.has(sport)) current.delete(sport); else current.add(sport);
  clipsStore.updateFilters({ sports: Array.from(current) });
}

function applySheetFilters(payload: any) {
  clipsStore.updateFilters({ sports: payload.sports, dateRange: payload.dateRange });
  selectedEstado.value = payload.estado;
  selectedCidade.value = payload.cidade;
  selectedQuadra.value = payload.quadra;
}

function clearAllFilters() {
  clipsStore.clearFilters();
  clearLocalFilters();
}

//
</script>

<style scoped>
/* header reverted to simple layout */
/* logo header */
.gravanois-logo {
  width: 90px;
}

.filter-item {
  min-width: 220px;
}

.filters-panel :deep(.v-expansion-panel-title) {
  padding: 12px 16px;
}

.grava-nois-logo {
  max-height: 70px;
}

@media (min-width: 600px) {
  :root { --gn-sticky-top: 64px; }
}
</style>
