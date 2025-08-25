<template>
  <v-container class="py-6" fluid>
    <!-- Top bar: logo + actions -->
    <div class="d-flex flex-row align-center justify-space-between mb-3 ga-3">
      <!-- <div class="d-flex align-center ga-2">
        <v-btn class="d-none d-sm-flex" variant="text" color="secondary" :prepend-icon="customIcons.filter" @click="filtersOpen = true">Filtros</v-btn>
      </div> -->
    </div>
    
    <!-- Title + result count -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-2">
      <img :src="LogoGravaNois" class="grava-nois-logo" alt="Logo Grava Nóis" height="32" />
      <div>
        <h1 class="text-h5 text-sm-h4 font-weight-bold mb-1">Replays e Lances</h1>
        <p class="text-medium-emphasis mb-0">Descubra clipes por localização e horário.</p>
      </div>
    </div>

    <!-- Sticky filter bar -->
    <FilterChipsBar
      class="mb-4"
      :sports="sportChips"
      :estado="selectedEstado"
      :cidade="selectedCidade"
      :quadra="selectedQuadra"
      v-model:sort="sort"
      :sort-options="sortOptions"
      :filter-icon="customIcons.filter"
      @open-filters="filtersOpen = true"
      @toggle-sport="toggleSport"
      @clear-estado="selectedEstado = null"
      @clear-cidade="selectedCidade = null"
      @clear-quadra="selectedQuadra = null"
    />

    <!-- Bottom sheet filters (mobile trigger + desktop too) -->
    <FiltersSheet
      v-model="filtersOpen"
      :sport-options="sportChips"
      :estado-options="estadoOptions"
      :cidade-options="cidadeOptions"
      :quadra-options="quadraOptions"
      :selected-sports="clipsStore.filters.sports"
      :estado="selectedEstado"
      :cidade="selectedCidade"
      :quadra="selectedQuadra"
      @apply="applySheetFilters"
      @clear="clearAllFilters"
    />

    <!-- Skeleton while loading -->
    <LoadingSkeleton v-if="loadingUI" :count="6" variant="grid" class="mt-4" />

    <!-- Results -->
    <div v-else>
      <v-row>
        <!-- 1 col mobile, 2 col tablet (md ≥ 960px por default Vuetify), 3 col desktop -->
        <v-col v-for="clip in visibleClips" :key="clip.id" cols="12" md="6" lg="4">
          <VideoCard
            :clip="clip"
            :location="getLocation(clip.id)"
            @play="openClip"
            @share="shareClip"
            @download="downloadClip"
            @unlock="unlockClip"
          />
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
:root { --gn-sticky-top: 56px; }

.grava-nois-logo {
  max-height: 70px;
}

@media (min-width: 600px) {
  :root { --gn-sticky-top: 64px; }
}
</style>
