<template>
  <v-card 
    class="clip-card" 
    :class="{ 'clip-card--mobile': $vuetify.display.mobile }"
    @click="handleCardClick"
    style="cursor: pointer;"
  >
    <!-- Thumbnail -->
    <div class="position-relative">
      <v-img
        :src="clip.thumbUrl"
        :aspect-ratio="16/9"
        class="clip-thumbnail"
        cover
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center h-100">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </template>
      </v-img>
      
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
    </div>

    <!-- Card Content -->
    <v-card-text class="pb-2">
      <div class="d-flex justify-space-between align-start mb-2">
        <div class="flex-grow-1">
          <h3 class="text-subtitle-1 font-weight-medium text-truncate">
            {{ clip.venue }}
          </h3>
          <p class="text-caption text-medium-emphasis mb-1">
            {{ clip.camera }} • {{ formatDateTime(clip.recordedAt) }}
          </p>
        </div>
        
        <PaymentBadge :status="clip.status" class="ms-2" />
      </div>

      <div class="d-flex justify-space-between align-center">
        <div class="text-h6 text-primary font-weight-bold">
          R$ {{ formatPrice(clip.priceCents) }}
        </div>
        
        <DownloadButton 
          :clip="clip"
          @purchase="handlePurchase"
          @download="handleDownload"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { SportClip } from '@/store/clips'
import PaymentBadge from '@/components/PaymentBadge.vue'
import DownloadButton from '@/components/DownloadButton.vue'
import { customIcons } from '@/utils/icons'
import { 
  formatDuration, 
  formatPrice, 
  formatDateTime,
  getSportColor,
  getSportIcon,
  getSportLabel
} from '@/utils/formatters'

interface Props {
  clip: SportClip
}

interface Emits {
  (e: 'purchase', clipId: string): void
  (e: 'download', clipId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const handleCardClick = () => {
  router.push(`/lance/${props.clip.id}`)
}

const handlePurchase = () => {
  emit('purchase', props.clip.id)
}

const handleDownload = () => {
  emit('download', props.clip.id)
}
</script>

<style scoped>
.clip-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.clip-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.clip-card--mobile {
  margin-bottom: 16px;
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

@media (max-width: 960px) {
  .clip-card:hover {
    transform: none;
  }
}
</style>