<template>
  <!-- Como Funciona -->
  <section id="how" class="bg-[var(--bg-alt)] py-16 md:py-20 lg:py-24" aria-labelledby="how-title">
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 id="how-title" class="text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
          Como funciona?
        </h2>
      </div>
      <ul class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <li
          class="step-shell relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:after:absolute lg:after:left-[calc(100%+0.75rem)] lg:after:top-9 lg:after:h-px lg:after:w-6 lg:after:bg-white/20 lg:last:after:hidden"
        >
          <div class="mb-3 flex items-center justify-center gap-3 text-emerald-300" aria-hidden="true">
            <VideoIcon class="h-7 w-7" />
            <span class="h-3.5 w-3.5 rounded-full bg-red-500 shadow-[0_0_0_6px_rgba(255,77,90,0.25)]"></span>
          </div>
          <h3 class="text-lg font-bold text-[var(--ink)]">Câmeras atentas</h3>
          <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Captura contínua em Full HD mantendo um buffer circular de alguns minutos.
          </p>
        </li>

        <li
          class="step-shell relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:after:absolute lg:after:left-[calc(100%+0.75rem)] lg:after:top-9 lg:after:h-px lg:after:w-6 lg:after:bg-white/20 lg:last:after:hidden"
        >
          <div class="mb-3 flex items-center justify-center text-emerald-300" aria-hidden="true">
            <MousePointerClick class="h-7 w-7" />
          </div>
          <h3 class="text-lg font-bold text-[var(--ink)]">Botão do lance</h3>
          <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            No momento do lance você aperta o botão físico ou futuro atalho no app.
          </p>
        </li>

        <li
          class="step-shell relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:after:absolute lg:after:left-[calc(100%+0.75rem)] lg:after:top-9 lg:after:h-px lg:after:w-6 lg:after:bg-white/20 lg:last:after:hidden"
        >
          <div class="mb-3 flex items-center justify-center text-emerald-300" aria-hidden="true">
            <ClockPlus class="h-7 w-7" />
          </div>
          <h3 class="text-lg font-bold text-[var(--ink)]">Recorte inteligente</h3>
          <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            O sistema salva automaticamente segundos antes e depois, totalizando 40 segundos.
          </p>
        </li>

        <li class="step-shell relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div class="mb-3 flex items-center justify-center text-emerald-300" aria-hidden="true">
            <CloudDownload class="h-7 w-7" />
          </div>
          <h3 class="text-lg font-bold text-[var(--ink)]">Processo & plataforma</h3>
          <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Transcodifica, envia e disponibiliza para assistir, compartilhar e baixar.
          </p>
        </li>
      </ul>

      <v-btn size="small" variant="text" color="primary" class="mt-5" @click="showHowDialog = true">
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
import { VideoIcon, ClockPlus, CloudDownload, MousePointerClick } from "lucide-vue-next";

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
/* Camada sutil para dar profundidade aos cards */
.step-shell {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.step-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
      120% 80% at -10% -20%,
      rgba(255, 255, 255, 0.18),
      rgba(255, 255, 255, 0) 60%
    ),
    radial-gradient(120% 80% at 110% -20%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 60%);
}

.step-shell > * {
  position: relative;
  z-index: 1;
}
</style>
