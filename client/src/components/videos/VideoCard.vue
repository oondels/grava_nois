<template>
  <v-card
    class="video-card"
    rounded="xl"
    :elevation="hover ? 6 : 3"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="thumb-wrapper">
      <v-img :src="clip.thumbUrl" :aspect-ratio="16 / 9" cover :eager="false" class="thumb-img">
        <template #placeholder>
          <div class="d-flex align-center justify-center h-100">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </template>
      </v-img>

      <div class="thumb-gradient" />

      <!-- Duração -->
      <div class="badge duration" aria-label="Duração do clipe">
        {{ formatDuration(clip.durationSec) }}
      </div>

      <!-- Áudio opcional -->
      <div v-if="hasAudio" class="badge audio" aria-label="Com áudio">
        <v-icon icon="mdi-volume-high" size="16" />
      </div>

      <!-- Cadeado (pago) -->
      <div v-if="isLocked" class="badge lock" aria-label="Conteúdo pago">
        <v-icon icon="mdi-lock" size="16" />
      </div>

      <!-- Hover overlay / preview cue -->
      <div class="hover-overlay" :class="{ show: hover }">
        <v-icon icon="mdi-play" size="44" />
        <div class="text-caption text-medium-emphasis mt-2">Prévia</div>
      </div>
    </div>

    <v-card-text class="pt-3">
      <div class="d-flex align-center justify-space-between mb-1">
        <div class="text-subtitle-2 font-weight-medium text-truncate" :title="clip.venue">{{ clip.venue }}</div>
        <v-chip size="x-small" color="primary" variant="tonal">
          <v-icon :icon="getSportIcon(clip.sport)" size="16" class="me-1" />
          {{ getSportLabel(clip.sport) }}
        </v-chip>
      </div>

      <div class="d-flex align-center ga-3 text-medium-emphasis text-caption">
        <span class="d-inline-flex align-center ga-1">{{ clip.camera }}</span>
        <span class="d-inline-flex align-center ga-1">• {{ formatDateTime(clip.recordedAt) }}</span>
        <span class="d-inline-flex align-center ga-1">• HD</span>
      </div>

      <div class="d-flex flex-wrap ga-2 mt-3">
        <v-chip size="x-small" variant="tonal" color="secondary">{{ location?.estado }}</v-chip>
        <v-chip size="x-small" variant="tonal" color="secondary">{{ location?.cidade }}</v-chip>
        <v-chip size="x-small" variant="tonal" color="secondary" class="text-truncate max-w-100">{{
          location?.quadra
        }}</v-chip>
      </div>
    </v-card-text>

    <v-card-actions class="pt-0 action-row">
      <v-btn variant="text" :prepend-icon="'mdi-heart'" :color="favorite ? 'primary' : ''" @click.stop="toggleFavorite">
        Favoritar
      </v-btn>

      <v-btn color="primary" variant="tonal" :prepend-icon="'mdi-cloud-download'" @click.stop="$emit('download', clip)">
        Baixar
      </v-btn>
      <v-spacer />
      <!-- <v-btn v-if="isLocked" color="primary" variant="tonal" :prepend-icon="'mdi-lock-open-variant'" @click.stop="$emit('unlock', clip)">
        Desbloquear
      </v-btn>
      <v-btn v-else color="primary" variant="tonal" :prepend-icon="'mdi-cloud-download'" @click.stop="$emit('download', clip)">
        Baixar
      </v-btn> -->
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { formatDuration, formatDateTime, getSportIcon, getSportLabel } from "@/utils/formatters";
import type { SportClip } from "@/store/clips";

interface Location {
  estado: string;
  cidade: string;
  quadra: string;
}

interface Props {
  clip: SportClip;
  location?: Location | null;
  hasAudio?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasAudio: false,
});

const hover = ref(false);
const favorite = ref(false);
const isLocked = computed(() => !props.clip.purchased && props.clip.priceCents > 0);

function toggleFavorite() {
  favorite.value = !favorite.value;
}
</script>

<style scoped>
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
.thumb-img {
  filter: saturate(1.03);
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
