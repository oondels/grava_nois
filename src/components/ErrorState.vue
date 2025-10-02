<template>
  <div class="error-state text-center py-8">
    <v-icon 
      :icon="customIcons.alert" 
      size="64" 
      color="error" 
      class="mb-4"
    />
    
    <h3 class="text-h6 font-weight-medium mb-2">
      {{ title }}
    </h3>
    
    <p class="text-body-1 text-medium-emphasis mb-4" style="max-width: 400px; margin: 0 auto;">
      {{ description }}
    </p>

    <v-btn
      @click="handleRetry"
      color="primary"
      variant="flat"
    >
      <v-icon :icon="customIcons.refresh" class="me-1" />
      Tentar novamente
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { customIcons } from '@/utils/icons'

interface Props {
  title?: string
  description?: string
}

interface Emits {
  (e: 'retry'): void
}

withDefaults(defineProps<Props>(), {
  title: 'Ops! Algo deu errado',
  description: 'Não foi possível carregar o conteúdo. Verifique sua conexão e tente novamente.'
})

const emit = defineEmits<Emits>()

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>