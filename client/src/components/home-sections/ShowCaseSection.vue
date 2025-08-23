<template>
  <section class="section alt showcase-section" aria-labelledby="showcase-title">
    <div class="container">
      <h2 id="showcase-title" class="section-title">Feito para qualquer quadra, qualquer time</h2>
      <div class="showcase-grid">
        <div class="media-card tall">
          <img class="media-img" :src="IMAGES.soccer" alt="Partida de Futebol" loading="lazy" decoding="async" />
          <div class="media-label">Futebol</div>
        </div>
        <div class="media-card">
          <img class="media-img" :src="IMAGES.volleyball" alt="Quadra de vôlei" loading="lazy" decoding="async" />
          <div class="media-label">Vôlei</div>
        </div>
        <div class="media-card">
          <img class="media-img" :src="IMAGES.basketball" alt="Quadra de basquete" loading="lazy" decoding="async" />
          <div class="media-label">Basquete</div>
        </div>
        <div class="media-card wide">
          <img class="media-img" :src="IMAGES.outdoor" alt="Quadra externa/areia" loading="lazy" decoding="async" />
          <div class="media-label">Areia & quadras externas</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import hero from "@/assets/images/hero-about.webp";
import soccer from "@/assets/images/society-about.webp";
import volleyball from "@/assets/images/volleyball-about.webp";
import basketball from "@/assets/images/basketball-about.webp";
import outdoor from "@/assets/images/futbolley-about.webp";
import feed from "@/assets/images/feed-preview.webp";

const IMAGES = {
  hero: hero,
  soccer: soccer,
  volleyball: volleyball,
  basketball: basketball,
  outdoor: outdoor,
  feed: feed,
};
</script>

<style scoped>
/* Section visuals */
.showcase-section {
  position: relative;
  overflow: hidden;
  /* sutil glow de marca */
  background: radial-gradient(
      900px 300px at 10% -10%,
      color-mix(in srgb, var(--brand) 14%, transparent),
      transparent 60%
    ),
    var(--bg-alt);
}
.section-title {
  position: relative;
}
.section-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.6rem;
  width: 88px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand), color-mix(in srgb, var(--brand) 30%, transparent));
}

/* Grid mobile-first */
.showcase-grid {
  display: grid;
  grid-template-columns: 1fr; /* mobile */
  gap: 0.75rem;
  margin-top: 1.25rem;
}
@media (min-width: 480px) {
  .showcase-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}
@media (min-width: 960px) {
  .showcase-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Cards modernos */
.media-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  background: var(--card);
  border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  box-shadow: 0 16px 40px -24px rgba(0, 0, 0, 0.35);
  isolation: isolate;
  /* proporção consistente em mobile */
  aspect-ratio: 4 / 3;
}
.media-card.tall {
  aspect-ratio: 3 / 4;
}
@media (min-width: 960px) {
  .media-card.wide {
    grid-column: span 2;
  }
}

/* Camadas de efeito */
.media-card::before {
  /* gradiente sutil por cima da imagem para legibilidade */
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.5) 100%);
  z-index: 1;
  pointer-events: none;
}
.media-card::after {
  /* brilho de borda ao hover */
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 60% at 50% 100%, rgba(255, 255, 255, 0.06), transparent 60%);
  opacity: 0;
  transition: opacity 200ms ease;
  z-index: 1;
}

.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.02);
  transition: transform 320ms ease;
}

/* Hover/press states */
.media-card:hover .media-img,
.media-card:focus-within .media-img {
  transform: scale(1.06);
}
.media-card:hover::after,
.media-card:focus-within::after {
  opacity: 1;
}

/* Rótulo em estilo glass */
.media-label {
  position: absolute;
  left: 0.75rem;
  bottom: 0.6rem;
  z-index: 2;
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: color-mix(in srgb, #000 40%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

/* Acessibilidade de movimento */
@media (prefers-reduced-motion: reduce) {
  .media-img {
    transition: none;
  }
  .media-card::after {
    transition: none;
  }
}
</style>
