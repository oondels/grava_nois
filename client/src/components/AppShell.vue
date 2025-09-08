<template>
  <!-- Desktop -->
  <Header class="hidden md:block" />

  <v-app>
    <!-- Main Content -->
    <v-main
      id="main"
      class="d-flex flex-column"
      :class="{
        'pb-20': isMobile /* espaço para a bottom nav fixa no mobile */,
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
      prepend-icon="mdi-alert-circle-outline"
      @click="maintenanceDialog = true"
    >
      Aviso
    </v-btn> -->

    <!-- Diálogo de manutenção -->
    <!-- <v-dialog v-model="maintenanceDialog" max-width="480">
      <v-card class="rounded-xl" elevation="12">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon icon="mdi-alert" color="warning" class="me-2" />
          Aviso de manutenção
        </v-card-title>
        <v-card-text> O sistema está em manutenção e já já estará de volta. </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="maintenanceDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->

    <!-- Footer -->
    
    <!-- Bottom nav mobile -->
    <MobileBottomNav />
    <AppFooter v-if="route.path !== '/login'" />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { useClipsStore } from "@/store/clips";

// Importando os novos componentes de navegação
import Header from "@/components/navigation/Header.vue";
import MobileBottomNav from "@/components/navigation/MobileBottomNav.vue";
import AppFooter from "@/components/navigation/AppFooter.vue";


const isMobile = computed(() => window.matchMedia("(max-width: 660px)").matches);

// Store instances
const route = useRoute();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const clipsStore = useClipsStore();

// Handler para filtros de busca
const handleSearch = (value: string | null) => {
  clipsStore.updateFilters({ search: value || "" });
};

onMounted(() => {});

// Controle do diálogo de manutenção
const maintenanceDialog = ref(false);
</script>