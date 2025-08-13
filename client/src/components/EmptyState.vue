<template>
  <div class="empty-state text-center py-8">
    <v-icon 
      :icon="icon" 
      size="64" 
      color="medium-emphasis" 
      class="mb-4"
    />
    
    <h3 class="text-h6 font-weight-medium mb-2">
      {{ title }}
    </h3>
    
    <p class="text-body-1 text-medium-emphasis mb-4" style="max-width: 400px; margin: 0 auto;">
      {{ description }}
    </p>

    <slot name="action">
      <v-btn
        v-if="actionText && actionHandler"
        @click="actionHandler"
        color="primary"
        variant="flat"
      >
        {{ actionText }}
      </v-btn>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { customIcons } from '@/utils/icons'

interface Props {
  title: string
  description: string
  icon?: string
  actionText?: string
  actionHandler?: () => void
}

withDefaults(defineProps<Props>(), {
  icon: customIcons.information
})
</script>

<style scoped>
.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>