<template>
  <!-- Bottom bar (trigger) -->
  <nav
    class="fixed bottom-3 left-3 right-3 z-40 border-t border-black/10 dark:border-white/10 backdrop-blur-md bg-white/90 dark:bg-neutral-900/70 rounded-xl shadow-sm"
    role="navigation"
    aria-label="Navegação inferior"
  >
    <div class="h-15 flex items-center justify-between px-3 py-2 gap-2 pb-[env(safe-area-inset-bottom)]">
      <RouterLink to="/" class="flex items-center">
        <img
          :src="LogoGravaNoisSimbol"
          alt="Símbolo Logo Grava Nóis"
          class="drop-shadow-sm w-auto h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16"
        />
      </RouterLink>

      <!-- Trigger abre menu -->
      <button
        type="button"
        class="ml-auto inline-flex items-center justify-center rounded-lg px-3 py-2 active:scale-[.98] hover:bg-black/5 dark:hover:bg-white/10 transition"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-controls="mobile-menu-overlay"
        @click="toggleMenu"
      >
        <MenuIcon color="white" class="h-7 w-7 sm:h-9 sm:w-9 drop-shadow-sm" />
        <span class="sr-only">Abrir menu</span>
      </button>
    </div>
  </nav>

  <!-- Overlay deslizante com o menu de ícones -->
  <div
    id="mobile-menu-overlay"
    class="fixed inset-0 z-50 pointer-events-none"
    :class="{ 'pointer-events-auto': isOpen }"
  >
    <!-- backdrop -->
    <div
      class="absolute inset-0 bg-black/30 transition-opacity duration-300"
      :class="isOpen ? 'opacity-100' : 'opacity-0'"
      @click="closeMenu"
      aria-hidden="true"
    />

    <!-- painel -->
    <div
      class="absolute inset-0 bg-black dark:bg-neutral-900 border-t border-black/10 dark:border-white/10 rounded-t-2xl shadow-lg transform transition-transform duration-500 ease-out flex flex-col"
      :class="isOpen ? 'translate-y-0' : 'translate-y-full'"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <!-- header do overlay -->
      <div class="flex items-center justify-between px-4 py-3">
        <img :src="LogoGravaNoisSimbol" alt="Símbolo Logo Grava Nóis" class="h-8 w-auto drop-shadow-sm" />

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg px-3 py-2 active:scale-[.98] hover:bg-black/5 dark:hover:bg-white/10 transition"
          @click="closeMenu"
        >
          <MenuIcon class="h-7 w-7" />
          <span class="sr-only">Fechar menu</span>
        </button>
      </div>

      <!-- grid de ícones -->
      <div class="px-4 pb-6">
        <div class="grid grid-cols-4 gap-3">
          <router-link
            v-for="item in visibleItems"
            :key="item.to"
            :to="item.disabled ? '#' : item.to"
            class="relative flex flex-col items-center justify-center gap-1 rounded-xl p-3 transition hover:bg-black/5 dark:hover:bg-white/10 text-center"
            :aria-disabled="item.disabled || undefined"
            :tabindex="item.disabled ? -1 : 0"
            @click.prevent="handleItemClick(item)"
          >
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center',
                isActive(item.to)
                  ? 'bg-green-100/70 dark:bg-green-900/20 text-green-600 dark:text-green-500'
                  : 'bg-black/5 dark:bg-white/10',
              ]"
            >
              <component :is="item.icon" class="w-6 h-6" aria-hidden="true" />
            </div>
            <span class="text-[12px] font-semibold leading-none mt-1">{{ item.label }}</span>

            <!-- Indicador ativo -->
            <span
              v-if="isActive(item.to)"
              class="absolute -bottom-1 h-1.5 w-8 rounded-full bg-green-500/70 blur-[1px] transition"
            />

            <!-- Badge de breve -->
            <span
              v-if="item.disabled"
              class="absolute top-1.5 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/90 text-black font-semibold"
            >
              breve
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <!-- espaçador para não cobrir conteúdo -->
  <div class="h-14 pb-[env(safe-area-inset-bottom)]"></div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Home, Download, HelpCircle, LogInIcon, MenuIcon, MenuSquare } from "lucide-vue-next";
import LogoGravaNois from "@/assets/icons/grava-nois-branco.webp";
import LogoGravaNoisSimbol from "@/assets/icons/grava-nois-simbol.webp";

const route = useRoute();

type NavItem = {
  label: string;
  to: string;
  icon: any;
  disabled?: boolean;
};

const navigationItems: NavItem[] = [
  { label: "Home", to: "/", icon: Home, disabled: false },
  { label: "Downloads", to: "/downloads", icon: Download, disabled: true },
  { label: "Suporte", to: "/suporte", icon: HelpCircle, disabled: true },
  { label: "Login", to: "/login", icon: LogInIcon, disabled: true },
];

const visibleItems = computed(() => navigationItems);

const isActive = (to: string) => {
  return route.path === to || route.path.startsWith(to + "/");
};

const isOpen = ref(false);
function toggleMenu() {
  isOpen.value = !isOpen.value;
}
function closeMenu() {
  isOpen.value = false;
}
function handleItemClick(item: NavItem) {
  if (item.disabled) return;
  // Fecha o menu ao navegar
  closeMenu();
}
</script>

<style scoped>
@media (min-width: 768px) {
  nav {
    display: none;
  }
}
</style>
