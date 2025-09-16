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

    <div class="d-flex align-center justify-center mb-7 flex-wrap ga-4">
      <div class="d-flex align-center ga-3 flex-wrap justify-center">
        <h1 class="text-h4 font-weight-bold mb-1 page-title">Replays e Lances</h1>

        <!-- Aviso sutil: fase inicial (ao lado do título) -->
        <v-dialog max-width="500">
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
        </v-dialog>

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

    <v-card class="pa-4" variant="outlined" color="success" rounded="lg">
      <v-card-text class="pa-0">
        <section
          class="relative rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-emerald-50/60 to-sky-50/40 dark:from-zinc-900/60 dark:to-zinc-900/20 backdrop-blur-xl px-5 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        >
          <header class="text-center mb-5">
            <h3 class="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Selecione uma <span class="text-emerald-600 dark:text-emerald-400">Quadra</span> vinculada
            </h3>
          </header>

          <div class="grid grid-cols-1 sm:grid-cols-[auto,1fr] items-center gap-3">
            <v-btn
              :loading="isRefreshing"
              :disabled="isRefreshing"
              color="success"
              variant="outlined"
              :prepend-icon="customIcons.refresh"
              class="h-11 rounded-xl px-5 border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all"
              @click="refresh"
              v-if="verificaQuadrasUser()"
            >
              Vídeos
            </v-btn>

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
      </v-card-text>

      <div
        v-if="!availableQuadras?.length"
        type="info"
        variant="tonal"
        density="comfortable"
        class="mt-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl p-4 sm:p-5 max-[360px]:p-3 overflow-hidden"
        aria-live="polite"
      >
        <div class="flex items-start gap-3 sm:gap-4 max-[360px]:flex-col max-[360px]:items-stretch max-[360px]:gap-2">
          <!-- Ícone / Badge -->
          <div
            class="shrink-0 h-10 w-10 sm:h-11 sm:w-11 max-[360px]:h-9 max-[360px]:w-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/40 flex items-center justify-center max-[360px]:mx-auto"
            aria-hidden="true"
          >
            <MapPinOffIcon class="h-6 w-6 max-[360px]:h-5 max-[360px]:w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div class="flex-1 min-w-0">
            <h4
              class="text-base sm:text-[1.05rem] max-[360px]:text-sm font-medium leading-tight text-zinc-900 dark:text-zinc-50"
            >
              Sem quadra vinculada
            </h4>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 break-words">
              Selecione uma quadra acima para ver seus vídeos, ou cadastre uma no seu perfil.
            </p>

            <div class="mt-3 max-[360px]:mt-2 flex flex-col sm:flex-row gap-2">
              <v-btn
                size="small"
                variant="flat"
                color="success"
                class="rounded-lg h-10 sm:h-9 px-4 shadow-sm hover:shadow-md transition w-full sm:w-auto"
                @click="focusQuadra"
              >
                Selecionar quadra
              </v-btn>

              <!-- ajuste a rota conforme seu app -->
              <router-link to="/user-page" class="inline-flex max-[360px]:w-full">
                <v-btn
                  size="small"
                  variant="outlined"
                  color="success"
                  class="rounded-lg h-10 sm:h-9 px-4 w-full sm:w-auto"
                >
                  Cadastrar no perfil
                </v-btn>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <v-sheet v-if="verificaQuadrasUser()" class="mb-6" color="surface" rounded="lg" border>
      <div class="d-flex align-center justify-space-between px-4 py-3 ga-3 flex-wrap">
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
          <v-skeleton-loader class="mx-auto border" max-width="300" type="card-avatar, actions"></v-skeleton-loader>
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
          <v-row>
            <v-col v-for="file in state.items" :key="file.path" cols="12" sm="6" md="4" lg="3">
              <VideoCard
                :clip="toClip(file)"
                :show-disabled="state.loading || previewMap[file.path] === null"
                @show="() => onShow(file)"
                @download="() => onDownload(file)"
              ></VideoCard>
            </v-col>
          </v-row>

          <!-- Pagination controls -->
          <div class="d-flex align-center justify-space-between mt-2 px-1">
            <v-btn variant="outlined" :disabled="state.page === 1 || state.loading" @click="prevPage"> Anterior </v-btn>
            <div class="text-caption text-medium-emphasis">Página {{ state.page }}</div>
            <v-btn variant="outlined" :disabled="!state.hasMore || state.loading" @click="nextPage"> Próxima </v-btn>
          </div>
        </div>

        <!-- <div v-else>
          <v-alert type="info" variant="tonal" class="mt-3" density="comfortable">
            Nenhum vídeo encontrado.
            <span v-if="!selectedQuadra"> Selecione uma quadra para ver os vídeos vinculados. </span>
          </v-alert>
        </div> -->
      </div>
    </v-sheet>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import { customIcons } from "@/utils/icons";
import LogoGravaNoisCol from "@/assets/icons/grava-nois.webp";
import thumbVideo from "@/assets/images/thumb-video.webp";
import VideoCard from "@/components/videos/VideoCard.vue";
import type { SportClip } from "@/store/clips";
import { MapPinOffIcon } from "lucide-vue-next";

import { useAuthStore } from "@/store/auth";
const authStore = useAuthStore();

// type LocalLocation = { estado: string; cidade: string; quadra: string };
const user = computed(() => authStore.safeUser);

const userData = ref({} as any);
const userLoaded = ref(false);

// Aviso sutil de fase inicial
const showEarlyNotice = ref(true);

const quadraSelectRef = ref();
function focusQuadra() {
  quadraSelectRef.value?.focus?.();
}

/** ================= Tipos ================= */
type VideoFile = {
  name: string;
  path: string;
  bucket: string;
  size: number | null;
  last_modified: string | null;
};

type VideosListResponse = {
  bucket: string;
  prefix: string;
  count: number;
  files: VideoFile[];
  hasMore: boolean;
  nextOffset: number;
};

/** ================= Estado ================= */
const state = reactive({
  items: [] as VideoFile[],
  loading: false,
  error: null as string | null,
  hasMore: true,
  page: 1,
  pageSize: 5,
});

// Mapas de URLs assinadas (lazy)
const previewMap = reactive<Record<string, string | null | undefined>>({});
const downloadMap = reactive<Record<string, string | null | undefined>>({});

// Paginação explícita (sem infinite scroll)

/** ================= Utils ================= */
function getApiBase() {
  const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  if (envBase) return envBase.replace(/\/$/, "");
  return "https://api.gravanois-api.com.br";
}

function toClip(file: VideoFile): SportClip {
  const recordedAt = file.last_modified || new Date().toISOString();
  return {
    id: file.path,
    sport: "futebol",
    durationSec: 10,
    priceCents: 0,
    purchased: true,
    status: "pago",
    recordedAt,
    camera: "Cam-01",
    venue: "Grava Nóis",
    thumbUrl: thumbVideo as unknown as string,
    videoUrl: previewMap[file.path] || "",
  };
}

/** ================= Data Fetch ================= */
const isRefreshing = ref(false);
async function fetchPage() {
  isRefreshing.value = true;

  if (state.loading) return;
  state.loading = true;
  state.error = null;
  try {
    const clientId = "86015dcb-cdbe-406b-8ef8-f7cc6d5a6887";
    const venueId = "5b388420-8379-4418-80d9-5a9f7b2023cf";

    const base = getApiBase();
    const url = new URL(`${base}/api/videos/list`);
    url.searchParams.set("bucket", "temp");
    url.searchParams.set("prefix", `temp/${clientId}/${venueId}`);
    url.searchParams.set("limit", String(state.pageSize));
    const offset = (state.page - 1) * state.pageSize;
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("order", "desc");
    url.searchParams.set("ttl", "3600");

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`Falha ao listar vídeos: ${res.status}`);
    const data = (await res.json()) as VideosListResponse;
    state.items = data.files;
    state.hasMore = data.hasMore;
  } catch (e: any) {
    state.error = e?.message ?? "Erro ao carregar vídeos";
  } finally {
    state.loading = false;
    isRefreshing.value = false;
  }
}

function refresh() {
  state.page = 1;
  Object.keys(previewMap).forEach((k) => delete previewMap[k]);
  Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
  return fetchPage();
}

function nextPage() {
  if (state.loading || !state.hasMore) return;
  state.page += 1;
  Object.keys(previewMap).forEach((k) => delete previewMap[k]);
  Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
  fetchPage();
}

function prevPage() {
  if (state.loading || state.page <= 1) return;
  state.page -= 1;
  Object.keys(previewMap).forEach((k) => delete previewMap[k]);
  Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
  fetchPage();
}

function onChangePageSize(size: number) {
  if (!size || size === state.pageSize) return;
  state.pageSize = size;
  state.page = 1;
  Object.keys(previewMap).forEach((k) => delete previewMap[k]);
  Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
  fetchPage();
}

/** ================= Assinatura sob demanda ================= */
async function ensurePreview(path: string, bucket = "temp") {
  if (previewMap[path] !== undefined) return; // já buscado (sucesso ou falha)
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
    previewMap[path] = data?.url ?? null;
  } catch {
    previewMap[path] = null; // mantém vazio para não loopar
  }
}

async function signDownload(path: string, bucket = "temp") {
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
  downloadMap[path] = data?.url ?? null;
  return downloadMap[path];
}

async function onDownload(file: VideoFile) {
  const u = await signDownload(file.path, file.bucket);
  if (u) window.open(u, "_blank");
}

function onShow(file: VideoFile) {
  // dispara o carregamento sob demanda da prévia
  ensurePreview(file.path, file.bucket);
}

const selectedQuadra = ref<any>(null);
const availableQuadras = ref([] as any[]);

onMounted(() => {
  refresh();
  const storageUser = localStorage.getItem("grn-user");

  try {
    userData.value = storageUser ? JSON.parse(storageUser) : {};
  } catch {
    userData.value = {};
  }

  const q = (userData.value as any)?.quadras;
  availableQuadras.value = Array.isArray(q) ? q : q && typeof q === "object" ? Object.values(q) : [];

  userLoaded.value = true;
});

/**
 * Verifica se o usuário possui quadras vinculadas.
 * Aguarda o preenchimento inicial de `userData` (feito em onMounted).
 */
function verificaQuadrasUser(): boolean {
  if (!userLoaded.value) return false;
  const quadras = (userData.value as any)?.quadras;
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
