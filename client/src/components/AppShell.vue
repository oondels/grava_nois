<template>
  <!-- Desktop -->
  <Header class="hidden md:block" />

  <v-app>
    <!-- Main Content -->
    <v-main
      id="main"
      class="d-flex flex-column"
      :class="{
        'pb-20': isMobile /* espaço para a bottom nav fixa no mobile */,
      }"
    >
      <slot />
    </v-main>

    <!-- Botão flutuante de Aviso -->
    <v-btn
      color="warning"
      variant="elevated"
      size="large"
      position="fixed"
      class="ma-4 bottom-20"
      style="z-index: 1001"
      prepend-icon="mdi-alert-circle-outline"
      @click="maintenanceDialog = true"
    >
      Aviso
    </v-btn>

    <!-- Diálogo de manutenção -->
    <v-dialog v-model="maintenanceDialog" max-width="480">
      <v-card class="rounded-xl" elevation="12">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon icon="mdi-alert" color="warning" class="me-2" />
          Aviso de manutenção
        </v-card-title>
        <v-card-text> O sistema está em manutenção e já já estará de volta. </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="maintenanceDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Mobile Bottom Nav (visível apenas em dispositivos móveis) -->

    <!-- Footer -->
    <!-- <footer class="app-footer">
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
        <small
          >Construído com ❤️ para o esporte amador. <span class="sep">•</span>
          <a href="#" aria-disabled="true" class="disabled-link">Termos</a> <span class="sep">•</span>
          <a href="#" aria-disabled="true" class="disabled-link">Privacidade</a></small
        >
      </div>
    </footer> -->

    <!-- Bottom nav mobile -->
    <MobileBottomNav />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { useClipsStore } from "@/store/clips";

// Importando os novos componentes de navegação
import Header from "@/components/navigation/Header.vue";
import MobileBottomNav from "@/components/navigation/MobileBottomNav.vue";

const isMobile = computed(() => window.matchMedia("(max-width: 660px)").matches);

// Store instances
const route = useRoute();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const clipsStore = useClipsStore();

// Handler para filtros de busca
const handleSearch = (value: string | null) => {
  clipsStore.updateFilters({ search: value || "" });
};

onMounted(() => {});

// Controle do diálogo de manutenção
const maintenanceDialog = ref(false);
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
  .footer-inner {
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
  }
}
.logo-text {
  margin: 0 0 0.35rem;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.tagline {
  margin: 0 0 0.75rem;
  color: var(--muted);
  font-weight: 500;
}
.links-col h4,
.social-col h4 {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.links-col ul,
.social-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.links-col a,
.social-col a {
  text-decoration: none;
  color: var(--ink);
  font-weight: 500;
  font-size: 0.9rem;
}
.links-col a:hover,
.social-col a:hover {
  text-decoration: underline;
}
.disabled-link {
  opacity: 0.5;
  pointer-events: none;
}
.legal {
  margin-top: 2rem;
  text-align: center;
  color: var(--muted);
}
.legal a {
  color: var(--muted);
  text-decoration: none;
}
.legal a:hover {
  text-decoration: underline;
}
.sep {
  opacity: 0.4;
  margin: 0 0.35rem;
}
@media (max-width: 640px) {
  .app-footer {
    padding: 2.5rem 0 1.5rem;
  }
}
</style>
