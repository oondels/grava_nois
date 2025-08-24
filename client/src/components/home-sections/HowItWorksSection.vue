<template>
  <!-- Como Funciona -->
  <section id="how" class="section alt" aria-labelledby="how-title">
    <div class="container">
      <div class="d-flex justify-center align-center">
        <h2 id="how-title" class="section-title">Como funciona?</h2>
      </div>
      <ul class="steps">
        <li class="step-card">
          <div class="step-icon d-flex flex-row justify-center align-center" aria-hidden="true">
            <VideoIcon />
            <div class="logo-dot ml-3" aria-hidden="true"></div>
          </div>
          <h3>Câmeras atentas</h3>
          <p>Captura contínua em Full HD mantendo um buffer circular de alguns minutos.</p>
        </li>

        <li class="step-card">
          <div class="step-icon d-flex flex-row justify-center align-center" aria-hidden="true">
            <span class="mdi mdi-gesture-tap-button fs-"></span>
          </div>
          <div class="step-icon" aria-hidden="true"></div>
          <h3>Botão do lance</h3>
          <p>No momento do lance você aperta o botão físico ou futuro atalho no app.</p>
        </li>

        <li class="step-card">
          <div class="step-icon d-flex flex-row justify-center align-center" aria-hidden="true">
            <ClockPlus />
          </div>
          <h3>Recorte inteligente</h3>
          <p>O sistema salva automaticamente segundos antes e depois, totalizando 40 segundos.</p>
        </li>

        <li class="step-card">
          <div class="step-icon d-flex flex-row justify-center align-center" aria-hidden="true">
            <CloudDownload />
          </div>
          <h3>Processo & plataforma</h3>
          <p>Transcodifica, envia e disponibiliza para assistir, compartilhar e baixar.</p>
        </li>
      </ul>

      <v-btn size="small" variant="text" color="primary" class="mt-2" @click="showHowDialog = true">
        Mais Detalhes
      </v-btn>
    </div>

    <!-- Dialog explicação detalhada -->
    <v-dialog
      v-model="showHowDialog"
      :fullscreen="display.smAndDown ? true : false"
      :max-width="display.smAndDown ? undefined : 680"
      :scrim="true"
      :scrollable="true"
      :transition="display.smAndDown ? 'dialog-bottom-transition' : 'dialog-transition'"
    >
      <v-card
        class="dialog-card relative bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-zinc-200/60 dark:border-white/10 shadow-2xl rounded-2xl overflow-auto"
        :class="{ 'rounded-none': display.smAndDown }"
      >
        <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-500"></div>
        <v-card-title
          class="flex items-center justify-between px-5 py-4 border-b border-zinc-200/70 dark:border-white/10"
        >
          <span class="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100"
            >Como o fluxo funciona na prática</span
          >
        </v-card-title>
        <v-card-text class="pt-5 pb-2 px-5">
          <ol class="list-decimal pl-5 space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            <li>
              <strong class="font-semibold text-zinc-900 dark:text-white">Captura contínua:</strong> as câmeras gravam
              sem parar usando um buffer que é constantemente sobrescrito.
            </li>
            <li>
              <strong class="font-semibold text-zinc-900 dark:text-white">Ação do Jogador:</strong> o botão físico fica
              posicionado nas laterias do campo, o jogador aciona o sistema no momento do clique.
            </li>
            <li>
              <strong class="font-semibold text-zinc-900 dark:text-white">Recorte:</strong> o serviço de captura extrai
              a gravação no intervalo [30s pré] até [10s pós] (configurável).
            </li>
            <li>
              <strong class="font-semibold text-zinc-900 dark:text-white">Processamento:</strong> normaliza, aplica
              cortes, gera thumbnail e aplica marca d'água do campo (se desejável).
            </li>
            <li>
              <strong class="font-semibold text-zinc-900 dark:text-white">Upload resiliente:</strong> envia em blocos
              com retomada; gera URL segura para download.
            </li>
            <li>
              <strong class="font-semibold text-zinc-900 dark:text-white">Plataforma:</strong> o clip aparece na sua
              lista, podendo ser marcado como favorito, compartilhado ou baixado.
            </li>
            <li>
              <strong class="font-semibold text-zinc-900 dark:text-white">Segurança:</strong> criptografia em trânsito,
              hash de integridade e políticas de expiração configuráveis.
            </li>
          </ol>
          <p class="mt-6 text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
            Tem outra dúvida? Veja também a seção de
            <a
              href="#faq"
              @click.prevent="scrollToFaqFromDialog"
              class="text-emerald-600 dark:text-emerald-400 underline decoration-dotted hover:decoration-solid focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-sm"
            >
              Perguntas Frequentes </a
            >.
          </p>
        </v-card-text>
        <v-card-actions
          class="px-5 py-3 flex justify-end gap-2 bg-zinc-50/70 dark:bg-white/5 border-t border-zinc-200/70 dark:border-white/10 sticky bottom-0 z-10"
        >
          <v-btn color="danger" variant="outlined" class="font-medium" @click="showHowDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDisplay } from "vuetify";
import { VideoIcon, ClockPlus, CloudDownload } from "lucide-vue-next";

const showHowDialog = ref(false);
const display = useDisplay();
function scrollToFaqFromDialog() {
  showHowDialog.value = false;
  const HEADER_OFFSET = 80;

  setTimeout(() => {
    const el = document.getElementById("faq");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
      const heading = el.querySelector("h2, h1, [id]");
      if (heading instanceof HTMLElement) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
        setTimeout(() => heading.removeAttribute("tabindex"), 1000);
      }
    }
  }, 220);
}
</script>

<style scoped></style>
<style scoped>
/* Responsividade do dialog */
.dialog-card {
  max-height: min(90vh, 100dvh - 32px);
}
@media (max-width: 600px) {
  .dialog-card {
    max-height: 100dvh;
    border-radius: 0;
  }
}
/* Liquid glass inspirado na Apple para os cards de etapa */
.steps {
  /* espaço levemente maior entre os cards para valorizar o efeito */
  gap: 1.1rem;
}

.step-card {
  position: relative;
  overflow: hidden;
  isolation: isolate; /* garante camadas corretas */
  border-radius: 1rem;
  /* base translucida com bom contraste em light/dark */
  background: color-mix(in srgb, var(--card) 52%, transparent);
  border: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
  /* borda interna suave e profundidade */
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 16px 48px rgba(255, 255, 255, 0.06),
    0 10px 24px -16px rgba(0, 0, 0, 0.28);
}

/* Camada de brilho/sheen fluido */
.step-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  z-index: 0;
  pointer-events: none;
  background:
    /* brilho superior esquerdo */ radial-gradient(
      120% 80% at -10% -20%,
      rgba(255, 255, 255, 0.28),
      rgba(255, 255, 255, 0) 60%
    ),
    /* brilho inferior */ radial-gradient(60% 40% at 50% 120%, rgba(255, 255, 255, 0.08), transparent 70%),
    /* leve tinta da marca para dar vida */
      radial-gradient(120% 80% at 110% -20%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 60%);
  transition: transform 320ms ease, opacity 240ms ease;
  opacity: 0.9;
}

/* Película suave para reforçar o efeito vítreo */
.step-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
}

/* Conteúdo acima das camadas */
.step-card > * {
  position: relative;
  z-index: 1;
}

/* Interações sutis */
@media (hover: hover) {
  .step-card:hover::before,
  .step-card:focus-within::before {
    transform: translate3d(2px, -2px, 0) scale(1.02);
    opacity: 1;
  }
}

/* Blur com fallback amplo: se suportado, aplica blur/saturate; senão, mantém a base translúcida */
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .step-card {
    background: color-mix(in srgb, var(--bg-alt) 24%, transparent);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    backdrop-filter: blur(10px) saturate(120%);
  }
}

/* Acessibilidade de movimento */
@media (prefers-reduced-motion: reduce) {
  .step-card::before {
    transition: none;
  }
}
</style>
