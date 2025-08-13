<template>
  <v-chip 
    :color="badgeColor"
    :variant="badgeVariant"
    size="x-small"
    class="text-capitalize"
  >
    <v-icon :icon="badgeIcon" size="12" class="me-1" />
    {{ badgeText }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { customIcons } from '@/utils/icons'

interface Props {
  status: 'disponivel' | 'processando' | 'pago'
}

const props = defineProps<Props>()

const badgeConfig = computed(() => {
  switch (props.status) {
    case 'pago':
      return {
        color: 'success',
        variant: 'flat' as const,
        text: 'Pago',
        icon: customIcons.check
      }
    case 'processando':
      return {
        color: 'warning',
        variant: 'flat' as const,
        text: 'Processando',
        icon: customIcons.refresh
      }
    case 'disponivel':
    default:
      return {
        color: 'info',
        variant: 'outlined' as const,
        text: 'Disponível',
        icon: customIcons.information
      }
  }
})

const badgeColor = computed(() => badgeConfig.value.color)
const badgeVariant = computed(() => badgeConfig.value.variant)
const badgeText = computed(() => badgeConfig.value.text)
const badgeIcon = computed(() => badgeConfig.value.icon)
</script>