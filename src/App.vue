<template>
  <ReloadPrompt />
  <InstallPrompt />
  <WhatsNewDialog v-if="!isMaintenance" />
  <AppLayout />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useThemeStore } from "@/store/theme";
import AppLayout from "@/layouts/AppLayout.vue";
import ReloadPrompt from "./components/ReloadPrompt.vue";
import InstallPrompt from "./components/InstallPrompt.vue";
import WhatsNewDialog from "./components/WhatsNewDialog.vue";
const themeStore = useThemeStore();

const isMaintenance = ["true", "1", "on", "yes"].includes(
  String(import.meta.env.VITE_MAINTENANCE_MODE || "").toLowerCase(),
);

onMounted(() => {
  themeStore.setTheme(true);
  document.documentElement.dataset.theme = "dark";
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
@import "@/styles/variables.css";
@import "@/styles/utilities.scss";

#app {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100% !important;
  color-scheme: dark; /* melhora inputs/scrollbars nativos no dark */
}

/* Skip link visível ao focar */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  padding: 0.5rem 0.75rem;
  background: #111827;
  color: #fff;
  border-radius: 0.5rem;
  z-index: 1000;
}
.skip-link:focus {
  left: 0.75rem;
  top: 0.75rem;
}

/* Scrollbars */
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

/* Focus visível em botões vuetify */
.v-btn:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.6);
  outline-offset: 2px;
}

/* Transições de rota */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.28s ease,
    opacity 0.28s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(22px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-22px);
}
</style>
