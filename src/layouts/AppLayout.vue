<template>
  <AppShell>
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <div :key="routeViewKey">
          <ErrorState
            v-if="routeError"
            title="Não foi possível carregar esta página"
            description="Algo falhou durante a navegação. Tente novamente ou recarregue a página."
            @retry="retry"
          />

          <component v-else-if="Component" :is="Component" />

          <LoadingSkeleton v-else variant="custom" type="text" :count="1" />
        </div>
      </transition>
    </router-view>

    <!-- Global notifications via Notivue -->
    <AppNotifications />
  </AppShell>
</template>

<script setup lang="ts">
import { computed, ref, watch, onErrorCaptured } from "vue";
import { useRoute } from "vue-router";
import AppShell from "@/components/AppShell.vue";
import AppNotifications from "@/components/AppNotifications.vue";
import ErrorState from "@/components/ErrorState.vue";
import LoadingSkeleton from "@/components/LoadingSkeleton.vue";

const route = useRoute();
const routeError = ref<unknown>(null);
const routeViewKey = computed(() => `${String(route.name ?? route.path)}:${JSON.stringify(route.params)}`);

watch(
  () => route.fullPath,
  () => {
    routeError.value = null;
  }
);

onErrorCaptured((err) => {
  routeError.value = err;
  // mantém propagação padrão para continuar visível em dev, mas garante fallback de UI
  return false;
});

function retry() {
  // Recarrega a rota atual (e chunks) sem depender de F5 manual
  window.location.reload();
}
</script>
