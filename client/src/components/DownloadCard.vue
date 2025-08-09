<template>
  <v-card class="download-card" elevation="2">
    <!-- Thumbnail -->
    <div class="position-relative">
      <v-img
        :src="clip.thumbUrl"
        :aspect-ratio="16/9"
        class="clip-thumbnail"
        cover
      />
      
      <!-- Duration Badge -->
      <div class="duration-badge">
        {{ formatDuration(clip.durationSec) }}
      </div>
      
      <!-- Sport Badge -->
      <v-chip
        :color="getSportColor(clip.sport)"
        size="small"
        class="sport-badge"
      >
        <v-icon :icon="getSportIcon(clip.sport)" size="16" class="me-1" />
        {{ getSportLabel(clip.sport) }}
      </v-chip>

      <!-- Status Overlay -->
      <div class="status-overlay">
        <v-chip
          v-if="clip.downloadComplete"
          color="success"
          size="small"
        >
          <v-icon :icon="customIcons.check" size="16" class="me-1" />
          Concluído
        </v-chip>
        
        <v-chip
          v-else-if="clip.downloading"
          color="warning"
          size="small"
        >
          <v-icon :icon="customIcons.refresh" size="16" class="me-1" />
          Baixando
        </v-chip>
        
        <v-chip
          v-else-if="clip.downloadProgress && clip.downloadProgress > 0"
          color="info"
          size="small"
        >
          <v-icon :icon="customIcons.pause" size="16" class="me-1" />
          Pausado
        </v-chip>
      </div>
    </div>

    <!-- Card Content -->
    <v-card-text class="pb-2">
      <h3 class="text-subtitle-1 font-weight-medium text-truncate mb-1">
        {{ clip.venue }}
      </h3>
      
      <p class="text-caption text-medium-emphasis mb-2">
        {{ clip.camera }} • {{ formatDateTime(clip.recordedAt) }}
      </p>

      <!-- Progress Bar (if downloading or paused) -->
      <div 
        v-if="showProgress && (clip.downloadProgress || 0) > 0"
        class="mb-3"
      >
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-caption">Progresso</span>
          <span class="text-caption font-weight-medium">
            {{ Math.round(clip.downloadProgress || 0) }}%
          </span>
        </div>
        
        <v-progress-linear
          :model-value="clip.downloadProgress || 0"
          color="primary"
          height="6"
          rounded
        />
      </div>

      <!-- Actions -->
      <div class="d-flex align-center justify-space-between">
        <v-btn
          @click="$emit('view', clip.id)"
          variant="outlined"
          size="small"
        >
          Ver Detalhes
        </v-btn>

        <div class="d-flex align-center">
          <!-- Download Complete -->
          <v-btn
            v-if="clip.downloadComplete"
            @click="$emit('retry', clip.id)"
            variant="text"
            size="small"
            color="primary"
          >
            <v-icon :icon="customIcons.refresh" size="16" class="me-1" />
            Baixar Novamente
          </v-btn>

          <!-- Downloading -->
          <div v-else-if="clip.downloading" class="d-flex ga-1">
            <v-btn
              @click="$emit('pause', clip.id)"
              variant="flat"
              size="small"
              color="warning"
            >
              <v-icon :icon="customIcons.pause" size="16" class="me-1" />
              Pausar
            </v-btn>
          </div>

          <!-- Paused -->
          <div v-else-if="clip.downloadProgress && clip.downloadProgress > 0" class="d-flex ga-1">
            <v-btn
              @click="$emit('resume', clip.id)"
              variant="flat"
              size="small"
              color="primary"
            >
              <v-icon :icon="customIcons.play" size="16" class="me-1" />
              Continuar
            </v-btn>
            
            <v-btn
              @click="$emit('retry', clip.id)"
              variant="outlined"
              size="small"
            >
              <v-icon :icon="customIcons.refresh" size="16" />
            </v-btn>
          </div>

          <!-- Ready to Download -->
          <v-btn
            v-else
            @click="$emit('download', clip.id)"
            variant="flat"
            size="small"
            color="primary"
          >
            <v-icon :icon="customIcons.cloudDownload" size="16" class="me-1" />
            Baixar
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { SportClip } from '@/store/clips'
import { customIcons } from '@/utils/icons'
import { 
  formatDuration, 
  formatDateTime,
  getSportColor,
  getSportIcon,
  getSportLabel
} from '@/utils/formatters'

interface Props {
  clip: SportClip
  showProgress?: boolean
}

interface Emits {
  (e: 'download', clipId: string): void
  (e: 'pause', clipId: string): void
  (e: 'resume', clipId: string): void
  (e: 'retry', clipId: string): void
  (e: 'view', clipId: string): void
}

withDefaults(defineProps<Props>(), {
  showProgress: false
})

defineEmits<Emits>()
</script>

<style scoped>
.download-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.download-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.clip-thumbnail {
  border-radius: 4px 4px 0 0;
}

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

.sport-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}

.status-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>