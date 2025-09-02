<template>
  <v-container class="py-6" fluid>
    <!-- Header -->
    <div class="d-flex justify-center align-center mb-4">
      <img class="gravanois-logo" :src="LogoGravaNoisCol" alt="Logo Grava Nóis" />
    </div>

    <div class="d-flex align-center justify-center mb-4 flex-wrap ga-4">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Replays e Lances</h1>
        <p class="text-medium-emphasis mb-0">Resgate seus melhores lances</p>
      </div>
    </div>

    <!-- Aviso sutil: fase inicial -->
    <v-alert
      v-if="showEarlyNotice"
      type="warning"
      variant="tonal"
      border="start"
      rounded="lg"
      density="comfortable"
      class="mb-6"
    >
      <div class="d-flex align-center justify-space-between ga-3 position-relative">
        <div class="text-body-2">
          Este aplicativo está em fase inicial (beta). Pedimos um pouco de paciência e, por favor, reporte qualquer erro
          que encontrar.
        </div>

        <div class="d-flex align-center ga-2 mt-4">
          <v-btn
            size="small"
            variant="outlined"
            color="red"
            :to="{ path: '/reportar-erro', query: { page: 'Lances / Grava Nóis' } }"
          >
            Reportar
          </v-btn>
        </div>

        <v-btn
          class="position-absolute"
          style="top: -10px; right: -10px"
          size="small"
          variant="text"
          icon
          @click="showEarlyNotice = false"
          :aria-label="'Fechar aviso'"
        >
          <v-icon class="mdi mdi-close" />
        </v-btn>
      </div>
    </v-alert>

    <v-btn color="success" variant="outlined" prepend-icon="mdi mdi-reload" class="mb-3" @click="refresh">
      Atualizar Vídeos
    </v-btn>

    <v-sheet class="mb-6" color="surface" rounded="lg" border>
      <div class="d-flex align-center justify-space-between px-4 py-3">
        <div class="text-caption text-medium-emphasis">
          {{ state.items.length }} itens
          <span v-if="state.loading && !state.items.length">• carregando…</span>
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
        <v-alert type="error" variant="tonal">{{ state.error }}</v-alert>
      </div>

      <!-- Lista -->
      <div v-else class="px-4 pb-4">
        <v-row>
          <v-col v-for="file in state.items" :key="file.path" cols="12" sm="6" md="4" lg="3">
            <v-card rounded="xl" elevation="3" class="result-card">
              <div class="thumb-wrapper" v-intersect="() => ensurePreview(file.path, file.bucket)">
                <div class="thumb-video">
                  <v-chip size="small" color="grey-darken-1" class="date-badge mb-2" variant="outlined">
                    {{ formatLastModified(file.last_modified) }}
                  </v-chip>

                  <video
                    v-if="previewMap[file.path]"
                    :src="previewMap[file.path]!"
                    controls
                    preload="none"
                    playsinline
                    style="width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px 12px 0 0"
                  />
                  <div
                    v-else
                    class="d-flex align-center justify-center"
                    style="width: 100%; aspect-ratio: 16/9; background: #111; color: #ccc; border-radius: 12px 12px 0 0"
                  >
                    Carregando prévia…
                  </div>
                </div>
              </div>

              <v-card-actions class="pt-0">
                <v-btn
                  size="small"
                  variant="outlined"
                  :href="previewMap[file.path] || undefined"
                  target="_blank"
                  prepend-icon="mdi mdi-play"
                  :disabled="!previewMap[file.path]"
                >
                  Abrir
                </v-btn>

                <v-spacer />

                <v-btn
                  size="small"
                  color="green"
                  variant="outlined"
                  prepend-icon="mdi mdi-download"
                  :disabled="!previewMap[file.path]"
                  @click="onDownload(file)"
                >
                  Baixar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Infinite scroll sentinel -->
        <div ref="sentinel" style="height: 1px"></div>

        <div
          class="d-flex align-center justify-center py-4 text-medium-emphasis"
          v-if="state.loading && state.items.length"
        >
          Carregando mais…
        </div>
        <div
          class="d-flex align-center justify-center py-2 text-disabled"
          v-else-if="!state.hasMore && state.items.length"
        >
          Fim da lista
        </div>
      </div>
    </v-sheet>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, onBeforeUnmount } from "vue";
// import { useClipsStore } from "@/store/clips";
import { getSportIcon } from "@/utils/formatters";
// import { customIcons } from "@/utils/icons";
import LogoGravaNoisCol from "@/assets/icons/grava-nois.webp";

type LocalLocation = { estado: string; cidade: string; quadra: string };

// Aviso sutil de fase inicial
const showEarlyNotice = ref(true);

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
  offset: 0,
  pageSize: 24,
});

// Mapas de URLs assinadas (lazy)
const previewMap = reactive<Record<string, string | null | undefined>>({});
const downloadMap = reactive<Record<string, string | null | undefined>>({});

// Sentinel para infinite scroll
const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

/** ================= Utils ================= */
function getApiBase() {
  const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  if (envBase) return envBase.replace(/\/$/, "");
  return "https://api.gravanois-api.com.br"; // fallback
}

function formatLastModified(dateString: any) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")} - ${date.getDate()} ${months[date.getMonth()]} - ${date.getFullYear()}`;
}

/** ================= Data Fetch ================= */
async function fetchPage(reset = false) {
  if (state.loading) return;
  state.loading = true;
  state.error = null;
  try {
    // TODO: futuramente coletar client/venue do usuário logado/filtros
    const clientId = "86015dcb-cdbe-406b-8ef8-f7cc6d5a6887";
    const venueId = "5b388420-8379-4418-80d9-5a9f7b2023cf";

    const base = getApiBase();
    const url = new URL(`${base}/api/videos/list`);
    url.searchParams.set("bucket", "temp");
    url.searchParams.set("prefix", `temp/${clientId}/${venueId}`);
    url.searchParams.set("limit", String(state.pageSize));
    url.searchParams.set("offset", String(reset ? 0 : state.offset));
    url.searchParams.set("order", "desc");
    url.searchParams.set("ttl", "3600");

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`Falha ao listar vídeos: ${res.status}`);
    const data = (await res.json()) as VideosListResponse;

    if (reset) {
      state.items = [];
      state.offset = 0;
      state.hasMore = true;
      // limpa mapas de preview/download
      Object.keys(previewMap).forEach((k) => delete previewMap[k]);
      Object.keys(downloadMap).forEach((k) => delete downloadMap[k]);
    }

    state.items.push(...data.files);
    state.hasMore = data.hasMore;
    state.offset = data.nextOffset ?? state.offset + data.files.length;
  } catch (e: any) {
    state.error = e?.message ?? "Erro ao carregar vídeos";
  } finally {
    state.loading = false;
  }
}

function refresh() {
  return fetchPage(true);
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

/** ================= Lifecycle ================= */
onMounted(() => {
  // Carrega a primeira página
  refresh();

  // Infinite scroll real (liga no sentinel)
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && state.hasMore && !state.loading) {
          fetchPage(false);
        }
      }
    },
    { rootMargin: "600px" }
  ); // carrega antes de chegar no fim
  if (sentinel.value) observer.observe(sentinel.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
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
}

@media (min-width: 600px) {
  :root {
    --gn-sticky-top: 64px;
  }
}
</style>
