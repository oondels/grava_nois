<template>
  <div class="maintenance-page">
    <div class="content" role="status" aria-live="polite">
      <v-icon :icon="customIcons.alert" size="72" color="amber" class="mb-4" />

      <h1 class="title">Serviço em manutenção</h1>
      <p class="subtitle">
        Estamos temporariamente indisponíveis devido a equipamento danificado.
        Nossa equipe já está trabalhando para normalizar o serviço.
      </p>

      <div class="stripe mt-6" aria-hidden="true" />
      <p class="mt-4 hint">Tente novamente mais tarde.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { customIcons } from '@/utils/icons'
// Página simples de aviso de manutenção
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  width: 100%;
  background: #0b0b0b;
  color: #facc15; /* yellow-400 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.content {
  max-width: 720px;
  text-align: center;
}

.title {
  font-size: clamp(1.75rem, 2.8vw + 1rem, 2.5rem);
  line-height: 1.2;
  margin: 0 0 .5rem 0;
  color: #fde047; /* yellow-300 */
}

.subtitle {
  font-size: 1.05rem;
  color: #fef08a; /* yellow-200 */
  opacity: 0.95;
}

.hint {
  color: #eab308; /* yellow-500 */
  opacity: 0.9;
}

.stripe {
  height: 14px;
  border-radius: 8px;
  background: repeating-linear-gradient(
    45deg,
    #fde047,
    #fde047 16px,
    #111 16px,
    #111 32px
  );
  box-shadow: 0 0 0 2px #0b0b0b inset, 0 2px 18px rgba(250, 204, 21, 0.2);
}

.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
</style>
