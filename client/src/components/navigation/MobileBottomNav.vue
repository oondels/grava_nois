<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-neutral-900/70"
    role="navigation"
    aria-label="Navegação inferior"
  >
  <div class="h-15 flex items-stretch justify-around align-center px-1 pb-[env(safe-area-inset-bottom)]">
      <img :src="LogoGravaNoisSimbol" alt="Símbolo Logo Grava Nóis" class="drop-shadow-sm w-auto h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16" />
      <router-link
      v-for="item in visibleItems"
      :key="item.to"
      :to="item.disabled ? '#' : item.to"
      class="relative flex-1 flex items-center justify-center group"
      :aria-disabled="item.disabled || undefined"
      :tabindex="item.disabled ? -1 : 0"
      @click.prevent="item.disabled ? null : null"
      >
      <div
          class="inline-flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition
                 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[.98]
                 aria-[current=page]:text-green-600 aria-[current=page]:dark:text-green-400"
          :aria-current="isActive(item.to) ? 'page' : null"
        >
          <component :is="item.icon" class="w-5 h-5" aria-hidden="true" />
          <span class="text-[11px] font-semibold leading-none">{{ item.label }}</span>

          <!-- Indicador ativo (pill) -->
          <span
            v-if="isActive(item.to)"
            class="absolute -bottom-1 h-1.5 w-8 rounded-full bg-green-500/70 blur-[1px] transition"
          />
        </div>

        <!-- Badge de "breve" se desabilitado -->
        <span
          v-if="item.disabled"
          class="absolute top-1.5 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/90 text-black font-semibold"
        >
          breve
        </span>
      </router-link>
    </div>
  </nav>

  <!-- espaçador para não cobrir conteúdo -->
  <div class="h-14 pb-[env(safe-area-inset-bottom)]"></div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Home, Download, HelpCircle, LogInIcon } from "lucide-vue-next";
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
</script>

<style scoped>
@media (min-width: 768px) {
  nav { display: none; }
}
</style>
