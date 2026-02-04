<template>
  <!-- Desktop -->
  <Header v-if="!isAdminRoute && !isClientRoute" class="hidden md:block" />

  <v-app>
    <!-- Main Content -->
    <v-main
      id="main"
      class="d-flex flex-column"
      :class="{
        'pb-20':
          isMobile &&
          !isAdminRoute &&
          !isClientRoute /* espaço para a bottom nav fixa no mobile */,
      }"
    >
      <slot />
    </v-main>

    <!-- Botão flutuante de Aviso -->
    <!-- <v-btn
      color="warning"
      variant="elevated"
      size="large"
      position="fixed"
      class="ma-4 bottom-20"
      style="z-index: 1001"
    >
      <template #prepend>
        <AlertCircle />
      </template>
      Aviso
    </v-btn> -->

    <!-- Bottom nav mobile -->
    <MobileBottomNav v-if="!isAdminRoute && !isClientRoute" />
    <AppFooter v-if="showFooter && !isAdminRoute && !isClientRoute" />
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const showFooter = ref(true);
const showFooterComponent = () => {
  if (
    route.path === "/login" ||
    route.path === "/user-page" ||
    route.path.startsWith("/admin") ||
    route.path.startsWith("/client")
  ) {
    showFooter.value = false;
    return;
  }
  showFooter.value = true;
};

// Importando os novos componentes de navegação
import Header from "@/components/navigation/Header.vue";
import MobileBottomNav from "@/components/navigation/MobileBottomNav.vue";
import AppFooter from "@/components/navigation/AppFooter.vue";

const isMobile = computed(() => window.matchMedia("(max-width: 660px)").matches);

const isAdminRoute = computed(() => route.path.startsWith("/admin"));
const isClientRoute = computed(() => route.path.startsWith("/client"));

// Store instances
const route = useRoute();
watch(
  () => route.path,
  () => {
    showFooterComponent();
  },
  { immediate: true }
);
</script>
