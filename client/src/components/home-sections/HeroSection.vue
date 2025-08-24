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
          <h1 id="hero-title" class="hero__title">Grave seus melhores lances esportivos com um clique</h1>
          <p class="hero__subtitle">Grava Nóis - Seu lance, nossa história.</p>

          <span class="d-flex justify-center align-center">
            <a href="#how">
              <ChevronsDown role="button" class="my-2" :size="28" />
            </a>
          </span>

          <div class="hero__ctas">
            <a href="#how" class="btn btn--primary" role="button" aria-label="See how it works"> Veja como funciona </a>
            <a href="/pricing" class="btn btn--secondary" role="button" aria-label="View pricing"> Contrate </a>
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

      <!-- Mobile hint overlay -->
      <div v-if="showHint" class="hero__hint" role="status">
        <span class="hero__hint-dot" aria-hidden="true"></span>
        <span class="hero__hint-text">Arraste ou incline o celular</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import LogoSymbol from "@/assets/icons/grava-nois-simbol.webp";
import Mockup from "@/assets/images/hero-about.webp";
import HeroBG from "@/assets/images/soccer_bg.jpg";
import BasketBall from "@/assets/bak/basket_ball.png";
import { ChevronsDown } from "lucide-vue-next";

// Load all hero secondary images for the carousel (png, jpg, jpeg, webp)
const heroModules = import.meta.glob("@/assets/hero_sec_imgs/*.{png,jpg,jpeg,webp}", { eager: true });
const heroImages = Object.values(heroModules)
  .map((m: any) => (m && (m as any).default) || m)
  .filter(Boolean) as string[];

const logoSrc = LogoSymbol;
const mockupSrc = Mockup;

import { onMounted, onBeforeUnmount, ref } from "vue";

const rootEl = ref<HTMLElement | null>(null);
let raf = 0;
let carouselTimer: number | undefined;
let animRaf = 0;

// Background image state (also cycles)
const currentIcon = ref<string>(heroImages[0] ?? (LogoSymbol as unknown as string));

// Crossfade state
const showA = ref(true);
const imgA = ref<string>("");
const imgB = ref<string>("");
const idx = ref(0);

// Interaction state for mobile-first motion
const showHint = ref(true);
let hintTimer: number | undefined;
const isInteracting = ref(false);
const useGyro = ref(false);
// Scroll resistance state
const SCROLL_THRESHOLD = 42; // px drag before native scroll takes over
let touchStartY: number | null = null;
let scrollGuardActive = true;
// Smoothed position (0..1) and target for easing/inertia
const posX = ref(0.5);
const posY = ref(0.5);
let targetX = 0.5;
let targetY = 0.5;
let vx = 0;
let vy = 0;

// --- Scroll damping contínuo (sem jump) na Hero ---
// Ajuste os fatores para calibrar o "peso" da rolagem
const DAMPING_FACTOR_WHEEL = 0.32;
const DAMPING_FACTOR_TOUCH = 0.4;
const DAMP_ZONE_EXTRA_PX = 60;
const ALLOW_UPWARD_DAMP = true;
let reduceMotionPref = false;
let lastTouchYForDamp: number | null = null;
let touchStartListenerDamp: ((e: TouchEvent) => void) | null = null;
let touchMoveListenerDamp: ((e: TouchEvent) => void) | null = null;

function inDampZone() {
  const el = rootEl.value;
  if (!el) return false;
  const y = window.scrollY || window.pageYOffset;
  return y >= el.offsetTop && y <= el.offsetTop + el.offsetHeight + DAMP_ZONE_EXTRA_PX;
}

function applyDampedScroll(dy: number, factor: number) {
  window.scrollTo(0, (window.scrollY || 0) + dy * factor);
}

function wheelHandler(e: WheelEvent) {
  if (reduceMotionPref || !inDampZone()) return;
  e.preventDefault();
  const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
  applyDampedScroll(d, DAMPING_FACTOR_WHEEL);
}

function onTouchStartDamp(t: Touch) {
  lastTouchYForDamp = t.clientY;
}
function onTouchMoveDamp(t: Touch, e: TouchEvent) {
  if (!inDampZone() || lastTouchYForDamp == null) return;
  const dy = lastTouchYForDamp - t.clientY;
  const up = dy < 0;
  if (!ALLOW_UPWARD_DAMP && up) {
    lastTouchYForDamp = t.clientY;
    return;
  }
  e.preventDefault();
  applyDampedScroll(dy, DAMPING_FACTOR_TOUCH);
  lastTouchYForDamp = t.clientY;
}

function stepCarousel() {
  if (heroImages.length === 0) return;
  idx.value = (idx.value + 1) % heroImages.length;
  if (showA.value) {
    imgB.value = heroImages[idx.value];
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
  // Clamp and update target with velocity for inertia
  const cx = Math.max(0, Math.min(1, x));
  const cy = Math.max(0, Math.min(1, y));
  vx = cx - posX.value;
  vy = cy - posY.value;
  targetX = cx;
  targetY = cy;
  startAnim();
}

function onPointerMove(ev: PointerEvent) {
  handleMove(ev.clientX, ev.clientY);
}
function onTouchStart(ev: TouchEvent) {
  const t = ev.touches && ev.touches[0];
  if (!t) return;
  touchStartY = t.clientY;
  scrollGuardActive = true;
}
function onTouchMove(ev: TouchEvent) {
  if (!ev.touches || ev.touches.length === 0) return;
  const t = ev.touches[0];
  // Resist small drags to keep user on hero a bit longer
  if (touchStartY != null && scrollGuardActive) {
    const dy = Math.abs(t.clientY - touchStartY);
    if (dy < SCROLL_THRESHOLD) {
      try {
        ev.preventDefault();
      } catch {}
    } else {
      scrollGuardActive = false;
    }
  }
  handleMove(t.clientX, t.clientY);
}

function onPointerDown() {
  isInteracting.value = true;
  hideHintSoon(0);
  const el = rootEl.value;
  if (el) el.classList.add("is-interacting");
  // Try to enable gyro on first interaction (iOS permission)
  enableGyro();
}
function onPointerUp() {
  // Let inertia decay and then recenter slowly
  isInteracting.value = false;
  // Nudge target to current to start smooth decay
  targetX = posX.value + vx;
  targetY = posY.value + vy;
  window.setTimeout(() => {
    if (!isInteracting.value) {
      targetX = 0.5;
      targetY = 0.5;
    }
  }, 900);
  const el = rootEl.value;
  if (el) el.classList.remove("is-interacting");
  // Reset scroll guard for next gesture
  scrollGuardActive = true;
  touchStartY = null;
}

function startAnim() {
  if (animRaf) return;
  const loop = () => {
    // Easing toward target plus simple velocity decay (slightly snappier)
    const ease = 0.22;
    posX.value += (targetX - posX.value) * ease + vx * 0.06;
    posY.value += (targetY - posY.value) * ease + vy * 0.06;
    vx *= 0.9;
    vy *= 0.9;
    // Clamp
    posX.value = Math.max(0, Math.min(1, posX.value));
    posY.value = Math.max(0, Math.min(1, posY.value));
    applyPointerVars(posX.value, posY.value);

    // Continue while moving noticeably
    if (
      Math.abs(targetX - posX.value) > 0.0005 ||
      Math.abs(targetY - posY.value) > 0.0005 ||
      Math.abs(vx) > 0.0005 ||
      Math.abs(vy) > 0.0005
    ) {
      animRaf = requestAnimationFrame(loop);
    } else {
      animRaf = 0;
    }
  };
  animRaf = requestAnimationFrame(loop);
}

function hideHintSoon(delay = 3200) {
  if (hintTimer) window.clearTimeout(hintTimer);
  hintTimer = window.setTimeout(() => (showHint.value = false), delay);
}

// Gyro/tilt support (mobile-first)
function deviceToTarget(beta: number, gamma: number) {
  // beta: front-back tilt (-180..180), gamma: left-right tilt (-90..90)
  // Slightly higher sensitivity for mobile immersion, clamp to ~0.38 range
  const nx = Math.max(-0.38, Math.min(0.38, (gamma || 0) / 48));
  const ny = Math.max(-0.38, Math.min(0.38, -(beta || 0) / 72));
  targetX = 0.5 + nx;
  targetY = 0.5 + ny;
  startAnim();
}

let orientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;
async function enableGyro() {
  try {
    // iOS permission flow
    // @ts-ignore
    if (
      typeof DeviceOrientationEvent !== "undefined"
      // typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      // @ts-ignore
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== "granted") return;
    }
    if (!orientationHandler) {
      orientationHandler = (e: DeviceOrientationEvent) => deviceToTarget(e.beta ?? 0, e.gamma ?? 0);
    }
    window.addEventListener("deviceorientation", orientationHandler, { passive: true });
    useGyro.value = true;
    hideHintSoon(1200);
  } catch {}
}

onMounted(() => {
  const el = rootEl.value;
  if (!el) return;
  // Init to center
  applyPointerVars(0.5, 0.5);
  posX.value = 0.5;
  posY.value = 0.5;
  targetX = 0.5;
  targetY = 0.5;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;

  el.addEventListener("pointerdown", onPointerDown, { passive: true });
  el.addEventListener("pointerup", onPointerUp, { passive: true });
  el.addEventListener("pointercancel", onPointerUp as any, { passive: true });
  el.addEventListener("pointermove", onPointerMove, { passive: true });
  // touch handlers (not passive to allow resistance)
  el.addEventListener("touchstart", onTouchStart, { passive: false });
  el.addEventListener("touchmove", onTouchMove, { passive: false });

  // Scroll damping (wheel/touch) — sem jump automático
  reduceMotionPref = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.addEventListener("wheel", wheelHandler, { passive: false } as AddEventListenerOptions);
  touchStartListenerDamp = (evt: TouchEvent) => {
    if (evt.touches && evt.touches[0]) onTouchStartDamp(evt.touches[0]);
  };
  touchMoveListenerDamp = (evt: TouchEvent) => {
    if (evt.touches && evt.touches[0]) onTouchMoveDamp(evt.touches[0], evt);
  };
  el.addEventListener("touchstart", touchStartListenerDamp, { passive: true });
  el.addEventListener("touchmove", touchMoveListenerDamp, { passive: false });

  // Attempt enabling gyro if allowed without permission (Android/Chrome)
  try {
    // Some browsers fire orientation without explicit permission
    const testHandler = (e: DeviceOrientationEvent) => {
      if ((e.beta ?? 0) !== 0 || (e.gamma ?? 0) !== 0) {
        deviceToTarget(e.beta ?? 0, e.gamma ?? 0);
        useGyro.value = true;
        window.removeEventListener("deviceorientation", testHandler as any);
      }
    };
    window.addEventListener("deviceorientation", testHandler as any, { passive: true, once: true } as any);
  } catch {}

  // Init carousel
  if (heroImages.length > 0) {
    imgA.value = heroImages[0];
    imgB.value = heroImages[1 % heroImages.length];
    showA.value = true;
    currentIcon.value = heroImages[0];
    // rotate slightly slower to favor interaction
    carouselTimer = window.setInterval(stepCarousel, 5200);
  }

  // Auto-hide hint after a while
  hideHintSoon();
});

onBeforeUnmount(() => {
  const el = rootEl.value;
  if (!el) return;
  el.removeEventListener("pointerdown", onPointerDown as any);
  el.removeEventListener("pointerup", onPointerUp as any);
  el.removeEventListener("pointercancel", onPointerUp as any);
  el.removeEventListener("pointermove", onPointerMove as any);
  el.removeEventListener("touchstart", onTouchStart as any);
  el.removeEventListener("touchmove", onTouchMove as any);
  el.removeEventListener("wheel", wheelHandler as any);
  if (touchStartListenerDamp) el.removeEventListener("touchstart", touchStartListenerDamp as any);
  if (touchMoveListenerDamp) el.removeEventListener("touchmove", touchMoveListenerDamp as any);
  if (raf) cancelAnimationFrame(raf);
  if (carouselTimer) window.clearInterval(carouselTimer);
  if (animRaf) cancelAnimationFrame(animRaf);
  if (hintTimer) window.clearTimeout(hintTimer);
  if (orientationHandler) window.removeEventListener("deviceorientation", orientationHandler as any);
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
  /* Prefer vertical scroll generally, but contain overscroll and allow toggling during interaction */
  touch-action: pan-y;
  overscroll-behavior: contain;
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
  /* Slightly larger on mobile via css variable fallback */
  background: radial-gradient(
    var(--spot-w, 520px) var(--spot-h, 520px) at var(--px, 50%) var(--py, 50%),
    rgba(255, 255, 255, 0.16),
    transparent 65%
  );
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

/* Hint styles (mobile only) */
.hero__hint {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.55);
  color: #e5e7eb;
  font-size: 13px;
  line-height: 1;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.hero__hint-dot {
  width: 6px;
  height: 6px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
  animation: pulse 1.8s ease-out infinite;
}
.hero__hint-text {
  letter-spacing: 0.01em;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(52, 211, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
  }
}

@media (max-width: 1023px) {
  .hero {
    /* Larger spotlight on mobile */
    --spot-w: 600px;
    --spot-h: 600px;
  }
}
</style>
