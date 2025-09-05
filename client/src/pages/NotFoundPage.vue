<template>
  <div class="not-found-page d-flex align-center justify-center">
    <v-container class="text-center" fluid>
      <div class="nf-card mx-auto">
        <div class="nf-icon mb-6">
          <v-icon :icon="customIcons.alert" size="108" color="error" />
        </div>

        <h1 class="nf-code">404</h1>
        <h2 class="nf-title">Página não encontrada</h2>
        <p class="nf-subtitle">
          O link pode estar incorreto, expirado ou a página foi movida.
        </p>

        <div class="nf-actions d-flex justify-center flex-wrap ga-3 mt-6">
          <v-btn :to="{ path: '/' }" color="primary" variant="flat" size="large">
            <v-icon :icon="customIcons.home" class="me-2" />
            Ir para o início
          </v-btn>
          <v-btn @click="$router.go(-1)" variant="outlined" size="large">
            Voltar
          </v-btn>
          <v-btn :to="{ path: '/lances-gravanois' }" variant="tonal" color="primary" size="large">
            Explorar lances
          </v-btn>
        </div>

        <div class="nf-help mt-8">
          <p class="mb-2 text-medium-emphasis">Você pode tentar:</p>
          <ul class="nf-tips">
            <li>Conferir se o endereço foi digitado corretamente.</li>
            <li>Voltar para a página anterior e tentar novamente.</li>
            <li>
              <router-link class="nf-link" :to="{ path: '/reportar-erro', query: { from: '404' } }">
                Reportar um problema
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </v-container>
  </div>
  
</template>

<script setup lang="ts">
import { customIcons } from "@/utils/icons";
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  position: relative;
  padding: 32px 16px;
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(var(--v-theme-primary), 0.08), transparent 60%),
    radial-gradient(900px 500px at 95% 10%, rgba(var(--v-theme-error), 0.06), transparent 60%),
    linear-gradient(180deg, #0b0c0f 0%, #0a0a0a 100%);
}

.nf-card {
  max-width: 820px;
  padding: 32px 24px;
  border-radius: 16px;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 50px rgba(0,0,0,0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.nf-icon {
  animation: float 4s ease-in-out infinite;
}

.nf-code {
  margin: 0 0 8px;
  font-size: clamp(64px, 16vw, 140px);
  line-height: 0.9;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.6));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nf-title {
  margin: 0 0 8px;
  font-size: clamp(20px, 4vw, 32px);
  font-weight: 700;
}

.nf-subtitle {
  margin: 0 auto;
  max-width: 56ch;
  color: rgba(255,255,255,0.75);
}

.nf-actions > *:not(:last-child) {
  margin-right: 8px;
}

.nf-help {
  color: rgba(255,255,255,0.7);
}
.nf-tips {
  margin: 0 auto;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}
.nf-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@media (min-width: 960px) {
  .nf-card { padding: 40px 36px; }
}
</style>
