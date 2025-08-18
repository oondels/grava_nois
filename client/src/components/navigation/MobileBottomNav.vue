<template>
  <nav 
    class="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 shadow-lg pb-[env(safe-area-inset-bottom)]"
    role="navigation"
    aria-label="Navegação inferior"
  >
    <div class="flex justify-around items-stretch h-14">
      <NavLink
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :icon="item.icon"
        variant="mobile"
        :disabled="item.disabled"
        :tooltip="item.tooltip"
        class="flex-1"
      />
    </div>
  </nav>

  <!-- Espaçador para compensar a navegação fixa -->
  <div class="h-14 pb-[env(safe-area-inset-bottom)]"></div>
</template>

<script setup lang="ts">
/**
 * Componente de navegação inferior para mobile
 * - Fixo na parte inferior da tela
 * - Suporte para safe-area em dispositivos iOS
 * - Indicador de rota ativa
 */
import NavLink from './NavLink.vue';

// Items de navegação para o bottom nav
const navigationItems = [
  { 
    label: 'Meus Lances', 
    to: '/meus-lances', 
    icon: 'Home' 
  },
  { 
    label: 'Downloads', 
    to: '/downloads', 
    icon: 'Download' 
  },
  { 
    label: 'Suporte', 
    to: '/suporte', 
    icon: 'HelpCircle' 
  }
];
</script>
