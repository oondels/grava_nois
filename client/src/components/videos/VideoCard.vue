<template>
  <v-card
    class="video-card"
    rounded="xl"
    :elevation="hover ? 6 : 3"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="thumb-wrapper">
      <template v-if="clip.videoUrl">
        <video class="thumb-video" :src="clip.videoUrl" controls preload="none" playsinline />
      </template>

      <template v-else>
        <!-- Foto pre carregada antes do clipe ser disponibiliado para assistir -->
        <v-img :src="clip.thumbUrl" :aspect-ratio="16 / 9" cover :eager="false" class="thumb-img">
          <template #placeholder>
            <div class="d-flex align-center justify-center h-100">
              <v-progress-circular indeterminate color="primary" />
            </div>
          </template>

          <!-- Play Button Overlay -->
          <div class="play-overlay" :class="{ show: hover || isTouchDevice }">
            <v-btn
              icon
              size="x-large"
              variant="elevated"
              color="white"
              :disabled="showDisabled"
              @click.stop="$emit('show', clip)"
              class="play-button"
            >
              <v-icon :icon="customIcons.play" size="32" color="primary" />
            </v-btn>
          </div>
        </v-img>
      </template>

      <div class="thumb-gradient"></div>

      <!-- Funcionalidades futuras -->
      <div>
        <!-- <div class="badge duration" aria-label="Duração do clipe">
        {{ formatDuration(clip.durationSec) }}
      </div>

      <div v-if="hasAudio" class="badge audio" aria-label="Com áudio">
        <v-icon :icon="customIcons.volumeHigh" size="16" />
      </div>

      <div v-if="isLocked" class="badge lock" aria-label="Conteúdo pago">
        <v-icon :icon="customIcons.lock" size="16" />
      </div>

      <div class="hover-overlay" :class="{ show: hover }">
        <v-icon :icon="customIcons.play" size="44" />
        <div class="text-caption text-medium-emphasis mt-2">Prévia</div>
      </div> -->
      </div>
    </div>

    <v-card-text class="pt-3">
      <!-- <div class="d-flex align-center justify-space-between mb-1">
        <div class="text-subtitle-2 font-weight-medium text-truncate" :title="clip.venue">{{ clip.venue }}</div>
        <v-chip size="x-small" color="primary" variant="tonal">
          <v-icon :icon="getSportIcon(clip.sport)" size="16" class="me-1" />
          {{ getSportLabel(clip.sport) }}
        </v-chip>
      </div> -->

      <div class="flex items-center gap-2 text-sm text-gray-600">
        <div class="flex items-center gap-1">
          <v-icon :icon="customIcons.clock" size="14" class="text-green-500" />
          <span class="text-green-500">{{ formatters.formatLastModified(clip.recordedAt) }}</span>
        </div>
        <div class="w-1 h-1 bg-gray-400 rounded-full"></div>
        <div class="flex items-center gap-1">
          <!-- <v-icon icon="mdi-high-definition" size="14" class="text-blue-500" /> -->
          <span class="font-medium text-red-600">HD</span>
        </div>
      </div>

      <!-- <div class="d-flex flex-wrap ga-2 mt-3">
        <v-chip size="x-small" variant="tonal" color="secondary">{{ location?.estado }}</v-chip>
        <v-chip size="x-small" variant="tonal" color="secondary">{{ location?.cidade }}</v-chip>
        <v-chip size="x-small" variant="tonal" color="secondary" class="text-truncate max-w-100">{{
          location?.quadra
        }}</v-chip>
      </div> -->
    </v-card-text>

    <v-card-actions class="pt-0 action-row">

      <div class="d-flex align-center justify-space-between w-100 pa-3">
        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <!-- <v-btn
            variant="elevated"
            color="primary"
            size="default"
            prepend-icon="mdi-play"
            :disabled="showDisabled"
            @click.stop="$emit('show', clip)"
            class="primary-action-btn"
          >
            <span class="hidden sm:inline">Assistir</span>
            <span class="sm:hidden">Play</span>
          </v-btn> -->

          <v-btn
            variant="outlined"
            color="secondary"
            size="small"
            density="compact"
            prepend-icon="mdi-download"
            @click.stop="$emit('download', clip)"
            class="secondary-action-btn"
          >
            <span>Baixar</span>
            <!-- <v-icon class="sm:hidden">mdi-download</v-icon> -->
          </v-btn>
        </div>

        <div class="flex items-center gap-2 relative p-3">
          <v-tooltip text="Curtir vídeo" location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon
                variant="text"
                size="small"
                :color="favorite ? 'red' : 'grey'"
                @click.stop="toggleFavorite"
                class="social-btn"
                disabled
              >
                <v-icon :icon="favorite ? 'mdi-heart' : 'mdi-heart-outline'" />
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Comentar" location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn v-bind="tooltipProps" icon variant="text" size="small" color="grey" class="social-btn" disabled>
                <v-icon icon="mdi-comment-outline" />
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Compartilhar" location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn v-bind="tooltipProps" icon variant="text" size="small" color="grey" class="social-btn" disabled>
                <v-icon icon="mdi-share-variant" />
              </v-btn>
            </template>
          </v-tooltip>

          <span class="absolute bottom-0 right-0">
            <v-chip size="x-small" color="amber" variant="elevated" class="ml-2">
              <v-icon :icon="customIcons.clock" size="12" class="mr-1" />
              em breve
            </v-chip>
          </span>
        </div>
      </div>
      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted as vueOnMounted } from "vue";
import * as formatters from '@/utils/formatters'
import type { SportClip } from "@/store/clips";
import { customIcons } from "@/utils/icons";

interface Location {
  estado: string;
  cidade: string;
  quadra: string;
}

interface Props {
  clip: SportClip;
  location?: Location | null;
  hasAudio?: boolean;
  showDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasAudio: false,
  showDisabled: false,
});

const hover = ref(false);
const favorite = ref(false);
const isTouchDevice = ref(false);
const isLocked = computed(() => !props.clip.purchased && props.clip.priceCents > 0);

// Detecta se é um dispositivo touch
vueOnMounted(() => {
  isTouchDevice.value = "ontouchstart" in window || navigator.maxTouchPoints > 0;
});

function toggleFavorite() {
  favorite.value = !favorite.value;
}
</script>

<style scoped>
/* Play Button Overlay */
.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.play-overlay.show {
  opacity: 1;
}

/* Mobile: sempre mostrar com menor opacidade */
@media (max-width: 768px) {
  .play-overlay {
    opacity: 0.7;
    background: rgba(0, 0, 0, 0.7);
  }

  .play-overlay.show {
    opacity: 1;
    background: rgba(0, 0, 0, 0.3);
  }
}

.play-button {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.play-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
}

/* Mobile: área de toque maior */
@media (max-width: 768px) {
  .play-button {
    min-width: 64px;
    min-height: 64px;
  }
}

/* Primary Action Button */
.primary-action-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.primary-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Secondary Action Button */
.secondary-action-btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.secondary-action-btn:hover {
  transform: translateY(-1px);
}

/* Social Buttons */
.social-btn {
  transition: all 0.2s ease;
}

.social-btn:hover {
  transform: scale(1.1);
}

/* Responsive design */
@media (max-width: 640px) {
  .primary-action-btn {
    min-width: 80px;
  }

  .secondary-action-btn {
    min-width: 48px;
  }
}

.video-card {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.video-card:hover {
  transform: translateY(-2px);
}

.thumb-wrapper {
  position: relative;
}
.thumb-video {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
}
.thumb-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.45) 100%);
  pointer-events: none;
}
.badge {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}
.duration {
  right: 8px;
  bottom: 8px;
}
.audio {
  left: 8px;
  top: 8px;
}
.lock {
  right: 8px;
  top: 8px;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 160ms ease;
  backdrop-filter: blur(0px);
}
.hover-overlay.show {
  opacity: 0.9;
  backdrop-filter: blur(1px);
}

.max-w-100 {
  max-width: 100%;
}

/* Mobile-first: larger tap targets */
.action-row :deep(.v-btn) {
  min-height: 44px;
}
@media (min-width: 600px) {
  .action-row :deep(.v-btn) {
    min-height: 36px;
  }
}
</style>
