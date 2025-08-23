<template>
  <div>
    <main>
      <!-- HERO -->
      <HeroSection />

      <v-divider :thickness="4" color="success"></v-divider>

      <HowItWorksSection />

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

      <!-- DIFFERENTIALS -->
      <section id="differentials" class="section" aria-labelledby="diff-title">
        <div class="container">
          <h2 id="diff-title" class="section-title">Por que somos diferentes</h2>
          <div class="card-grid">
            <article class="card flex flex-column justify-center align-center">
              <h3 class="flex flex-row justify-center align-center">
                <Target color="red" class="mr-2" /> Foco no amador
              </h3>
              <p>Feito para quem joga por paixão, não por contrato.</p>
            </article>

            <article class="card">
              <h3 class="flex flex-row justify-center align-center">
                <Zap color="yellow" class="mr-2" /> Replays instantâneos
              </h3>
              <p>Reviva o lance na hora, sem esperar o jogo acabar.</p>
            </article>

            <article class="card">
              <h3 class="flex flex-row justify-center align-center">
                <Banknote class="mr-2" color="green" /> Premiações (em breve)
              </h3>
              <p>Ganhe prêmios com seus clipes! Ideal para quadras parceiras e atletas criadores.</p>
            </article>

            <article class="card">
              <h3 class="flex flex-row justify-center align-center"><AppWindow class="mr-2" />Plataforma intuitiva</h3>
              <p>Baixe seus vídeos quando quiser, com poucos cliques.</p>
            </article>

            <article class="card">
              <h3 class="flex flex-row justify-center align-center">
                <ShieldCheckIcon class="mr-2" color="orange" /> Segurança
              </h3>
              <p>Criptografia em trânsito, URLs assinadas e verificação de integridade.</p>
            </article>
          </div>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <section id="social" class="section alt" aria-labelledby="social-title">
        <div class="container">
          <div class="d-flex justify-space-between align-center mb-3">
            <h2 id="social-title" class="section-title">
              Feed vertical & premiações<small style="font-size: 0.7em; opacity: 0.8"> (em breve)</small>
            </h2>
            <v-chip size="small" label color="amber">PILOTO</v-chip>
          </div>
          <p class="lede">
            Descoberta de lances no formato que o público já ama — com oportunidades reais de receita para quadras e
            atletas.
          </p>

          <div class="teaser-grid d-flex flex-row">
            <div>
              <ul class="checklist">
                <li><strong>Descoberta fácil:</strong> lances em formato vertical, deslize para ver mais.</li>
                <li>
                  <strong>Premiação:</strong> poste clipes, seja avaliado, acumule pontos e troque por prêmios com
                  nossos parceiros.
                </li>
                <li><strong>Visibilidade local:</strong> ranking por quadra, eventos e campeonatos.</li>
                <li><strong>Parcerias:</strong> espaço para marcas locais e ações no dia do jogo.</li>
              </ul>

              <!-- <div class="mt-4">
                <router-link to="/contato?tipo=parceria" class="v-btn v-btn--variant-outlined p-1">
                  Quero participar do piloto
                </router-link>
              </div> -->
            </div>

            <div class="">
              <!-- <img
                class="media-img"
                :src="IMAGES.feed"
                alt="Preview do feed vertical de lances"
                loading="lazy"
                decoding="async"
              /> -->
            </div>
          </div>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- SHOWCASE (visual-heavy block) -->
      <ShowCaseSection />

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- STATS STRIP -->
      <section class="stats" aria-label="Nossos números (placeholders)">
        <div class="container stats-inner my-4">
          <div class="stat d-flex flex-column justify-center align-center">
            <span class="num"> <Infinity /> </span><span class="label">Replays</span>
          </div>

          <div class="stat d-flex flex-column justify-center align-center">
            <span class="num"><Infinity /></span><span class="label">Esportes</span>
          </div>

          <div class="stat d-flex flex-column justify-center align-center">
            <span class="num">24/7</span><span class="label">Disponível</span>
          </div>

          <div class="stat d-flex flex-column justify-center align-center">
            <span class="num">Pronto</span><span class="label">para escalar</span>
          </div>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- SECURITY -->
      <section id="security" class="section" aria-labelledby="security-title">
        <div class="container narrow">
          <h2 id="security-title" class="section-title">Segurança e privacidade</h2>
          <ul class="checklist">
            <li>Criptografia TLS em trânsito; Logins com segurança de ponta a ponta.</li>
            <li>URLs de download assinadas e com expiração; controle de acesso por usuário/campo.</li>
            <li>Backups versionados.</li>
            <li>Conformidade com boas práticas de LGPD (minimização, consentimento, retenção).</li>
          </ul>
        </div>
      </section>

      <v-divider :thickness="4" color="success"></v-divider>

      <!-- FAQ -->
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

          <details class="faq-item">
            <summary>Como vai funcionar a premiação?</summary>
            <p class="mt-3">
              Durante o piloto, quadras e atletas parceiros concorrerão a prêmios mensais baseados em engajamento e
              desempenho dos vídeos na plataforma. Acumule pontos no app e troque por prêmios!
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

          <!-- <router-link to="/contato">Agende a sua instalação</router-link>
          <router-link to="/contato?tipo=parceria" class="v-btn v-btn--variant-outlined">
            Seja parceiro do piloto
          </router-link> -->
        </div>
      </section>

      <!-- Back to top button -->
      <span
        class="to-top z-50 d-flex align-center justify-center"
        :class="{ show: showTop }"
        @click="scrollToTop"
        aria-label="Voltar ao topo"
      >
        <ArrowBigUp color="white" />
      </span>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  VideoIcon,
  ClockPlus,
  CloudDownload,
  AppWindow,
  Zap,
  ShieldCheckIcon,
  Infinity,
  ArrowBigUp,
  Target,
  Banknote,
} from "lucide-vue-next";
import HeroSection from "@/components/home-sections/HeroSection.vue";
import HowItWorksSection from "@/components/home-sections/HowItWorksSection.vue";
import ShowCaseSection from "@/components/home-sections/ShowCaseSection.vue";

import LogoGravaNois from "@/assets/icons/grava-nois-branco.webp";
import LogoGravaNoisSimbol from "@/assets/icons/grava-nois-simbol.webp";

const showTop = ref(false);
const showHowDialog = ref(false);
const onScroll = () => {
  showTop.value = window.scrollY > 600;
};
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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

onMounted(() => window.addEventListener("scroll", onScroll));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<style>
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

/* Teaser  */
.teaser-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 1rem 2rem;
  align-items: center;
}
@media (max-width: 960px) {
  .teaser-grid {
    grid-template-columns: 1fr;
  }
}

/* Security */
.checklist {
  margin: 1rem 0 0;
  padding-left: 1.25rem;
  text-align: left;
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
  bottom: 4rem;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: var(--brand);
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
