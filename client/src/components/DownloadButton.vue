<template>
  <div class="download-button-container">
    <!-- Not Purchased -->
    <v-btn
      v-if="!clip.purchased"
      @click.stop="$emit('purchase', clip.id)"
      :loading="isProcessing"
      color="secondary"
      variant="flat"
      :size="size"
    >
      <v-icon :icon="customIcons.cart" class="me-1" />
      Comprar
    </v-btn>

    <!-- Purchased but not downloaded -->
    <v-btn
      v-else-if="!isDownloading && !clip.downloadComplete"
      @click.stop="$emit('download', clip.id)"
      color="primary"
      variant="flat"
      :size="size"
    >
      <v-icon :icon="customIcons.cloudDownload" class="me-1" />
      Baixar
    </v-btn>

    <!-- Downloading -->
    <div v-else-if="isDownloading" class="download-progress-container">
      <v-btn
        @click.stop="handlePauseResume"
        color="warning"
        variant="flat"
        :size="size"
        class="mb-1"
      >
        <v-icon :icon="isPaused ? customIcons.play : customIcons.pause" class="me-1" />
        {{ isPaused ? 'Retomar' : 'Pausar' }}
      </v-btn>
      
      <v-progress-linear
        :model-value="clip.downloadProgress || 0"
        color="primary"
        height="4"
        rounded
        class="download-progress-bar"
      />
      
      <p class="text-caption text-center mt-1">
        {{ Math.round(clip.downloadProgress || 0) }}%
      </p>
    </div>

    <!-- Download Complete -->
    <div v-else-if="clip.downloadComplete" class="text-center">
      <v-btn
        color="success"
        variant="flat"
        :size="size"
        disabled
      >
        <v-icon :icon="customIcons.check" class="me-1" />
        Concluído
      </v-btn>
      
      <v-btn
        @click.stop="handleRetryDownload"
        variant="text"
        size="x-small"
        class="mt-1 d-block"
      >
        Baixar novamente
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SportClip } from '@/store/clips'
import { customIcons } from '@/utils/icons'

interface Props {
  clip: SportClip
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  isProcessing?: boolean
}

interface Emits {
  (e: 'purchase', clipId: string): void
  (e: 'download', clipId: string): void
  (e: 'pause', clipId: string): void
  (e: 'resume', clipId: string): void
  (e: 'retry', clipId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
  isProcessing: false
})

const emit = defineEmits<Emits>()

const isDownloading = computed(() => !!props.clip.downloading)
const isPaused = computed(() => 
  (props.clip.downloadProgress || 0) > 0 && !props.clip.downloading && !props.clip.downloadComplete
)

const handlePauseResume = () => {
  if (isDownloading.value) {
    emit('pause', props.clip.id)
  } else {
    emit('resume', props.clip.id)
  }
}

const handleRetryDownload = () => {
  emit('retry', props.clip.id)
}
</script>

<style scoped>
.download-button-container {
  min-width: 100px;
}

.download-progress-container {
  min-width: 120px;
}

.download-progress-bar {
  margin-top: 4px;
}
</style>