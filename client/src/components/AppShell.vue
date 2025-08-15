<template>
  <Header/>
  <v-app>
    <!-- Main Content -->
    <v-main class="d-flex flex-column">
      <router-view />
    </v-main>

    <!-- Bottom Navigation (Mobile) -->
    <!-- <v-bottom-navigation 
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
    </v-bottom-navigation> -->

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-inner">
        <div class="brand-col">
          <h3 class="logo-text">Grava Nóis</h3>
          <p class="tagline">Seu lance, sua história.</p>
          <p class="copyright">© {{ new Date().getFullYear() }} Grava Nóis. Todos os direitos reservados.</p>
        </div>

        <nav class="links-col" aria-label="Links rápidos">
          <h4>Produto</h4>
          <ul>
            <li><router-link to="/">Início</router-link></li>
            <li><a href="#how">Como funciona</a></li>
            <li><a href="#differentials">Diferenciais</a></li>
            <li><a href="#security">Segurança</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>
        <nav class="links-col" aria-label="Suporte">
          <h4>Suporte</h4>
            <ul>
              <li><router-link to="/suporte">Central de Ajuda</router-link></li>
              <li><router-link to="/contato">Instalar no meu campo</router-link></li>
              <li><router-link to="/contato">Contato</router-link></li>
            </ul>
        </nav>
        <div class="social-col" aria-label="Social e status">
          <h4>Status</h4>
          <ul>
            <li><a href="#" aria-disabled="true" class="disabled-link">API (em breve)</a></li>
          </ul>
        </div>
      </div>
      <div class="legal">
        <small>Construído com ❤️ para o esporte amador. <span class="sep">•</span> <a href="#" aria-disabled="true" class="disabled-link">Termos</a> <span class="sep">•</span> <a href="#" aria-disabled="true" class="disabled-link">Privacidade</a></small>
      </div>
    </footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { useClipsStore } from '@/store/clips'
import { customIcons } from '@/utils/icons'
import Header from './Header.vue'

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

<style scoped>
.app-footer {
  margin-top: 4rem;
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg-alt) 80%, transparent), var(--bg-alt));
  border-top: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  padding: 3rem 0 2rem;
  font-size: 0.9rem;
}
.footer-inner {
  width: min(1100px, 100% - 2rem);
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}
@media (min-width: 800px) {
  .footer-inner { grid-template-columns: 1.2fr 1fr 1fr 1fr; }
}
.logo-text { margin:0 0 .35rem; font-size:1.35rem; font-weight:800; letter-spacing:-0.02em; }
.tagline { margin:0 0 .75rem; color: var(--muted); font-weight:500; }
.links-col h4, .social-col h4 { margin:0 0 .75rem; font-size:.85rem; text-transform:uppercase; letter-spacing:.08em; color: var(--muted); }
.links-col ul, .social-col ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.4rem; }
.links-col a, .social-col a { text-decoration:none; color: var(--ink); font-weight:500; font-size:.9rem; }
.links-col a:hover, .social-col a:hover { text-decoration:underline; }
.disabled-link { opacity:.5; pointer-events:none; }
.legal { margin-top:2rem; text-align:center; color: var(--muted); }
.legal a { color: var(--muted); text-decoration:none; }
.legal a:hover { text-decoration:underline; }
.sep { opacity:.4; margin:0 .35rem; }
@media (max-width: 640px) { .app-footer { padding:2.5rem 0 1.5rem; } }
</style>