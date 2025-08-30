<template>
  <div v-if="offlineReady || needRefresh" class="pwa-toast">
    <div class="message">
      <span v-if="offlineReady">Pronto para usar offline.</span>
      <span v-else>Nova versão disponível.</span>
    </div>
    <button v-if="needRefresh" @click="updateServiceWorker()">Atualizar</button>
    <button @click="close">Fechar</button>
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from "virtual:pwa-register/vue";
const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();
const close = () => {
  offlineReady.value = false;
  needRefresh.value = false;
};
</script>
