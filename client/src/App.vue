<template>
    <AppLayout />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import AppLayout from "@/layouts/AppLayout.vue";
import Header from "@/components/Header.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(() => {
  // Initialize theme
  themeStore.setTheme(true);
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
@import "@/styles/variables.css";
@import "@/styles/utilities.scss";

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100% !important;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface), 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

.v-btn:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.5);
  outline-offset: 2px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
