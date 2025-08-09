<template>
  <v-container class="py-4" fluid>
    <div v-if="clip">
      <!-- Breadcrumb -->
      <v-breadcrumbs
        :items="breadcrumbItems"
        class="pa-0 mb-4"
      />

      <v-row>
        <!-- Video Player Section -->
        <v-col cols="12" lg="8">
          <v-card class="video-card" elevation="2">
            <!-- Video Player -->
            <div class="video-player-container">
              <video
                ref="videoPlayer"
                :src="clip.videoUrl"
                :poster="clip.thumbUrl"
                controls
                class="video-player"
                @loadedmetadata="handleVideoLoaded"
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>

            <!-- Video Controls -->
            <v-card-text class="pt-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                  <v-chip :color="getSportColor(clip.sport)" class="me-2">
                    <v-icon :icon="getSportIcon(clip.sport)" size="16" class="me-1" />
                    {{ getSportLabel(clip.sport) }}
                  </v-chip>
                  
                  <PaymentBadge :status="clip.status" />
                </div>

                <div class="d-flex align-center">
                  <v-btn
                    @click="handleShare"
                    :icon="customIcons.share"
                    variant="text"
                    size="small"
                    class="me-2"
                  />
                  
                  <DownloadButton
                    :clip="clip"
                    :is-processing="clipsStore.loading"
                    size="default"
                    @purchase="handlePurchaseRequest"
                    @download="handleDownload"
                    @pause="handlePauseDownload"
                    @resume="handleResumeDownload"
                    @retry="handleRetryDownload"
                  />
                </div>
              </div>

              <!-- Title and Description -->
              <h1 class="text-h5 font-weight-bold mb-2">
                Lance - {{ clip.venue }}
              </h1>
              
              <p class="text-body-1 text-medium-emphasis mb-3">
                Registrado em {{ formatDateTime(clip.recordedAt) }} pela {{ clip.camera }}
              </p>

              <!-- Video Stats -->
              <div class="video-stats d-flex align-center flex-wrap ga-4">
                <div class="d-flex align-center">
                  <v-icon :icon="customIcons.play" size="16" class="me-1" />
                  <span class="text-body-2">{{ formatDuration(clip.durationSec) }}</span>
                </div>
                
                <div class="d-flex align-center">
                  <v-icon :icon="customIcons.calendar" size="16" class="me-1" />
                  <span class="text-body-2">{{ formatDateTime(clip.recordedAt) }}</span>
                </div>
                
                <div class="d-flex align-center">
                  <span class="text-h6 text-primary font-weight-bold">
                    R$ {{ formatPrice(clip.priceCents) }}
                  </span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" lg="4">
          <div class="sidebar">
            <!-- Metadata Card -->
            <v-card class="mb-4" elevation="1">
              <v-card-title class="text-h6">
                Detalhes do Lance
              </v-card-title>
              
              <v-card-text>
                <v-list lines="two" class="pa-0">
                  <v-list-item>
                    <v-list-item-title>Local</v-list-item-title>
                    <v-list-item-subtitle>{{ clip.venue }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>Câmera</v-list-item-title>
                    <v-list-item-subtitle>{{ clip.camera }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>Esporte</v-list-item-title>
                    <v-list-item-subtitle>{{ getSportLabel(clip.sport) }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>Duração</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDuration(clip.durationSec) }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>Status</v-list-item-title>
                    <v-list-item-subtitle>
                      <PaymentBadge :status="clip.status" />
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <!-- Download Progress (if downloading) -->
            <v-card 
              v-if="clip.downloading || (clip.downloadProgress && clip.downloadProgress > 0)"
              class="mb-4"
              elevation="1"
            >
              <v-card-title class="text-h6">
                <v-icon :icon="customIcons.download" class="me-2" />
                Download
              </v-card-title>
              
              <v-card-text>
                <div class="text-center">
                  <v-progress-circular
                    :model-value="clip.downloadProgress || 0"
                    :size="80"
                    :width="8"
                    color="primary"
                    class="mb-2"
                  >
                    {{ Math.round(clip.downloadProgress || 0) }}%
                  </v-progress-circular>
                  
                  <p class="text-body-2 text-medium-emphasis">
                    {{ clip.downloading ? 'Baixando...' : 
                        clip.downloadComplete ? 'Concluído!' : 'Pausado' }}
                  </p>
                  
                  <div class="d-flex ga-2 justify-center mt-3">
                    <v-btn
                      v-if="clip.downloading"
                      @click="handlePauseDownload"
                      variant="outlined"
                      size="small"
                    >
                      <v-icon :icon="customIcons.pause" class="me-1" />
                      Pausar
                    </v-btn>
                    
                    <v-btn
                      v-else-if="!clip.downloadComplete"
                      @click="handleResumeDownload"
                      color="primary"
                      variant="flat"
                      size="small"
                    >
                      <v-icon :icon="customIcons.play" class="me-1" />
                      Continuar
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Similar Clips -->
            <v-card elevation="1">
              <v-card-title class="text-h6">
                Lances Similares
              </v-card-title>
              
              <v-card-text>
                <div v-if="similarClips.length > 0">
                  <div
                    v-for="similarClip in similarClips"
                    :key="similarClip.id"
                    @click="$router.push(`/lance/${similarClip.id}`)"
                    class="similar-clip-item d-flex mb-3"
                    style="cursor: pointer;"
                  >
                    <v-img
                      :src="similarClip.thumbUrl"
                      width="60"
                      height="40"
                      class="flex-shrink-0 rounded me-3"
                      cover
                    />
                    
                    <div class="flex-grow-1">
                      <p class="text-body-2 font-weight-medium mb-1">
                        {{ similarClip.venue }}
                      </p>
                      <p class="text-caption text-medium-emphasis">
                        {{ getSportLabel(similarClip.sport) }} • {{ formatDuration(similarClip.durationSec) }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <EmptyState
                  v-else
                  title="Nenhum lance similar"
                  description="Não encontramos outros lances similares no momento."
                  :icon="customIcons.information"
                />
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-8">
      <ErrorState
        title="Lance não encontrado"
        description="O lance que você procura não foi encontrado ou não existe mais."
        @retry="handleGoBack"
      />
    </div>

    <!-- Checkout Modal -->
    <CheckoutMock
      v-model="checkoutDialog"
      :clip="clip"
      @purchase="handlePurchase"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClipsStore } from '@/store/clips'
import PaymentBadge from '@/components/PaymentBadge.vue'
import DownloadButton from '@/components/DownloadButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import CheckoutMock from '@/components/CheckoutMock.vue'
import { customIcons } from '@/utils/icons'
import { 
  formatDuration, 
  formatPrice, 
  formatDateTime,
  getSportColor,
  getSportIcon,
  getSportLabel
} from '@/utils/formatters'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const route = useRoute()
const clipsStore = useClipsStore()
const { showSnackbar } = useSnackbar()

const videoPlayer = ref<HTMLVideoElement>()
const checkoutDialog = ref(false)

const clipId = computed(() => route.params.id as string)
const clip = computed(() => clipsStore.getClipById(clipId.value))

const breadcrumbItems = computed(() => [
  {
    title: 'Meus Lances',
    disabled: false,
    to: '/meus-lances'
  },
  {
    title: clip.value?.venue || 'Lance',
    disabled: true
  }
])

const similarClips = computed(() => {
  if (!clip.value) return []
  
  return clipsStore.clips
    .filter(c => 
      c.id !== clip.value!.id && 
      c.sport === clip.value!.sport
    )
    .slice(0, 3)
})

const handleVideoLoaded = () => {
  console.log('Video loaded')
}

const handleShare = async () => {
  const url = window.location.href
  
  try {
    await navigator.clipboard.writeText(url)
    showSnackbar('Link copiado para a área de transferência!', 'success')
  } catch (error) {
    showSnackbar('Não foi possível copiar o link', 'error')
  }
}

const handlePurchaseRequest = () => {
  if (clip.value) {
    checkoutDialog.value = true
  }
}

const handlePurchase = async (clipId: string) => {
  const success = await clipsStore.purchase(clipId)
  
  if (success) {
    showSnackbar('Compra confirmada! O lance já está disponível para download.', 'success')
    checkoutDialog.value = false
  } else {
    showSnackbar('Erro ao processar compra. Tente novamente.', 'error')
  }
}

const handleDownload = () => {
  if (clip.value) {
    clipsStore.startDownload(clip.value.id)
    showSnackbar('Download iniciado!', 'info')
  }
}

const handlePauseDownload = () => {
  if (clip.value) {
    clipsStore.pauseDownload(clip.value.id)
    showSnackbar('Download pausado', 'info')
  }
}

const handleResumeDownload = () => {
  if (clip.value) {
    clipsStore.resumeDownload(clip.value.id)
    showSnackbar('Download retomado!', 'info')
  }
}

const handleRetryDownload = () => {
  if (clip.value) {
    clipsStore.retryDownload(clip.value.id)
    showSnackbar('Reiniciando download...', 'info')
  }
}

const handleGoBack = () => {
  router.push('/meus-lances')
}

onMounted(() => {
  if (!clip.value) {
    showSnackbar('Lance não encontrado', 'error')
  }
})
</script>

<style scoped>
.video-card {
  overflow: hidden;
}

.video-player-container {
  position: relative;
  width: 100%;
  background: #000;
}

.video-player {
  width: 100%;
  height: auto;
  min-height: 300px;
  display: block;
}

.video-stats {
  padding: 12px 0;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.similar-clip-item {
  transition: all 0.2s ease;
}

.similar-clip-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  padding: 8px;
  margin: -8px;
}

.sidebar {
  position: sticky;
  top: 24px;
}

@media (max-width: 1264px) {
  .sidebar {
    position: static;
  }
  
  .video-player {
    min-height: 250px;
  }
}
</style>