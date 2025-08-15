<template>
  <div>
    <main>
      <!-- HERO -->
      <section class="hero" aria-labelledby="hero-title">
        <div class="container hero-grid">
          <div class="hero-copy">
            <h1 id="hero-title">Grava Nóis</h1>
            <p class="hero-subtitle">Seu lance, sua história.</p>
            <p>
              No esporte amador, cada jogada é única. O <strong>Grava Nóis</strong> nasceu para garantir que seus
              momentos mais incríveis nunca se percam.
            </p>
            <div class="flex flex-wrap gap-3 justify-center sm:justify-around">
              <v-btn href="#how" variant="outlined" class="w-full sm:w-auto mr-2">Ver como funciona</v-btn>
              <v-btn href="#mission" variant="outlined" class="w-full sm:w-auto">Nossa missão</v-btn>
            </div>
          </div>
          <div class="hero-media" aria-hidden="true">
            <div class="media-card">
              <img
                class="media-img"
                :src="IMAGES.hero"
                alt="Jogadores em quadra com gol ao fundo"
                loading="eager"
                fetchpriority="high"
              />
              <div class="media-label">Replays em ação</div>
            </div>
          </div>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- MISSION -->
      <section id="mission" class="section" aria-labelledby="mission-title">
        <div class="container narrow">
          <h2 id="mission-title" class="section-title">Missão</h2>
          <p class="lede">
            No esporte amador, cada jogada é única. Mas muitas vezes, ela se perde na memória e no “quase deu pra
            gravar”.
          </p>
          <p>
            O <strong>Grava Nóis</strong> nasceu para mudar isso: dar a todo jogador a chance de registrar seus melhores
            momentos e revivê-los quantas vezes quiser. Seja no futebol, vôlei, basquete ou qualquer esporte coletivo, a
            emoção de um grande lance merece ser eternizada.
          </p>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- HOW IT WORKS -->
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
              <div class="step-icon" aria-hidden="true">
                <span class="mdi mdi-gesture-tap-button fs-"></span>
              </div>
              <h3>Botão do lance</h3>
              <p>No momento do lance você aperta o botão físico ou futuro atalho no app.</p>
            </li>
            <li class="step-card">
              <div class="step-icon" aria-hidden="true">
                <ClockPlus />
              </div>
              <h3>Recorte inteligente</h3>
              <p>O sistema salva automaticamente segundos antes e depois, totalizando 40 segundos.</p>
            </li>
            <li class="step-card">
              <div class="step-icon" aria-hidden="true"><CloudDownload /></div>
              <h3>Processo & plataforma</h3>
              <p>Transcodifica, envia e disponibiliza para assistir, compartilhar e baixar.</p>
            </li>
          </ul>
          <v-btn size="small" variant="text" color="primary" class="mt-2" @click="showHowDialog = true"
            >Mais Detalhes</v-btn
          >
        </div>
      </section>

      <!-- Dialog explicação detalhada -->
      <v-dialog v-model="showHowDialog" max-width="680" :scrim="true" transition="dialog-bottom-transition">
        <v-card
          class="relative bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-zinc-200/60 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden"
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
                <strong class="font-semibold text-zinc-900 dark:text-white">Ação do Jogador:</strong> o botão físico
                fica posicionado nas laterias do campo, o jogador aciona o sistema no momento do clique.
              </li>
              <li>
                <strong class="font-semibold text-zinc-900 dark:text-white">Recorte:</strong> o serviço de captura
                extrai a gravação no intervalo [30s pré] até [10s pós] (configurável).
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
                <strong class="font-semibold text-zinc-900 dark:text-white">Segurança:</strong> criptografia em
                trânsito, hash de integridade e políticas de expiração configuráveis.
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
            class="px-5 py-3 flex justify-end gap-2 bg-zinc-50/70 dark:bg-white/5 border-t border-zinc-200/70 dark:border-white/10"
          >
            <v-btn color="danger" variant="outlined" class="font-medium" @click="showHowDialog = false">Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- DIFFERENTIALS -->
      <section id="differentials" class="section" aria-labelledby="diff-title">
        <div class="container">
          <h2 id="diff-title" class="section-title">Por que somos diferentes</h2>
          <div class="card-grid">
            <article class="card">
              <h3><Target color="red" /> Foco no amador</h3>
              <p>Feito para quem joga por paixão, não por contrato.</p>
            </article>
            <article class="card">
              <h3><Zap color="yellow" /> Replays instantâneos</h3>
              <p>Reviva o lance na hora, sem esperar o jogo acabar.</p>
            </article>
            <article class="card">
              <h3>☁ Plataforma intuitiva</h3>
              <p>Baixe seus vídeos quando quiser, com poucos cliques.</p>
            </article>
            <article class="card">
              <h3><ShieldCheckIcon /> Segurança</h3>
              <p>Criptografia em trânsito, URLs assinadas e verificação de integridade.</p>
            </article>
          </div>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- SHOWCASE (visual-heavy block, Netflix-style) -->
      <section class="section alt" aria-labelledby="showcase-title">
        <div class="container">
          <h2 id="showcase-title" class="section-title">Feito para qualquer quadra, qualquer time</h2>
          <div class="showcase-grid">
            <div class="media-card tall">
              <img
                class="media-img"
                :src="IMAGES.soccer"
                alt="Partida de futebol society"
                loading="lazy"
                decoding="async"
              />
              <div class="media-label">Futebol society</div>
            </div>
            <div class="media-card">
              <img class="media-img" :src="IMAGES.volleyball" alt="Quadra de vôlei" loading="lazy" decoding="async" />
              <div class="media-label">Vôlei</div>
            </div>
            <div class="media-card">
              <img
                class="media-img"
                :src="IMAGES.basketball"
                alt="Quadra de basquete"
                loading="lazy"
                decoding="async"
              />
              <div class="media-label">Basquete</div>
            </div>
            <div class="media-card wide">
              <img class="media-img" :src="IMAGES.outdoor" alt="Quadra externa/areia" loading="lazy" decoding="async" />
              <div class="media-label">Areia & quadras externas</div>
            </div>
          </div>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- STATS STRIP -->
      <section class="stats" aria-label="Nossos números (placeholders)">
        <div class="container stats-inner my-4">
          <div class="stat">
            <span class="num"><Infinity /></span><span class="label">Replays</span>
          </div>
          <div class="stat">
            <span class="num"><Infinity /></span><span class="label">Esportes</span>
          </div>
          <div class="stat"><span class="num">24/7</span><span class="label">Disponível</span></div>
          <div class="stat"><span class="num">Pronto</span><span class="label">para escalar</span></div>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- SECURITY -->
      <section id="security" class="section" aria-labelledby="security-title">
        <div class="container narrow">
          <h2 id="security-title" class="section-title">Segurança e privacidade</h2>
          <ul class="checklist">
            <li>Criptografia TLS em trânsito; storage com verificação de integridade (hash).</li>
            <li>URLs de download assinadas e com expiração; controle de acesso por token.</li>
            <li>Backups versionados; redundância geográfica opcional.</li>
            <li>Conformidade com boas práticas de LGPD (minimização, consentimento, retenção).</li>
          </ul>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- FAQ (Netflix uses expandable sections; here using native details) -->
      <section id="faq" class="section alt" aria-labelledby="faq-title">
        <div class="container narrow">
          <h2 id="faq-title" class="section-title">Perguntas frequentes</h2>
          <details class="faq-item">
            <summary>Como instalo o sistema no meu campo?</summary>
            <p class="mt-3">
              A instalaçõa é feita por nossa equipe técnica. Basta entrar em contato e agendamos uma visita.
            </p>
          </details>
          <details class="faq-item">
            <summary>Funciona com internet instável?</summary>
            <p class="mt-3">
              Sim. Gravamos localmente com buffer e fazemos upload resiliente em blocos quando a conexão permite.
            </p>
          </details>
          <details class="faq-item">
            <summary>Como pago e baixo meus vídeos?</summary>
            <p class="mt-3">
              Os vídeos ficam na plataforma; você paga por clip ou pacote e recebe um link seguro para download.
            </p>
          </details>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- CTA -->
      <section id="cta" class="cta" aria-labelledby="cta-title">
        <div class="container cta-inner">
          <h2 id="cta-title">Pronto para eternizar seus lances?</h2>
          <p>Leve o Grava Nóis para sua quadra e não perca mais nenhum momento.</p>
          <v-btn variant="outlined">Agende a sua instalação</v-btn>
        </div>
      </section>

      <!-- Back to top button -->
      <button class="to-top" :class="{ show: showTop }" @click="scrollToTop" aria-label="Voltar ao topo">
        <ArrowBigUp color="green" />
      </button>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  VideoIcon,
  ClockPlus,
  CloudDownload,
  Zap,
  ShieldCheckIcon,
  Infinity,
  ArrowBigUp,
  Target,
} from "lucide-vue-next";

import hero from "@/assets/images/hero-about.png";
import soccer from "@/assets/images/society-about.png";
import volleyball from "@/assets/images/volleyball-about.png";
import basketball from "@/assets/images/basketball-about.png";
import outdoor from "@/assets/images/futbolley-about.png";
const IMAGES = {
  hero: hero,
  soccer: soccer,
  volleyball: volleyball,
  basketball: basketball,
  outdoor: outdoor,
};

const showTop = ref(false);
const showHowDialog = ref(false);
const onScroll = () => {
  showTop.value = window.scrollY > 600;
};
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const goFaq = () => {
  const faqSection = document.getElementById("faq");
  if (faqSection) {
    faqSection.scrollIntoView({ behavior: "smooth" });
  }
};

function scrollToFaqFromDialog() {
  // close dialog first (for accessibility) then smooth scroll
  showHowDialog.value = false;
  const HEADER_OFFSET = 80;
  // wait for dialog close animation
  setTimeout(() => {
    const el = document.getElementById("faq");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
      // move focus to heading for a11y
      const heading = el.querySelector("h2, h1, [id]");
      if (heading instanceof HTMLElement) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
        setTimeout(() => heading.removeAttribute("tabindex"), 1000);
      }
    }
  }, 220); // matches dialog transition timing
}

onMounted(() => window.addEventListener("scroll", onScroll));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<style scoped>
.about {
  min-height: 100%;
  background: var(--bg);
}
.container {
  width: min(1100px, 100% - 2rem);
  margin: 0 auto;
}
.narrow {
  width: min(840px, 100% - 2rem);
}
.section {
  padding: 4rem 0;
}
.section.alt {
  background: var(--bg-alt);
}
.section-title {
  font-size: clamp(1.5rem, 2vw + 1rem, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
}
.lede {
  font-size: 1.15rem;
  color: var(--muted);
}

.logo-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: red;
  box-shadow: 0 0 0 6px var(--ring);
}

/* Hero */
.hero {
  background: radial-gradient(
      1200px 400px at 20% -20%,
      color-mix(in srgb, var(--brand) 14%, transparent),
      transparent 60%
    ),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-alt) 70%, transparent), transparent 60%);
  padding: 5rem 0 3rem;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2rem;
  align-items: center;
}
.hero-copy h1 {
  font-size: clamp(2rem, 5vw + 0.5rem, 3.25rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0 0 0.25rem;
}
.hero-subtitle {
  font-size: clamp(1.4rem, 1.25vw + 0.5rem, 1.5rem);
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--muted);
}
.hero-copy p {
  font-size: 1.1rem;
  color: var(--muted);
  margin: 0 0 1.25rem;
}
.hero-cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.media-card {
  position: relative;
  border-radius: 1rem;
  background: var(--card);
  box-shadow: 0 20px 60px -24px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  min-height: 220px;
}
.media-card.tall {
  min-height: 360px;
}
.media-card.wide {
  grid-column: span 2;
}
.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.media-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.45) 100%);
  opacity: 0.6;
}
.media-label {
  position: absolute;
  left: 0.75rem;
  bottom: 0.5rem;
  z-index: 2;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

/* Steps */
.steps {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.step-card {
  background: var(--card);
  border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 10px 24px -16px rgba(0, 0, 0, 0.25);
}
.step-card h3 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.05rem;
}
.step-card p {
  margin: 0;
  color: var(--muted);
}
.step-icon {
  font-size: 1.5rem;
}

/* Cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}
.card {
  background: var(--card);
  border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  border-radius: 1rem;
  padding: 1.25rem;
}
.card h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}
.card p {
  margin: 0;
  color: var(--muted);
}

/* Showcase */
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.showcase-grid .wide {
  grid-column: span 2;
}

/* Stats strip */
.stats {
  background: linear-gradient(90deg, color-mix(in srgb, var(--brand) 14%, var(--bg)), var(--bg));
  border-block: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
}
.stats-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 1.25rem 0;
}
.stat {
  text-align: center;
}
.stat .num {
  display: block;
  font-weight: 900;
  font-size: clamp(1.25rem, 2vw + 0.5rem, 1.75rem);
  letter-spacing: -0.02em;
}
.stat .label {
  color: var(--muted);
  font-weight: 600;
}

/* Security */
.checklist {
  margin: 1rem 0 0;
  padding-left: 1.25rem;
}
.checklist li {
  margin: 0.5rem 0;
}

/* FAQ */
.faq-item {
  background: var(--card);
  border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  margin: 0.75rem 0;
}
.faq-item > summary {
  cursor: pointer;
  font-weight: 700;
}
.faq-item[open] {
  box-shadow: 0 10px 24px -16px rgba(0, 0, 0, 0.25);
}

/* CTA */
.cta {
  background: radial-gradient(
      900px 300px at 10% -10%,
      color-mix(in srgb, var(--brand) 14%, transparent),
      transparent 60%
    ),
    var(--bg-alt);
}
.cta-inner {
  text-align: center;
  padding: 3rem 0;
}
.cta h2 {
  font-size: clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem);
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
}
.cta p {
  color: var(--muted);
  margin: 0 0 1rem;
}

/* To top */
.to-top {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: var(--brand);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.15s ease;
  box-shadow: 0 12px 28px -12px var(--ring);
}
.to-top.show {
  opacity: 1;
  pointer-events: auto;
}
.to-top:hover {
  transform: translateY(-2px);
}

/* HOW IT WORKS */
.how-head {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.how-head .section-title {
  margin: 0;
}
.how-list {
  padding-left: 1.1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.how-list li {
  line-height: 1.35;
}

/* Responsive */
@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  .steps {
    grid-template-columns: repeat(2, 1fr);
  }
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .showcase-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .links a:not(.btn) {
    display: none;
  }
  .steps {
    grid-template-columns: 1fr;
  }
  .card-grid,
  .showcase-grid {
    grid-template-columns: 1fr;
  }
  .stats-inner {
    grid-template-columns: 1fr 1fr;
  }
  .showcase-grid .media-card.wide {
    grid-column: auto; /* remove span 2 que escondia o restante */
  }
}

/* Motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .btn,
  .to-top {
    transition: none;
  }
  html {
    scroll-behavior: auto;
  }
}
</style>
