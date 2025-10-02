<template>
  <div class="loading-skeleton">
    <!-- Grid Layout -->
    <div v-if="variant === 'grid'" class="skeleton-grid">
      <v-card
        v-for="n in count"
        :key="n"
        class="skeleton-card"
        :loading="true"
      >
        <v-skeleton-loader
          type="image, article, actions"
          class="skeleton-card-content"
        />
      </v-card>
    </div>

    <!-- List Layout -->
    <div v-else-if="variant === 'list'" class="skeleton-list">
      <v-card
        v-for="n in count"
        :key="n"
        class="skeleton-list-item mb-3"
        :loading="true"
      >
        <div class="d-flex">
          <v-skeleton-loader type="image" class="skeleton-list-image" />
          <div class="flex-grow-1 pa-3">
            <v-skeleton-loader type="heading, text, chip" />
          </div>
        </div>
      </v-card>
    </div>

    <!-- Custom Content -->
    <div v-else>
      <v-skeleton-loader 
        :type="skeletonType" 
        :loading="true"
        class="skeleton-custom"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'grid' | 'list' | 'custom'
  count?: number
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'grid',
  count: 6,
  type: 'card'
})

const skeletonType = computed(() => {
  switch (props.type) {
    case 'card':
      return 'image, article, actions'
    case 'list-item':
      return 'avatar, text'
    case 'text':
      return 'heading, text'
    default:
      return props.type
  }
})
</script>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.skeleton-card {
  height: 320px;
}

.skeleton-card-content {
  height: 100%;
}

.skeleton-list-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
  
  .skeleton-list-image {
    width: 100px;
    height: 70px;
  }
}
</style>