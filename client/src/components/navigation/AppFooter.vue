<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <!-- Brand / Intro -->
      <div class="brand-col">
        <h3 class="logo-text">Grava Nóis</h3>
        <p class="tagline">Seu lance, sua história.</p>

        <div class="social-row" aria-label="Redes sociais">
          <a href="#" aria-label="Instagram" class="social-link" title="Instagram">
            <v-icon :icon="customIcons.instagram" size="22" />
          </a>
          <a href="#" aria-label="YouTube" class="social-link" title="YouTube">
            <v-icon :icon="customIcons.youtube" size="22" />
          </a>
          <a href="#" aria-label="Facebook" class="social-link" title="Facebook">
            <v-icon :icon="customIcons.facebook" size="22" />
          </a>
          <a href="#" aria-label="X (Twitter)" class="social-link" title="X (Twitter)">
            <v-icon :icon="customIcons.twitter" size="22" />
          </a>
          <a href="#" aria-label="LinkedIn" class="social-link" title="LinkedIn">
            <v-icon :icon="customIcons.linkedin" size="22" />
          </a>
        </div>

        <p class="copyright">© {{ year }} Grava Nóis. Todos os direitos reservados.</p>
      </div>

      <!-- Suporte -->
      <nav class="links-col" aria-label="Suporte">
        <ul>
          <!-- <li><RouterLink to="/suporte">Central de Ajuda</RouterLink></li> -->
          <v-btn variant="outlined" color="success">
            <RouterLink to="/contato">Instalar no meu campo</RouterLink>
          </v-btn>
          <!-- <li><RouterLink to="/contato">Contato</RouterLink></li> -->
        </ul>
      </nav>
    </div>

    <div class="legal">
      <small>
        Construído com ❤️ para o esporte amador.
        <!-- <span class="sep">•</span>
        <a href="#" aria-disabled="true" class="disabled-link">Termos</a>
        <span class="sep">•</span>
        <a href="#" aria-disabled="true" class="disabled-link">Privacidade</a> -->
      </small>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { customIcons } from '@/utils/icons'
const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-footer {
  margin-top: 3rem;
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg-alt) 80%, transparent), var(--bg-alt));
  border-top: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  padding: 2rem 0 1.5rem;
  font-size: 0.95rem;
}

.footer-inner {
  width: min(1100px, 100% - 2rem);
  margin: 0 auto;
  display: grid;
  gap: 1.75rem;
}

/* Mobile-first: colunas empilhadas; define grid para telas maiores */
@media (min-width: 800px) {
  .footer-inner {
    grid-template-columns: 1.2fr 1fr 1fr 1fr;
    gap: 2rem;
  }
}

.logo-text {
  margin: 0 0 0.35rem;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.tagline {
  margin: 0 0 0.75rem;
  color: var(--muted);
  font-weight: 500;
}

.social-row {
  display: flex;
  gap: 0.75rem;
  margin: 0.5rem 0 0.75rem;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--card) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  color: var(--ink);
  text-decoration: none;
  transition: transform 0.15s ease, background 0.15s ease;
}

.social-link:hover {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--card) 80%, transparent);
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
  font-size: 0.95rem;
}

.links-col a:hover,
.social-col a:hover {
  text-decoration: underline;
}

.disabled-link {
  opacity: 0.5;
  pointer-events: none;
}

.copyright {
  margin-top: 0.5rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.legal {
  margin-top: 1.5rem;
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

@media (max-width: 660px) {
  .app-footer {
    /* adiciona espaço extra para a bottom nav fixa */
    padding: 1.75rem 0 5rem;
  }
}
</style>
