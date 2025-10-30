<template>
  <!-- Bottom bar (trigger) -->
  <nav
    class="fixed bottom-3 left-3 right-3 z-40
       border-t border-white/10
       backdrop-blur-md bg-black/50
       rounded-xl shadow-sm
       transition-all duration-500 ease-in-out"
    :class="navHidden ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'"
    role="navigation"
    aria-label="Navegação inferior"
  >
    <div class="h-15 flex justify-around">
      <RouterLink
        to="/"
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isActive('/') ? 'bg-green-200/60 text-green-900' : '',
        ]"
        aria-label="Ir para a página inicial"
      >
        <Home />
      </RouterLink>

      <!-- Botão dinâmico: Logo para ir para user-page, X para sair -->
      <button
        v-if="isUserPage"
        @click="goBack"
        class="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-[.98]"
        aria-label="Voltar"
      >
        <XIcon class="w-6 h-6 text-red drop-shadow-sm" />
      </button>

      <!-- <RouterLink
        v-if="!isUserPage"
        :to="auth.isAuthenticated ? '/user-page' : '/login'"
        class="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-[.98]"
        aria-label="Ir para página do usuário"
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isActive(auth.isAuthenticated ? '/user-page' : '/login')
            ? 'bg-green-100/70 dark:bg-green-700/20 text-green-700 dark:text-green-400'
            : '',
        ]"
        @mouseenter="prefetchUserOrLogin"
        @focus="prefetchUserOrLogin"
      >
        <div>
          <span
            v-if="auth.isAuthenticated"
            class="absolute top-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/90 text-black font-semibold"
          >
            Perfil
          </span>

          <CircleUserIcon v-if="auth.isAuthenticated" role="button" />

          <LogInIcon v-else role="button" />
        </div>
      </RouterLink> -->

      <RouterLink

        to="/lances-gravanois"
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isActive('/lances-gravanois')
            ? 'bg-green-100/70 dark:bg-green-700/20 text-green-700 dark:text-green-400'
            : '',
        ]"
        aria-label="Meus Lances"
        @mouseenter="() => prefetch('/lances-gravanois')"
        @focus="() => prefetch('/lances-gravanois')"
      >
        <ClapperboardIcon />
      </RouterLink>

      <div
        v-if="auth.isAuthenticated"
        class="flex items-center justify-center w-12 h-12 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-not-allowed opacity-50"
        aria-disabled="true"
      >
        <Bell />
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg px-3 py-2 active:scale-[.98] hover:bg-black/5 dark:hover:bg-white/10 transition"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-controls="mobile-menu-overlay"
        @click="toggleMenu"
      >
        <MenuIcon color="white" class="h-7 w-7 sm:h-9 sm:w-9 drop-shadow-sm" />
      </button>
    </div>
  </nav>

  <!-- Menu Aberto -->
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
    ></div>

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
            :class="{ displaynone: item.label === 'Registrar' && auth.isAuthenticated }"
            :aria-disabled="item.disabled || undefined"
            :tabindex="item.disabled ? -1 : 0"
            @click.prevent="handleItemClick(item)"
            @mouseenter="() => prefetch(item.to)"
            @focus="() => prefetch(item.to)"
          >
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center',
                isActive(item.to) ? 'bg-green-100/70 dark:bg-green-700/20 text-green-700 dark:text-green-400' : '',
              ]"
            >
              <component :is="item.icon" class="w-6 h-6" aria-hidden="true" />
            </div>
            <span class="text-[12px] font-semibold leading-none mt-1">{{ item.label }}</span>

            <!-- Indicador ativo -->
            <span
              v-if="isActive(item.to)"
              class="absolute -bottom-1 h-1.5 w-8 rounded-full bg-green-500/70 blur-[1px] transition"
            ></span>

            <!-- Badge de breve -->
            <span
              v-if="item.disabled"
              class="absolute top-1.5 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/90 text-black font-semibold"
            >
              em breve
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
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Home,
  BadgeAlertIcon,
  LogInIcon,
  MenuIcon,
  ClapperboardIcon,
  XIcon,
  UserPlus2Icon,
  Bell,
  CircleUserIcon,
} from "lucide-vue-next";
import LogoGravaNoisSimbol from "@/assets/icons/grava-nois-simbol.webp";
import { useAuthStore } from "@/store/auth";
import { prefetchRoute as prefetch } from '@/utils/prefetchRoute'

const auth = useAuthStore();

const route = useRoute();
const router = useRouter();

type NavItem = {
  label: string;
  to: string;
  icon: any;
  disabled?: boolean;
};

// Mantém os itens reativos ao estado de autenticação
const navigationItems = computed<NavItem[]>(() => [
  { label: "Home", to: "/", icon: Home, disabled: false },
  {
    label: auth.isAuthenticated ? "Perfil" : "Login",
    to: auth.isAuthenticated ? "/user-page" : "/login",
    icon: LogInIcon,  
    disabled: true,
  },
  { label: "Registrar", to: "/register", icon: UserPlus2Icon, disabled: false },
  { label: "Lances", to: "/lances-gravanois", icon: ClapperboardIcon, disabled: false },
  { label: "Reportar", to: "/reportar-erro", icon: BadgeAlertIcon, disabled: false },
]);

const visibleItems = computed(() => navigationItems.value);

function prefetchUserOrLogin() {
  prefetch(auth.isAuthenticated ? '/user-page' : '/login')
}

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

const isUserPage = computed(() => route.path === "/user-page");

function goBack() {
  router.back();
}

// Esconder/mostrar a bottom nav conforme rolagem
const isHidden = ref(false);
const navHidden = computed(() => !isOpen.value && isHidden.value);
let lastY = 0;
const DELTA = 8; // sensibilidade para evitar flicker

function onScroll() {
  const y = window.scrollY || 0;
  const diff = y - lastY;

  if (Math.abs(diff) > DELTA) {
    // Esconde ao descer, mostra ao subir
    if (diff > 0 && y > 0) {
      isHidden.value = true;
    } else {
      isHidden.value = false;
    }
    lastY = y;
  }
}

onMounted(() => {
  lastY = window.scrollY || 0;
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll as any);
});
</script>

<style scoped>
.displaynone {
  display: none;
}

@media (min-width: 768px) {
  nav {
    display: none;
  }
}
</style>
