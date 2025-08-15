<template>
  <header class="topbar" role="navigation" aria-label="About navigation">
    <div class="container nav-inner">
      <div class="brand">
        <span class="logo-gravanois ml-2">
          <router-link to="/">
            <img role="button" :src="LogoGravaNois" alt="Logo Grava Nóis" />
          </router-link>
        </span>
      </div>

      <!-- Mobile toggle -->
      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isOpen"
        aria-controls="primary-navigation"
        @click="toggleMenu"
      >
        <span class="sr-only">{{ isOpen ? "Fechar menu" : "Abrir menu" }}</span>
        <svg
          v-if="!isOpen"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <nav id="primary-navigation" :class="['links', { open: isOpen }]" @click="handleLinkClick">
        <a href="#how">Clipes</a>
        <a href="#security">Sobre</a>
        <a href="#faq">Ajuda</a>
        <router-link to="/contato">Instalar no meu campo</router-link>
        <v-tooltip text="Em desenvolvimento" location="bottom">
          <template #activator="{ props }">
            <a v-bind="props" href="#login" class="disabled-link" aria-disabled="true" @click.prevent>Login</a>
          </template>
        </v-tooltip>
      </nav>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import LogoGravaNois from "../assets/icons/grava-nois.png";
import LogoGravaNoisBranco from "../assets/icons/grava-nois-branco.png";

const isOpen = ref(false);

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function handleLinkClick(e: Event) {
  if (window.innerWidth <= 660) {
    isOpen.value = false;
  }
}

function onResize() {
  if (window.innerWidth > 660 && isOpen.value) {
    isOpen.value = false; // reset when returning to desktop
  }
}

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
/* Topbar */
.logo-gravanois img {
  width: 90px;
  display: flex;
  align-items: center;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: saturate(180%) blur(8px);
  background: color-mix(in srgb, white 80%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  height: 80px;
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
}

/* Toggle button */
.menu-toggle {
  display: none;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--ink) 20%, transparent);
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #1f2937;
  transition: background 0.2s;
}
.menu-toggle:focus-visible,
.menu-toggle:hover {
  background: color-mix(in srgb, var(--ink) 8%, transparent);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  transition: all 0.25s ease;
}
.links a {
  text-decoration: none;
  color: #1f2937;
  font-weight: 600;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  transition: background 0.2s, color 0.2s;
}
.links a:hover {
  background: color-mix(in srgb, var(--ink) 8%, transparent);
}

/* Visually disable the Login link */
.disabled-link {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none; /* evita clique */
  position: relative;
}
.disabled-link::after {
  content: "⚙";
  font-size: 0.75rem;
  margin-left: 4px;
  opacity: 0.8;
}

/* Mobile styles */
@media screen and (max-width: 660px) {
  .menu-toggle {
    display: inline-flex;
  }
  .nav-inner {
    align-items: flex-start;
  }
  .links {
    position: absolute;
    top: 80px; /* below header */
    left: 0;
    right: 0;
    background: color-mix(in srgb, white 96%, transparent);
    backdrop-filter: blur(8px);
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem 1rem 1rem;
    gap: 0.25rem;
    border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
    max-height: 0;
    overflow: hidden;
    opacity: 0;
  }
  .links.open {
    max-height: 400px; /* enough for links */
    opacity: 1;
  }
  .links a {
    font-size: 0.95rem;
    padding: 0.6rem 0.75rem;
    border-radius: 0.4rem;
  }
}
</style>
