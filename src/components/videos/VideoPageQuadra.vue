<template>
  <v-container class="py-6" fluid>
    <!-- Header -->
    <div class="d-flex justify-center align-center mb-4">
      <img
        class="gravanois-logo"
        :src="LogoGravaNoisCol"
        alt="Logo Grava Nóis"
        decoding="async"
        width="140"
        height="40"
      />
    </div>
    <div ref="listTopRef"></div>

    <div class="d-flex align-center justify-center mb-7 flex-wrap ga-4">
      <div class="d-flex align-center ga-3 flex-wrap justify-center">
        <h1 class="text-h4 font-weight-bold mb-1 page-title">Replays e Lances</h1>

        <!-- Aviso sutil: fase inicial (ao lado do título) -->
        <!-- <v-dialog max-width="500">
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
              class="title-alert-btn pulse"
              color="warning"
              variant="tonal"
              size="small"
              :rounded="true"
              aria-label="Aviso importante"
            >
              <v-icon :icon="customIcons.alert" size="20" />
            </v-btn>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card title="Aviso" class="result-card" v-if="isActive">
              <v-card-text>
                <v-alert
                  v-if="showEarlyNotice"
                  type="warning"
                  variant="tonal"
                  border="start"
                  rounded="lg"
                  density="comfortable"
                  class="mb-2"
                >
                  Em fase inicial: Se encontrar um erro nos relate clicando
                  <router-link to="/reportar-erro" class="text-primary">aqui</router-link>.
                </v-alert>
              </v-card-text>
            </v-card>
          </template>
        </v-dialog> -->

        <p class="text-medium-emphasis mb-0 w-100 text-center">Resgate seus melhores lances</p>
      </div>
    </div>

    <!-- Callout: incentive to post and tag Instagram -->
    <div
      type="info"
      variant="tonal"
      border="start"
      rounded="lg"
      class="mb-6 d-flex align-center ga-3 bg-blue-lighten-2 pa-4 rounded-lg border-l-4 border-blue-700"
      density="comfortable"
      v-if="verificaQuadrasUser()"
    >
      <div>
        Curtiu seu vídeo? Publique e marque para aparecer no nosso Insta!
        <v-btn
          href="https://www.instagram.com/grava_nois?igsh=MWhhczl3dGRpN25waw=="
          target="_blank"
          rel="noopener noreferrer"
          density="compact"
        >
          @grava_nois
        </v-btn>
      </div>
    </div>

    <v-card class="pa-4">
      <v-card-text class="pa-0">
        <section
          class="relative rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-emerald-50/60 to-sky-50/40 dark:from-zinc-900/60 dark:to-zinc-900/20 backdrop-blur-xl px-5 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        >
          <header class="text-center mb-5">
            <h3 class="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Selecione uma <span class="text-emerald-600 dark:text-emerald-400">Quadra</span> para ver seus vídeos
            </h3>
          </header>

          <div class="grid grid-cols-1 sm:grid-cols-[auto,1fr] items-center gap-3">
            <v-combobox
              v-model="selectedQuadra"
              :items="availableQuadras"
              item-title="name"
              item-value="id"
              :return-object="true"
              variant="outlined"
              color="success"
              density="comfortable"
              hide-no-data
              hide-selected
              label="Selecione uma quadra"
              aria-label="Selecione uma quadra vinculada"
              :menu-props="{ maxHeight: 300 }"
              clearable
              ref="quadraSelectRef"
              class="rounded-xl [&_.v-field]:rounded-xl [&_.v-field__overlay]:!bg-transparent [&_.v-field__outline]:!border-zinc-300 dark:[&_.v-field__outline]:!border-zinc-700 hover:[&_.v-field__outline]:!border-emerald-400/60 focus-within:[&_.v-field__outline]:!border-emerald-500 focus-within:[&_.v-field__outline]:ring-2 focus-within:[&_.v-field__outline]:ring-emerald-500/30 transition-all"
            />
          </div>
        </section>

        <section>
          <v-sheet class="mb-6" color="surface" rounded="lg" border>
            <!-- Info barra superior -->
            <div class="d-flex align-center justify-space-between px-4 py-3 ga-3 flex-wrap">
              <v-btn
                :loading="isRefreshing"
                :disabled="isRefreshing"
                color="success"
                variant="outlined"
                :prepend-icon="customIcons.refresh"
                class="h-11 rounded-xl px-5 border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
                @click="refresh"
              >
                Vídeos
              </v-btn>

              <div class="text-caption text-medium-emphasis">
                {{ state.items.length }} clipes nesta página
                <span v-if="state.loading && !state.items.length">• carregando…</span>
              </div>

              <div class="d-flex align-center ga-2 ms-auto">
                <span class="text-caption text-medium-emphasis">Clipes por página</span>
                <v-select
                  :model-value="state.pageSize"
                  :items="[5, 10, 15]"
                  density="compact"
                  variant="outlined"
                  style="max-width: 110px"
                  @update:model-value="onChangePageSize"
                />
              </div>
            </div>

            <!-- Loading inicial -->
            <div v-if="state.loading && !state.items.length" class="d-flex align-center justify-center py-6">
              <v-col cols="12" md="6">
                <v-skeleton-loader
                  class="mx-auto border"
                  max-width="300"
                  type="card-avatar, actions"
                ></v-skeleton-loader>
              </v-col>
            </div>

            <!-- Erro -->
            <div v-else-if="state.error" class="px-4 pb-4">
              <v-alert type="error" variant="tonal">Erro ao carregadar conteúdo, verifique sua conexão!</v-alert>
            </div>

            <!-- Conteúdo -->
            <div v-else class="px-4 pb-4">
              <!-- Exibe itens se tiver quadra vinculada -->
              <div>
                <!-- Loader leve ao paginar quando já há itens -->
                <v-progress-linear
                  v-if="state.loading && state.items.length"
                  color="success"
                  indeterminate
                  class="mb-2"
                />
                <v-row>
                  <v-col v-for="file in state.items" :key="getKey(file)" cols="12" sm="6" md="4" lg="3">
                    <VideoCard
                      :clip="toClip(file)"
                      :show-disabled="state.loading || previewMap[getKey(file)] === null || file.missing"
                      :preview-loading="!!previewLoadingMap[getKey(file)]"
                      :download-disabled="isDownloading || file.missing"
                      :download-loading="activeDownloadKey === getKey(file)"
                      @show="() => onShow(file)"
                      @download="() => onDownload(file)"
                    ></VideoCard>
                  </v-col>
                </v-row>

                <!-- Pagination controls -->
                <div class="d-flex align-center justify-end mt-2 px-1 ga-2">
                  <v-btn variant="outlined" :disabled="state.loading" @click="prevPage"> Voltar ao início </v-btn>
                  <v-btn
                    variant="outlined"
                    :disabled="!state.hasMore || state.loading"
                    :loading="state.loading"
                    @click="nextPage"
                  >
                    Próxima
                  </v-btn>
                </div>
              </div>
            </div>
          </v-sheet>
        </section>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, watch } from "vue";
import { customIcons } from "@/utils/icons";
import LogoGravaNoisCol from "@/assets/icons/grava-nois.webp";
import thumbVideo from "@/assets/images/thumb-video.webp";
import VideoCard from "@/components/videos/VideoCard.vue";
import type { SportClip } from "@/store/clips";
import { fetchVideos, type VideoListItem, type VideoListResponse } from "@/services/videos";

import { useAuthStore } from "@/store/auth";
const authStore = useAuthStore();
const user = computed(() => authStore.safeUser);

// type LocalLocation = { estado: string; cidade: string; quadra: string };
const userLoaded = ref(false);

const quadraSelectRef = ref();
function focusQuadra() {
  quadraSelectRef.value?.focus?.();
}
const listTopRef = ref<HTMLElement | null>(null);

function scrollToListTop() {
  const el = listTopRef.value as HTMLElement | null;
  if (!el) return;
  const root = document.documentElement;
  const varPx = getComputedStyle(root).getPropertyValue('--gn-sticky-top').trim();
  const offset = Number.parseInt(varPx || '64', 10) || 64;
  const rect = el.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY - offset - 8; // pequeno respiro visual
  window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
}

type VideoFile = VideoListItem;

const state = reactive({
  items: [] as VideoFile[],
  loading: false,
  error: null as string | null,
  hasMore: true,
  token: undefined as string | undefined,
  pageSize: 5,
});

// Mapas de URLs assinadas (lazy)
const previewMap = reactive<Record<string, string | null | undefined>>({});
const downloadMap = reactive<Record<string, string | null | undefined>>({});

// Mapa de loading de preview por key (true = carregando)
const previewLoadingMap = reactive<Record<string, boolean>>({});

// Controle global de download
const isDownloading = ref(false);
const activeDownloadKey = ref<string | null>(null);

/** ================= Utils ================= */
function getApiBase() {
  const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  if (envBase) return envBase.replace(/\/$/, "");
  return "";
}

function toClip(file: VideoFile): SportClip {
  const key = file.path || file.clip_id;
  const recordedAt = file.captured_at || file.last_modified || new Date().toISOString();
  return {
    id: key,
    sport: "futebol",
    durationSec: 10,
    priceCents: 0,
    purchased: true,
    status: "pago",
    recordedAt,
    camera: "Cam-01",
    venue: "Grava Nóis",
    thumbUrl: thumbVideo as unknown as string,
    videoUrl: key ? previewMap[key as string] || "" : "",
  };
}

function getKey(file: VideoFile): string {
  return (file.path || file.clip_id) as string;
}

/** ================= Data Fetch ================= */
const isRefreshing = ref(false);
async function fetchPage(quadraId: string | null = null) {
  if (!selectedQuadra.value) return;

  isRefreshing.value = true;

  state.loading = true;
  state.error = null;
  try {
    const venueId = (quadraId ?? selectedQuadra.value.id) as string;

    const data = (await fetchVideos({
      limit: state.pageSize,
      token: state.token,
      includeSignedUrl: false,
      venueId: venueId,
    })) as VideoListResponse;

    state.items = data.videos;
    state.hasMore = data.hasMore;
    state.token = data.nextToken || undefined;
  } catch (e: any) {
    state.error = e?.message ?? "Erro ao carregar vídeos";
  } finally {
    state.loading = false;
    isRefreshing.value = false;
  }
}

function refresh() {
  if (!selectedQuadra.value) return;

  state.token = undefined;
  Object.keys(previewMap).forEach((k) => delete previewMap[k]);
  Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
  Object.keys(previewLoadingMap).forEach((k) => delete previewLoadingMap[k]);
  return fetchPage(selectedQuadra.value.id);
}

function nextPage() {
  if (state.loading || !state.hasMore) return;
  // Scroll para o topo da listagem com offset do header fixo
  scrollToListTop();
  state.loading = true;
  state.items = [];

  setTimeout(() => {
    Object.keys(previewMap).forEach((k) => delete previewMap[k]);
    Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
    Object.keys(previewLoadingMap).forEach((k) => delete previewLoadingMap[k]);
    fetchPage(selectedQuadra.value.id);
  }, 500);
}

function prevPage() {
  if (state.loading) return;
  // Como a API fornece apenas paginação forward (nextToken), voltar reseta para o início
  state.token = undefined;
  Object.keys(previewMap).forEach((k) => delete previewMap[k]);
  Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
  Object.keys(previewLoadingMap).forEach((k) => delete previewLoadingMap[k]);
  fetchPage(selectedQuadra.value.id);
}

function onChangePageSize(size: number) {
  if (!size || size === state.pageSize) return;
  state.pageSize = size;
  state.token = undefined;
  Object.keys(previewMap).forEach((k) => delete previewMap[k]);
  Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
  Object.keys(previewLoadingMap).forEach((k) => delete previewLoadingMap[k]);
  fetchPage(selectedQuadra.value.id);
}

/** ================= Assinatura sob demanda ================= */
async function ensurePreview(path: string | null, bucket = "temp") {
  if (!path) return;
  if (previewMap[path] !== undefined) return; // já buscado (sucesso ou falha)
  previewLoadingMap[path] = true; // indica loading no card
  previewMap[path] = null; // marca como em progresso
  try {
    const base = getApiBase();
    const url = new URL(`${base}/api/videos/sign`);
    url.searchParams.set("bucket", bucket);
    url.searchParams.set("path", path);
    url.searchParams.set("kind", "preview");
    url.searchParams.set("ttl", "3600");

    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) throw new Error(`Falha ao assinar preview: ${res.status}`);
    const data = await res.json();
    console.log('Preview');
    
    console.log(data);
    
    previewMap[path] = data?.data?.url ?? null;
  } catch {
    previewMap[path] = null; // mantém vazio para não loopar
  } finally {
    previewLoadingMap[path] = false;
  }
}

async function signDownload(path: string | null, bucket = "temp") {
  if (!path) return null;
  if (downloadMap[path]) return downloadMap[path]; // cache
  const base = getApiBase();
  const url = new URL(`${base}/api/videos/sign`);
  url.searchParams.set("bucket", bucket);
  url.searchParams.set("path", path);
  url.searchParams.set("kind", "download");
  url.searchParams.set("ttl", "3600");

  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  downloadMap[path] = data?.data?.url ?? null;
  return downloadMap[path];
}

async function onDownload(file: VideoFile) {
  if (file.missing || isDownloading.value) return;
  const key = getKey(file);
  isDownloading.value = true;
  activeDownloadKey.value = key;
  try {
    const u = await signDownload(file.path, file.bucket);
    if (u) window.open(u, "_blank");
  } finally {
    isDownloading.value = false;
    activeDownloadKey.value = null;
  }
}

function onShow(file: VideoFile) {
  // dispara o carregamento sob demanda da prévia
  if (file.missing) return;
  ensurePreview(file.path, file.bucket);
}

const selectedQuadra = ref<any>({});

/**
 * Retrieves the last selected quadra or a unique quadra from available quadras.
 *
 * @returns {Object|null} Returns null if no quadras are available,
 *                        the single quadra if only one exists,
 *                        the last selected quadra from localStorage if found,
 *                        or the first available quadra as fallback.
 */
const getLastOrUniqueQuadra = () => {
  if (availableQuadras.value.length === 0) return null;
  if (availableQuadras.value.length === 1) return (selectedQuadra.value = availableQuadras.value[0]);
  // tenta pegar a última quadra selecionada
  const lastId = localStorage.getItem("grn-last-quadra-id");
  const found = availableQuadras.value.find((q) => q.id === lastId);
  if (found) return (selectedQuadra.value = found);
  // senão, retorna a primeira
  return (selectedQuadra.value = availableQuadras.value[0]);
};

// Watch para logar sempre que selectedQuadra mudar
watch(
  selectedQuadra,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;

    if (!import.meta.env.DEV) refresh();
    if (newVal && newVal.id) {
      localStorage.setItem("grn-last-quadra-id", newVal.id);
    } else {
      localStorage.removeItem("grn-last-quadra-id");
    }
  },
  { deep: true }
);
const availableQuadras = ref([] as any[]);

onMounted(() => {
  const quadras = (user.value as any)?.quadrasFiliadas;
  availableQuadras.value = Array.isArray(quadras) ? quadras : quadras && typeof quadras === "object" ? Object.values(quadras) : [];

  userLoaded.value = true;

  setTimeout(async () => {
    // focusQuadra();
    if (!import.meta.env.DEV) fetchPage()
  }, 500);

  getLastOrUniqueQuadra();
});

/**
 * Verifica se o usuário possui quadras vinculadas.
 * Aguarda o preenchimento inicial de `userData` (feito em onMounted).
 */
function verificaQuadrasUser(): boolean {
  if (!userLoaded.value) return false;
  const quadras = (user.value as any)?.quadrasFiliadas;
  return Array.isArray(quadras) && quadras.length > 0;
}
</script>

<style scoped>
.gravanois-logo {
  width: 90px;
}

.result-card .thumb-wrapper {
  position: relative;
}

.date-badge {
  position: absolute;
  z-index: 2;
  left: 8px;
  top: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  color: white;
}

/* Placeholder do thumbnail quando a prévia ainda não está disponível */
.thumb-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background: #111;
  color: #ccc;
  border-radius: 12px 12px 0 0;
  position: relative;
  overflow: hidden;
}
.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: blur(2px) brightness(0.7);
  transition: filter 0.3s ease;
}

.thumb-placeholder:hover .thumb-image {
  filter: blur(1px) brightness(0.8);
}

@media (min-width: 600px) {
  :root {
    --gn-sticky-top: 64px;
  }
}

/* Título + botão de aviso (chamativo, sem exagero) */
.page-title {
  display: inline-flex;
  align-items: center;
}

.title-alert-btn {
  /* Usa a cor de aviso global, com brilho sutil */
  --pulse-base: var(--warning-color, #f59e0b);
  box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  backdrop-filter: saturate(1.1);
}

.title-alert-btn:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 6px 14px rgba(245, 158, 11, 0.35);
}

.pulse {
  animation: pulseGlow 2.4s ease-in-out infinite;
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}
</style>
