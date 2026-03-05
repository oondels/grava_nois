<template>
  <main class="bg-[var(--bg)] text-[var(--ink)]">
    <HeroSection />

    <v-divider :thickness="4" color="success"></v-divider>

    <HowItWorksSection />

    <v-divider :thickness="4" color="success"></v-divider>
    <Patrocinadores />
    <v-divider :thickness="4" color="success"></v-divider>

    <section id="mission" class="py-16 md:py-20 lg:py-24" aria-labelledby="mission-title">
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-start gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <h2 id="mission-title" class="text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
            Missão
          </h2>
          <div class="space-y-5 text-left text-base leading-relaxed text-[var(--muted)] md:text-lg">
            <p>
              No esporte amador, cada jogada é única. Mas muitas vezes, ela se perde na memória e no "quase deu pra
              gravar".
            </p>
            <p>
              O <strong class="text-[var(--ink)]">Grava Nóis</strong> nasceu para mudar isso: dar a todo jogador a
              chance de registrar seus melhores momentos e revivê-los quantas vezes quiser. Seja no futebol, vôlei,
              basquete ou qualquer esporte coletivo, a emoção de um grande lance merece ser eternizada.
            </p>
          </div>
        </div>
      </div>
    </section>

    <v-divider :thickness="4" color="success"></v-divider>

    <section id="differentials" class="py-16 md:py-20 lg:py-24" aria-labelledby="diff-title">
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="diff-title" class="text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
          Por que somos diferentes
        </h2>

        <div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <article
            class="rounded-2xl border border-white/10 bg-[var(--card)] p-6 text-left shadow-[0_20px_45px_-26px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 class="flex items-center text-lg font-bold text-[var(--ink)]">
              <Target color="red" class="mr-2 h-5 w-5" /> Foco no amador
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">Feito para quem joga por paixão, não por contrato.</p>
          </article>

          <article
            class="rounded-2xl border border-white/10 bg-[var(--card)] p-6 text-left shadow-[0_20px_45px_-26px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 class="flex items-center text-lg font-bold text-[var(--ink)]">
              <Zap color="yellow" class="mr-2 h-5 w-5" /> Replays instantâneos
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">Reviva o lance na hora, sem esperar o jogo acabar.</p>
          </article>

          <article
            class="rounded-2xl border border-white/10 bg-[var(--card)] p-6 text-left shadow-[0_20px_45px_-26px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 class="flex items-center text-lg font-bold text-[var(--ink)]">
              <Banknote class="mr-2 h-5 w-5" color="green" /> Premiação (em breve)
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Ganhe prêmios com seus clipes! Ideal para quadras parceiras e atletas criadores.
            </p>
          </article>

          <article
            class="rounded-2xl border border-white/10 bg-[var(--card)] p-6 text-left shadow-[0_20px_45px_-26px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 class="flex items-center text-lg font-bold text-[var(--ink)]">
              <AppWindow class="mr-2 h-5 w-5" /> Plataforma intuitiva
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">Baixe seus vídeos quando quiser, com poucos cliques.</p>
          </article>

          <article
            class="rounded-2xl border border-white/10 bg-[var(--card)] p-6 text-left shadow-[0_20px_45px_-26px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:col-span-2 lg:col-span-2"
          >
            <h3 class="flex items-center text-lg font-bold text-[var(--ink)]">
              <ShieldCheckIcon class="mr-2 h-5 w-5" color="orange" /> Segurança
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Criptografia em trânsito, URLs assinadas e verificação de integridade.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- <v-divider :thickness="4" color="success"></v-divider>

    <section id="social" class="bg-[var(--bg-alt)] py-16 md:py-20 lg:py-24" aria-labelledby="social-title">
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div class="text-left">
            <div class="mb-4 flex items-center justify-between gap-4">
              <h2 id="social-title" class="text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
                Feed vertical & premiações
                <small class="ml-1 text-base font-semibold text-[var(--muted)]">(em breve)</small>
              </h2>
              <v-chip size="small" label color="amber">PILOTO</v-chip>
            </div>

            <p class="text-base leading-relaxed text-[var(--muted)] md:text-lg">
              Descoberta de lances no formato que o público já ama, com oportunidades reais de receita para quadras e
              atletas.
            </p>

            <ul class="mt-6 space-y-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
              <li><strong class="text-[var(--ink)]">Descoberta fácil:</strong> lances em formato vertical, deslize para ver mais.</li>
              <li>
                <strong class="text-[var(--ink)]">Premiação:</strong> poste clipes, seja avaliado, acumule pontos e troque
                por prêmios com nossos parceiros.
              </li>
              <li><strong class="text-[var(--ink)]">Visibilidade local:</strong> ranking por quadra, eventos e campeonatos.</li>
              <li><strong class="text-[var(--ink)]">Parcerias:</strong> espaço para marcas locais e ações no dia do jogo.</li>
            </ul>
          </div>

          <div class="relative mx-auto w-full max-w-xl lg:mx-0">
            <div class="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/20 blur-2xl"></div>
            <div class="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 shadow-[0_32px_60px_-32px_rgba(0,0,0,0.7)]">
              <img
                class="h-full w-full rounded-2xl object-cover"
                :src="SOCIAL_FEED_IMAGE"
                alt="Preview do feed vertical de lances"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section> -->

    <v-divider :thickness="4" color="success"></v-divider>

    <ShowCaseSection />

    <v-divider :thickness="4" color="success"></v-divider>

    <section class="border-y border-white/10 bg-[var(--bg-alt)]" aria-label="Nossos números (placeholders)">
      <div class="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <span class="flex items-center justify-center text-2xl font-black text-[var(--ink)]"><Infinity /></span>
          <span class="mt-1 block text-sm font-semibold text-[var(--muted)]">Replays</span>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <span class="flex items-center justify-center text-2xl font-black text-[var(--ink)]"><Infinity /></span>
          <span class="mt-1 block text-sm font-semibold text-[var(--muted)]">Esportes</span>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <span class="block text-2xl font-black text-[var(--ink)]">24/7</span>
          <span class="mt-1 block text-sm font-semibold text-[var(--muted)]">Disponível</span>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <span class="block text-2xl font-black text-[var(--ink)]">Pronto</span>
          <span class="mt-1 block text-sm font-semibold text-[var(--muted)]">para escalar</span>
        </div>
      </div>
    </section>

    <v-divider :thickness="4" color="success"></v-divider>

    <section id="security" class="py-16 md:py-20 lg:py-24" aria-labelledby="security-title">
      <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 id="security-title" class="text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
          Segurança e privacidade
        </h2>

        <ul class="mt-6 space-y-3 text-left text-sm leading-relaxed text-[var(--muted)] md:text-base">
          <li>Criptografia TLS em trânsito; logins com segurança de ponta a ponta.</li>
          <li>URLs de download assinadas e com expiração; controle de acesso por usuário/campo.</li>
          <li>Backups versionados.</li>
          <li>Conformidade com boas práticas de LGPD (minimização, consentimento, retenção).</li>
        </ul>
      </div>
    </section>

    <v-divider :thickness="4" color="success"></v-divider>

    <section id="faq" class="bg-[var(--bg-alt)] py-16 md:py-20 lg:py-24" aria-labelledby="faq-title">
      <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 id="faq-title" class="text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
          Perguntas frequentes
        </h2>

        <div class="mt-8 space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          <details class="rounded-2xl border border-white/10 bg-[var(--card)] p-5 shadow-[0_16px_32px_-24px_rgba(0,0,0,0.6)]">
            <summary class="cursor-pointer text-left text-base font-bold text-[var(--ink)]">Como instalo o sistema no meu campo?</summary>
            <p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              A instalação é feita por nossa equipe técnica. Basta entrar em contato e agendamos uma visita.
            </p>
          </details>

          <details class="rounded-2xl border border-white/10 bg-[var(--card)] p-5 shadow-[0_16px_32px_-24px_rgba(0,0,0,0.6)]">
            <summary class="cursor-pointer text-left text-base font-bold text-[var(--ink)]">Funciona com internet instável?</summary>
            <p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Sim. Gravamos localmente com buffer e fazemos upload resiliente em blocos quando a conexão permite.
            </p>
          </details>

          <details class="rounded-2xl border border-white/10 bg-[var(--card)] p-5 shadow-[0_16px_32px_-24px_rgba(0,0,0,0.6)]">
            <summary class="cursor-pointer text-left text-base font-bold text-[var(--ink)]">Como pago e baixo meus vídeos?</summary>
            <p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Os vídeos ficam na plataforma; você paga por clip ou pacote e recebe um link seguro para download.
            </p>
          </details>

          <details class="rounded-2xl border border-white/10 bg-[var(--card)] p-5 shadow-[0_16px_32px_-24px_rgba(0,0,0,0.6)]">
            <summary class="cursor-pointer text-left text-base font-bold text-[var(--ink)]">Como vai funcionar a premiação?</summary>
            <p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Durante o piloto, quadras e atletas parceiros concorrerão a prêmios mensais baseados em engajamento e
              desempenho dos vídeos na plataforma. Acumule pontos no app e troque por prêmios.
            </p>
          </details>
        </div>
      </div>
    </section>

    <v-divider :thickness="4" color="success"></v-divider>

    <section id="cta" class="bg-[var(--bg-alt)] py-16 md:py-20 lg:py-24" aria-labelledby="cta-title">
      <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-white/5 to-sky-500/10 p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] lg:p-12">
          <h2 id="cta-title" class="text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
            Pronto para eternizar seus lances?
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Leve o Grava Nóis para sua quadra e não perca mais nenhum momento.
          </p>
        </div>
      </div>
    </section>

    <button
      type="button"
      class="fixed bottom-16 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500"
      :class="showTop ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'"
      @click="scrollToTop"
      aria-label="Voltar ao topo"
    >
      <ArrowBigUp color="white" class="h-5 w-5" />
    </button>
  </main>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { AppWindow, Zap, ShieldCheckIcon, Infinity, ArrowBigUp, Target, Banknote } from "lucide-vue-next";
import HeroSection from "@/components/home-sections/HeroSection.vue";
import HowItWorksSection from "@/components/home-sections/HowItWorksSection.vue";
import ShowCaseSection from "@/components/home-sections/ShowCaseSection.vue";
import Patrocinadores from "@/components/Patrocinadores.vue";
import feedPreview from "@/assets/images/feed-preview.webp";

const SOCIAL_FEED_IMAGE = feedPreview;

const showTop = ref(false);
const onScroll = () => {
  showTop.value = window.scrollY > 600;
};
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

onMounted(() => window.addEventListener("scroll", onScroll));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>
