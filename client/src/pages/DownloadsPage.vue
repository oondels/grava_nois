<template>
  <v-container class="py-4" fluid>
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">
          Downloads
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          Gerencie seus downloads e acesse seus lances comprados
        </p>
      </div>
      
      <!-- Stats -->
      <div v-if="purchasedClips.length > 0" class="text-right">
        <p class="text-h6 font-weight-medium mb-0">
          {{ completedDownloads }} / {{ purchasedClips.length }}
        </p>
        <p class="text-body-2 text-medium-emphasis">
          downloads concluídos
        </p>
      </div>
    </div>

    <!-- Content -->
    <div v-if="purchasedClips.length === 0">
      <EmptyState
        title="Nenhum lance comprado"
        description="Você ainda não comprou nenhum lance. Explore nossa biblioteca e encontre os melhores momentos do seu esporte favorito."
        :icon="customIcons.download"
        action-text="Ver Lances"
        :action-handler="() => $router.push('/meus-lances')"
      />
    </div>

    <div v-else>
      <!-- Active Downloads -->
      <div v-if="activeDownloads.length > 0" class="mb-6">
        <h2 class="text-h6 font-weight-medium mb-4">
          <v-icon :icon="customIcons.refresh" class="me-2" />
          Downloads Ativos
        </h2>
        
        <v-row>
          <v-col
            v-for="clip in activeDownloads"
            :key="`active-${clip.id}`"
            cols="12"
            md="6"
            lg="4"
          >
            <DownloadCard 
              :clip="clip"
              :show-progress="true"
              @pause="handlePause"
              @resume="handleResume"
              @retry="handleRetry"
              @view="handleViewClip"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Completed Downloads -->
      <div v-if="completedClips.length > 0">
        <h2 class="text-h6 font-weight-medium mb-4">
          <v-icon :icon="customIcons.check" class="me-2" />
          Downloads Concluídos
        </h2>
        
        <v-row>
          <v-col
            v-for="clip in completedClips"
            :key="`completed-${clip.id}`"
            cols="12"
            md="6"
            lg="4"
          >
            <DownloadCard 
              :clip="clip"
              @retry="handleRetry"
              @view="handleViewClip"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Purchased but not downloaded -->
      <div v-if="availableForDownload.length > 0">
        <h2 class="text-h6 font-weight-medium mb-4">
          <v-icon :icon="customIcons.cloudDownload" class="me-2" />
          Disponíveis para Download
        </h2>
        
        <v-row>
          <v-col
            v-for="clip in availableForDownload"
            :key="`available-${clip.id}`"
            cols="12"
            md="6"
            lg="4"
          >
            <DownloadCard 
              :clip="clip"
              @download="handleDownload"
              @view="handleViewClip"
            />
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClipsStore } from '@/store/clips'
import EmptyState from '@/components/EmptyState.vue'
import DownloadCard from '@/components/DownloadCard.vue'
import { customIcons } from '@/utils/icons'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const clipsStore = useClipsStore()
const { showSnackbar } = useSnackbar()

const purchasedClips = computed(() => clipsStore.purchasedClips)

const activeDownloads = computed(() =>
  purchasedClips.value.filter(clip => 
    clip.downloading || (clip.downloadProgress && clip.downloadProgress > 0 && !clip.downloadComplete)
  )
)

const completedClips = computed(() =>
  purchasedClips.value.filter(clip => clip.downloadComplete)
)

const availableForDownload = computed(() =>
  purchasedClips.value.filter(clip => 
    !clip.downloading && 
    (!clip.downloadProgress || clip.downloadProgress === 0) && 
    !clip.downloadComplete
  )
)

const completedDownloads = computed(() => completedClips.value.length)

const handleDownload = (clipId: string) => {
  clipsStore.startDownload(clipId)
  showSnackbar('Download iniciado!', 'info')
}

const handlePause = (clipId: string) => {
  clipsStore.pauseDownload(clipId)
  showSnackbar('Download pausado', 'info')
}

const handleResume = (clipId: string) => {
  clipsStore.resumeDownload(clipId)
  showSnackbar('Download retomado!', 'info')
}

const handleRetry = (clipId: string) => {
  clipsStore.retryDownload(clipId)
  showSnackbar('Reiniciando download...', 'info')
}

const handleViewClip = (clipId: string) => {
  router.push(`/lance/${clipId}`)
}
</script>