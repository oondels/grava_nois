<template>
  <v-container class="py-4" fluid>
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">
          Meus Lances
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Encontre e baixe seus melhores momentos esportivos
          <v-chip v-if="authStore.isDemoMode" color="secondary" size="small" class="ms-2">
            DEMO
          </v-chip>
        </p>
      </div>
      
      <!-- Results Counter -->
      <div v-if="!clipsStore.loading && clipsStore.filteredClips.length > 0" class="text-right">
        <p class="text-h6 font-weight-medium mb-0">
          {{ clipsStore.filteredClips.length }}
        </p>
        <p class="text-body-2 text-medium-emphasis">
          {{ clipsStore.filteredClips.length === 1 ? 'lance encontrado' : 'lances encontrados' }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <ClipFilters />

    <!-- Content Area -->
    <div class="content-area">
      <!-- Loading State -->
      <LoadingSkeleton 
        v-if="clipsStore.loading" 
        variant="grid" 
        :count="6" 
      />

      <!-- Error State -->
      <ErrorState 
        v-else-if="clipsStore.error"
        :title="clipsStore.error"
        description="Não foi possível carregar os lances. Verifique sua conexão e tente novamente."
        @retry="handleRetry"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="clipsStore.filteredClips.length === 0"
        title="Nenhum lance encontrado"
        description="Tente ajustar os filtros ou aguarde novos lances serem disponibilizados."
        :icon="customIcons.information"
        action-text="Limpar filtros"
        :action-handler="clipsStore.clearFilters"
      />

      <!-- Clips Grid/List -->
      <div v-else>
        <!-- Desktop Grid -->
        <div 
          v-if="!$vuetify.display.mobile" 
          class="clips-grid"
        >
          <ClipCard
            v-for="clip in clipsStore.filteredClips"
            :key="clip.id"
            :clip="clip"
            @purchase="handlePurchaseRequest"
            @download="handleDownload"
          />
        </div>

        <!-- Mobile List -->
        <div v-else class="clips-list">
          <ClipCard
            v-for="clip in clipsStore.filteredClips"
            :key="clip.id"
            :clip="clip"
            @purchase="handlePurchaseRequest"
            @download="handleDownload"
          />
        </div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <CheckoutMock
      v-model="checkoutDialog"
      :clip="selectedClip"
      @purchase="handlePurchase"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useClipsStore } from '@/store/clips'
import type { SportClip } from '@/store/clips'
import ClipFilters from '@/components/ClipFilters.vue'
import ClipCard from '@/components/ClipCard.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import CheckoutMock from '@/components/CheckoutMock.vue'
import { customIcons } from '@/utils/icons'
import { useSnackbar } from '@/composables/useSnackbar'

const authStore = useAuthStore()
const clipsStore = useClipsStore()
const { showSnackbar } = useSnackbar()

const checkoutDialog = ref(false)
const selectedClip = ref<SportClip | null>(null)

const handlePurchaseRequest = (clipId: string) => {
  const clip = clipsStore.getClipById(clipId)
  if (clip) {
    selectedClip.value = clip
    checkoutDialog.value = true
  }
}

const handlePurchase = async (clipId: string) => {
  const success = await clipsStore.purchase(clipId)
  
  if (success) {
    showSnackbar('Compra confirmada! O lance já está disponível para download.', 'success')
    checkoutDialog.value = false
    selectedClip.value = null
  } else {
    showSnackbar('Erro ao processar compra. Tente novamente.', 'error')
  }
}

const handleDownload = (clipId: string) => {
  clipsStore.startDownload(clipId)
  showSnackbar('Download iniciado!', 'info')
}

const handleRetry = () => {
  // Simula recarregamento dos dados
  window.location.reload()
}

onMounted(() => {
  // Dados já estão disponíveis no store mock
})
</script>

<style scoped>
.clips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.clips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-area {
  min-height: 400px;
}

@media (max-width: 1264px) {
  .clips-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}
</style>