<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar 
      :elevation="2" 
      color="surface"
      class="px-2"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon 
          @click="drawer = !drawer"
          class="d-lg-none"
        />
        
        <div class="d-flex align-center">
          <v-icon color="primary" size="32" class="me-2">
            {{ customIcons.play }}
          </v-icon>
          <h2 class="text-primary font-weight-bold">
            SportClips
          </h2>
        </div>
      </template>

      <!-- Search (desktop) -->
      <template v-slot:default>
        <v-spacer />
        <v-text-field
          v-model="searchQuery"
          @update:model-value="handleSearch"
          :prepend-inner-icon="customIcons.magnify"
          placeholder="Buscar por esporte, local, câmera..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="d-none d-md-flex mx-4"
          style="max-width: 400px;"
        />
        <v-spacer />
      </template>

      <template v-slot:append>
        <!-- Theme Toggle -->
        <v-btn
          @click="themeStore.toggleTheme()"
          :icon="customIcons.themeLightDark"
          variant="text"
          class="me-2"
        />
        
        <!-- User Menu -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn 
              v-bind="props"
              :icon="customIcons.account"
              variant="text"
            />
          </template>
          
          <v-list>
            <v-list-item>
              <v-list-item-title>{{ authStore.user?.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-divider />
            
            <v-list-item 
              @click="authStore.logout()"
              :prepend-icon="customIcons.close"
            >
              <v-list-item-title>Sair</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer (Desktop) -->
    <v-navigation-drawer
      v-model="drawer"
      :temporary="$vuetify.display.mobile"
      :permanent="!$vuetify.display.mobile"
      color="surface"
    >
      <v-list nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          exact
          rounded
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="d-flex flex-column">
      <!-- Search (mobile) -->
      <v-container v-if="$vuetify.display.mobile" class="py-2">
        <v-text-field
          v-model="searchQuery"
          @update:model-value="handleSearch"
          :prepend-inner-icon="customIcons.magnify"
          placeholder="Buscar..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
        />
      </v-container>
      
      <router-view />
    </v-main>

    <!-- Bottom Navigation (Mobile) -->
    <v-bottom-navigation 
      v-if="$vuetify.display.mobile"
      v-model="bottomNav"
      color="primary"
      grow
    >
      <v-btn
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        :value="item.to"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span class="text-caption">{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { useClipsStore } from '@/store/clips'
import { customIcons } from '@/utils/icons'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const clipsStore = useClipsStore()

const drawer = ref(false)
const bottomNav = ref()
const searchQuery = ref('')

const navigationItems = [
  {
    title: 'Meus Lances',
    to: '/meus-lances',
    icon: customIcons.home
  },
  {
    title: 'Downloads',
    to: '/downloads',
    icon: customIcons.download
  },
  {
    title: 'Suporte',
    to: '/suporte',
    icon: customIcons.help
  }
]

const handleSearch = (value: string | null) => {
  clipsStore.updateFilters({ search: value || '' })
}

onMounted(() => {
  bottomNav.value = route.path
})
</script>