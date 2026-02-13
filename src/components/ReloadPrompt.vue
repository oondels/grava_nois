<template>
  <div
    v-if="offlineReady || needRefresh"
    class="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50"
  >
    <div class="mb-3">
      <span v-if="offlineReady" class="text-sm text-gray-700">Pronto para usar offline.</span>
      <span v-else class="text-sm text-gray-700">Nova versão disponível.</span>
    </div>
    <div class="flex gap-2">
      <button
        v-if="needRefresh"
        @click="updateServiceWorker()"
        class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
      >
        Atualizar
      </button>
      <button
        @click="close"
        class="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
      >
        Fechar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from "virtual:pwa-register/vue";
const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();
import { onMounted, onBeforeUnmount } from "vue";
const checkUpdate = () => updateServiceWorker();

let timer: number | undefined;

const onVisibilityChange = () => {
  if (document.visibilityState === "visible") checkUpdate();
};

const close = () => {
  offlineReady.value = false;
  needRefresh.value = false;
};

onMounted(() => {
  // checa assim que abrir
  checkUpdate();

  // checa periodicamente (5 min)
  timer = window.setInterval(checkUpdate, 5 * 60 * 1000);

  // checa quando o usuário volta pra aba
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
  document.removeEventListener("visibilitychange", onVisibilityChange);
});
</script>
