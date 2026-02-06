<template>
  <header
    class="sticky top-0 z-30 backdrop-blur-md bg-white/70 dark:bg-neutral-950/80 border-b border-black/5 dark:border-white/10"
    role="navigation"
    aria-label="Navegação principal"
  >
    <div class="mx-auto w-full max-w-6xl px-3 md:px-6 h-16 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-2 group">
        <img :src="LogoGravaNoisCol" alt="Logo Grava Nóis" class="drop-shadow-sm h-11 w-auto" />
      </router-link>

      <nav class="hidden md:flex items-center gap-2">
        <HeaderLink to="/" label="Início" />
        <HeaderLink to="/lances-gravanois" label="Meus Vídeos" />
        <HeaderLink v-if="isClientAccess" to="/client" label="Painel Cliente" />
        <HeaderLink v-if="auth.isAdmin" to="/admin" label="Painel Admin" />
        <HeaderLink to="/contato" label="Instalar no meu campo" class="nav-cta" />
        
        <!-- Mostrar Perfil quando autenticado, senão mostrar Login/Registrar -->
        <HeaderLink v-if="auth.isAuthenticated" to="/user-page" label="Perfil" />
        <HeaderLink v-else to="/login" label="Login" />
        <HeaderLink v-if="!auth.isAuthenticated" to="/register" label="Registrar" />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { defineComponent, h, resolveComponent } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { prefetchRoute } from "@/utils/prefetchRoute";
import LogoGravaNoisCol from "@/assets/icons/grava-nois.webp";
import { useAuthStore } from "@/store/auth";

const baseLink =
  "nav-link relative inline-flex items-center px-3 py-2 rounded-lg font-semibold transition hover:bg-black/5 dark:hover:bg-white/10";

const isOpen = ref(false);
const route = useRoute();
const auth = useAuthStore();

const isClientAccess = computed(() => {
  const user = auth.user as { role?: string; clientId?: string } | null;
  return auth.isAuthenticated && (user?.role === "client" || Boolean(user?.clientId) || auth.isAdmin);
});

function toggleMenu() {
  isOpen.value = !isOpen.value;
}
function close() {
  isOpen.value = false;
}
function handleLinkClick() {
  if (window.innerWidth <= 660) close();
}
function onResize() {
  if (window.innerWidth > 660 && isOpen.value) close();
}

onMounted(() => {
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});

const HeaderLink = defineComponent({
  name: "HeaderLink",
  props: { to: { type: String, required: true }, label: { type: String, required: true } },
  setup(props, { attrs }) {
    const route = useRoute();
    const isActive = () => route.path === props.to;

    return () => {
      const aria = isActive() ? { "aria-current": "page" as const } : {}; // omite atributo quando inativo

      return h(
        RouterLink,
        {
          ...attrs, // forward de coisas como aria-disabled, class extra etc.
          to: props.to,
          class: `${baseLink} group ${
            isActive()
              ? "text-green-600 dark:text-green-400"
              : // 'white-800' não existe no Tailwind — use neutral/slate
                "text-neutral-800 dark:text-neutral-100"
          } ${typeof attrs.class === "string" ? attrs.class : ""}`,
          onMouseenter: () => prefetchRoute(props.to),
          onFocus: () => prefetchRoute(props.to),
          ...aria,
        },
        {
          default: () => [
            props.label,
            h("span", {
              class: `absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full transition-all ${
                isActive() ? "bg-green-500/70" : "bg-transparent group-hover:bg-black/30 dark:group-hover:bg-white/30"
              }`,
            }),
          ],
        }
      );
    };
  },
});
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.22s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* .nav-cta {
  @apply inline-flex items-center px-3 py-2 rounded-lg font-semibold text-white bg-gradient-to-br from-green-500 to-green-700 shadow-sm hover:brightness-110 active:scale-[.99] transition;
} */
</style>
