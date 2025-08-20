<template>
  <section ref="rootEl" class="hero" aria-labelledby="hero-title" :style="{ backgroundImage: `url(${BasketBall})` }">
    <div class="hero__container">
      <!-- Top-centered symbol-only logo -->
      <div class="hero__logo-wrap parallax parallax--logo">
        <img
          class="hero__logo"
          :src="currentIcon"
          alt="Grava Nóis logo"
          width="90"
          height="90"
          decoding="async"
          fetchpriority="high"
        />
      </div>

      <!-- Stack: H1 → subline → CTAs -->
      <div class="hero__grid">
        <div class="hero__content parallax parallax--content">
          <h1 id="hero-title" class="hero__title">Capture epic plays with one tap.</h1>
          <p class="hero__subtitle">Save, share, download instantly.</p>

          <div class="hero__ctas">
            <a href="#how" class="btn btn--primary" role="button" aria-label="See how it works"> See how it works </a>
            <a href="/pricing" class="btn btn--secondary" role="button" aria-label="View pricing"> Pricing </a>
          </div>
        </div>

        <!-- Optional right-side mockup on desktop with crossfade carousel -->
        <div class="hero__mockup parallax parallax--mockup" aria-hidden="true">
          <div class="mockup-fader">
            <img :src="imgA" class="fade-img" :class="{ 'is-visible': showA }" alt="" />
            <img :src="imgB" class="fade-img" :class="{ 'is-visible': !showA }" alt="" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import LogoSymbol from "@/assets/icons/grava-nois-simbol.webp";
import Mockup from "@/assets/images/hero-about.webp";
// import HeroBG from "@/assets/hero_sec_imgs/basket_ball.jpg";
import BasketBall from "@/assets/hero_sec_imgs/basket_ball.png";

// Load all hero secondary images for the carousel (png, jpg, jpeg, webp)
const heroModules = import.meta.glob("@/assets/hero_sec_imgs/*.{png,jpg,jpeg,webp}", { eager: true });
const heroImages = Object.values(heroModules)
  .map((m: any) => (m && m.default) || m)
  .filter(Boolean) as string[];

const logoSrc = LogoSymbol;
const mockupSrc = Mockup;

import { onMounted, onBeforeUnmount, ref } from "vue";

const rootEl = ref<HTMLElement | null>(null);
let raf = 0;
let carouselTimer: number | undefined;

// Background image state (also cycles)
const currentIcon = ref<string>(heroImages[0] ?? (LogoSymbol as unknown as string));

// Crossfade state
const showA = ref(true);
const imgA = ref<string>("");
const imgB = ref<string>("");
const idx = ref(0);

function stepCarousel() {
  if (heroImages.length === 0) return;
  idx.value = (idx.value + 1) % heroImages.length;
  if (showA.value) {
    imgB.value = heroImages[idx.value];
    console.log(heroImages);

    showA.value = false;
  } else {
    imgA.value = heroImages[idx.value];
    showA.value = true;
  }
  currentIcon.value = heroImages[idx.value];
}

function applyPointerVars(x: number, y: number) {
  // Normalize to 0..1 then to -1..1
  const px = x;
  const py = y;
  const mx = (px - 0.5) * 2;
  const my = (py - 0.5) * 2;
  const el = rootEl.value;
  if (!el) return;
  el.style.setProperty("--px", `${(px * 100).toFixed(2)}%`);
  el.style.setProperty("--py", `${(py * 100).toFixed(2)}%`);
  el.style.setProperty("--mx", mx.toFixed(4));
  el.style.setProperty("--my", my.toFixed(4));
}

function handleMove(clientX: number, clientY: number) {
  const el = rootEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => applyPointerVars(x, y));
}

function onPointerMove(ev: PointerEvent) {
  handleMove(ev.clientX, ev.clientY);
}
function onTouchMove(ev: TouchEvent) {
  if (!ev.touches || ev.touches.length === 0) return;
  const t = ev.touches[0];
  handleMove(t.clientX, t.clientY);
}

onMounted(() => {
  const el = rootEl.value;
  if (!el) return;
  // Init to center
  applyPointerVars(0.5, 0.5);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;

  el.addEventListener("pointermove", onPointerMove, { passive: true });
  el.addEventListener("touchmove", onTouchMove, { passive: true });

  // Init carousel
  if (heroImages.length > 0) {
    imgA.value = heroImages[0];
    imgB.value = heroImages[1 % heroImages.length];
    showA.value = true;
    currentIcon.value = heroImages[0];
    // rotate every 3.6s
    carouselTimer = window.setInterval(stepCarousel, 3600);
  }
});

onBeforeUnmount(() => {
  const el = rootEl.value;
  if (!el) return;
  el.removeEventListener("pointermove", onPointerMove as any);
  el.removeEventListener("touchmove", onTouchMove as any);
  if (raf) cancelAnimationFrame(raf);
  if (carouselTimer) window.clearInterval(carouselTimer);
});
</script>

<style scoped>
.hero {
  /* Background image and safe defaults */
  background-color: #0a0a0a;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: var(--hero-ink);
  position: relative;
  overflow: clip;
}

/* Ensure all hero content sits above background effects */
.hero > * {
  position: relative;
  z-index: 1;
}

.hero__container {
  max-width: var(--hero-max-w);
  padding: var(--hero-padding);
  margin: 0 auto;
  display: grid;
  grid-template-rows: auto 1fr;
}

.hero__logo-wrap {
  display: grid;
  place-items: center;
  padding-top: 24px;
  padding-bottom: 12px;
}

.hero__logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  filter: drop-shadow(0 6px 18px rgba(16, 185, 129, 0.2));
  transition: transform 0.25s ease, filter 0.25s ease;
}
.hero__logo:hover {
  transform: translateY(-2px);
  filter: drop-shadow(0 10px 24px rgba(56, 189, 248, 0.25));
}

.hero__grid {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 28px;
}

.hero__content {
  text-align: center;
  margin: 0 auto;
  max-width: 760px;
}

.hero__title {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.1;
  font-size: clamp(var(--hero-title-size-mobile), 3.5vw, var(--hero-title-size-desktop));
}

.hero__subtitle {
  margin: 12px auto 0;
  font-family: var(--font-body);
  font-weight: 450;
  color: var(--hero-muted);
  font-size: 18px;
  max-width: 38ch;
}

.hero__ctas {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}

.btn {
  --btn-ring: rgba(56, 189, 248, 0.45);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 18px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--btn-radius);
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.05s ease;
  outline: none;
}
.btn:active {
  transform: translateY(1px);
}
.btn:focus-visible {
  outline: 3px solid var(--btn-ring);
  outline-offset: 2px;
}

.btn--primary {
  color: #fff;
  background: var(--primary-color);
  border: 1px solid color-mix(in srgb, var(--primary-color) 92%, white 8%);
}
.btn--primary:hover {
  background: color-mix(in srgb, var(--primary-color) 86%, white 14%);
}
.btn--primary:focus-visible {
  outline-color: color-mix(in srgb, var(--primary-light) 60%, white 40%);
}

.btn--secondary {
  color: #e5e7eb;
  background: transparent;
  border: 1px solid #334155;
}
.btn--secondary:hover {
  background: rgba(148, 163, 184, 0.08);
}
.btn--secondary:focus-visible {
  outline-color: rgba(148, 163, 184, 0.55);
}

.hero__mockup {
  display: none;
}
.hero__mockup img {
  display: block;
}
.mockup-fader {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 240px;
}
.fade-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.fade-img.is-visible {
  opacity: 1;
}

@media (min-width: 1024px) {
  .hero__grid {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 36px;
  }
  .hero__content {
    text-align: left;
    margin-left: 0;
  }
  .hero__ctas {
    justify-content: flex-start;
  }
  .hero__mockup {
    display: block;
  }
}

/* Full-viewport height on mobile */
@media (max-width: 1023px) {
  .hero {
    min-height: 100vh;
    min-height: 100svh;
  }
  .hero__container {
    min-height: 100vh;
    min-height: 100svh;
  }
  .hero__grid {
    align-content: center;
    min-height: 100%;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hero__logo {
    transition: none;
  }
  .btn {
    transition: none;
  }
  .hero::before {
    display: none;
  }
}

/* Interactive spotlight that follows pointer */
.hero::before {
  content: "";
  position: absolute;
  inset: -10%;
  pointer-events: none;
  background: radial-gradient(460px 460px at var(--px, 50%) var(--py, 50%), rgba(255, 255, 255, 0.16), transparent 65%);
  opacity: 0.85;
  transition: opacity 0.2s ease;
  z-index: 0;
}

/* Dark layer that reveals the image under the pointer */
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    520px 520px at var(--px, 50%) var(--py, 50%),
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0.55) 62%,
    rgba(0, 0, 0, 0.78) 100%
  );
  z-index: 0;
}

/* Parallax transforms tied to --mx/--my */
.parallax {
  will-change: transform;
}
.parallax--logo {
  transform: translate3d(calc(var(--mx, 0) * 6px), calc(var(--my, 0) * 6px), 0);
}
.parallax--content {
  transform: translate3d(calc(var(--mx, 0) * 4px), calc(var(--my, 0) * 4px), 0);
}
.parallax--mockup {
  transform: translate3d(calc(var(--mx, 0) * -8px), calc(var(--my, 0) * -8px), 0);
}
</style>
