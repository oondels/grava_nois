<template>
  <div class="client-layout">
    <v-navigation-drawer
      v-model="drawer"
      :permanent="isDesktop"
      :temporary="!isDesktop"
      width="280"
      class="backdrop-blur-md bg-white/70 dark:bg-neutral-950/80 border-e border-black/5 dark:border-white/10"
    >
      <div class="px-4 py-4 flex items-center gap-3">
        <img :src="LogoGravaNoisCol" alt="Grava Nóis" class="h-9 w-auto drop-shadow-sm" />
        <div class="text-left">
          <div class="text-subtitle-1 font-weight-bold leading-tight">Cliente</div>
          <div class="text-caption text-medium-emphasis leading-tight">Grava Nóis</div>
        </div>
      </div>

      <v-divider />

      <v-list nav density="comfortable" class="px-2 py-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :title="item.title"
          :to="{ path: item.to }"
          rounded="lg"
          class="my-1"
        >
          <template #prepend>
            <component :is="item.icon" :size="18" class="opacity-80" />
          </template>
        </v-list-item>
      </v-list>

      <template #append>
        <div class="pa-2">
          <v-divider class="mb-2" />
          <v-list nav density="compact">
            <v-list-item title="Voltar ao site" :to="{ path: '/' }" rounded="lg">
              <template #prepend>
                <ArrowLeft :size="18" class="opacity-80" />
              </template>
            </v-list-item>
            <v-list-item title="Sair" rounded="lg" @click="handleSignOut">
              <template #prepend>
                <LogOut :size="18" class="opacity-80" />
              </template>
            </v-list-item>
          </v-list>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      elevation="0"
      class="backdrop-blur-md border-b border-black/5 dark:border-white/10"
      style="background-color: rgba(var(--v-theme-surface), 0.72);"
    >
      <v-app-bar-nav-icon v-if="!isDesktop" @click="drawer = !drawer" />

      <div class="d-flex flex-column text-left">
        <div class="text-subtitle-1 font-weight-bold leading-tight">{{ currentTitle }}</div>
        <div class="text-caption text-medium-emphasis leading-tight">Olá, {{ clientName }}</div>
      </div>

      <v-spacer />

      <div class="flex items-center gap-2">
        <v-btn variant="text" class="font-medium" @click="handleSignOut">
          <template #prepend>
            <LogOut :size="18" />
          </template>
          Logout
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <div class="mx-auto w-full max-w-6xl px-3 md:px-6">
        <router-view />
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { useAuthStore } from "@/store/auth";
import LogoGravaNoisCol from "@/assets/icons/grava-nois.webp";
import { LayoutDashboard, MapPin, Wallet, ArrowLeft, LogOut } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const display = useDisplay();

const isDesktop = computed(() => display.mdAndUp.value);
const drawer = ref(false);

watch(
  isDesktop,
  (desktop) => {
    drawer.value = desktop;
  },
  { immediate: true }
);

const navItems = [
  { title: "Visão Geral", to: "/client", icon: LayoutDashboard },
  // { title: "Minha Quadra", to: "/client/quadra", icon: MapPin },
  { title: "Financeiro", to: "/client/financeiro", icon: Wallet },
];

const currentTitle = computed(() => {
  const record = route.matched[route.matched.length - 1];
  const props = record && typeof record.props === "object" ? (record.props as any) : null;
  return String(props?.title || "Cliente");
});

const clientName = computed(() => {
  const user = authStore.user;
  return user?.name || user?.username || user?.email || "Cliente";
});

async function handleSignOut() {
  await authStore.signOut();
  await router.push({ path: "/" });
}
</script>
