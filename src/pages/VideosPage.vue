<template>
  <div v-if="userData && userData.quadrasFiliadas && userData.quadrasFiliadas.length > 0" class="page-container">
    <VideoPageQuadra :available-quadras="availableQuadras" />
  </div>

  <div v-else>
    <VideoPageSemQuadra />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import VideoPageQuadra from "@/components/videos/VideoPageQuadra.vue";
import VideoPageSemQuadra from "@/components/videos/VideoPageSemQuadra.vue";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();
const userData = computed(() => authStore.safeUser);

const userLoaded = ref(false);
const availableQuadras = ref([] as any[]);

onMounted(async () => {
  const q = (userData.value as any)?.quadrasFiliadas || [];
  availableQuadras.value = Array.isArray(q) ? q : q && typeof q === "object" ? Object.values(q) : [];

  userLoaded.value = true;
});
</script>

<style scoped>
.gravanois-logo {
  width: 90px;
}

.result-card .thumb-wrapper {
  position: relative;
}

.date-badge {
  position: absolute;
  z-index: 2;
  left: 8px;
  top: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  color: white;
}

/* Placeholder do thumbnail quando a prévia ainda não está disponível */
.thumb-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background: #111;
  color: #ccc;
  border-radius: 12px 12px 0 0;
  position: relative;
  overflow: hidden;
}
.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: blur(2px) brightness(0.7);
  transition: filter 0.3s ease;
}

.thumb-placeholder:hover .thumb-image {
  filter: blur(1px) brightness(0.8);
}

@media (min-width: 600px) {
  :root {
    --gn-sticky-top: 64px;
  }
}

/* Título + botão de aviso (chamativo, sem exagero) */
.page-title {
  display: inline-flex;
  align-items: center;
}

.title-alert-btn {
  /* Usa a cor de aviso global, com brilho sutil */
  --pulse-base: var(--warning-color, #f59e0b);
  box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  backdrop-filter: saturate(1.1);
}

.title-alert-btn:hover {
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 6px 14px rgba(245, 158, 11, 0.35);
}

.pulse {
  animation: pulseGlow 2.4s ease-in-out infinite;
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}
</style>
