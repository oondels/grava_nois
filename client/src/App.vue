<template>
  <div id="app">
    <header class="topbar" role="navigation" aria-label="About navigation">
      <div class="container nav-inner">
        <div class="brand">
          <div class="logo-dot" aria-hidden="true"></div>
          <span class="brand-name">Grava Nóis</span>
        </div>
        <nav class="links">
          <a href="#mission">Home</a>
          <a href="#how">Clipes</a>
          <a href="#security">Sobre</a>
          <a href="#faq">Ajuda</a>
          <a href="#cta" class="btn btn-primary">Instalar no meu campo</a>
          <span> </span>
        </nav>
      </div>
    </header>
    <router-view v-if="!authStore.isAuthenticated" />
    <AppLayout v-else />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import AppLayout from "@/layouts/AppLayout.vue";

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

/* #app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
} */

/* Topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: saturate(180%) blur(8px);
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  gap: 1rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--brand-ink);
}
.logo-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--brand);
  box-shadow: 0 0 0 6px var(--ring);
}
.links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.links a {
  text-decoration: none;
  color: var(--ink);
  font-weight: 600;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
}
.links a:hover {
  background: var(--bg-alt);
}
</style>
