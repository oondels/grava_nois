<template>
  <section
    ref="rootEl"
    class="hero relative isolate min-h-[88vh] md:min-h-[90vh] lg:min-h-screen"
    aria-labelledby="hero-title"
    :style="heroBgStyle"
  >
    <div class="hero__container mx-auto grid h-full w-full max-w-7xl grid-rows-[auto,1fr] px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <!-- Top-centered symbol-only logo -->
      <div class="hero__logo-wrap parallax parallax--logo grid place-items-center py-4 lg:py-6">
        <img
          class="hero__logo h-[90px] w-[90px] object-contain"
          :src="currentIcon"
          alt="Grava Nóis logo"
          width="90"
          height="90"
          decoding="async"
          fetchpriority="high"
          draggable="false"
        />
      </div>

      <!-- Stack: H1 → subline → CTAs -->
      <div class="hero__grid grid items-center gap-8 lg:mx-auto lg:w-full lg:max-w-6xl lg:grid-cols-1 lg:justify-items-center lg:gap-12 xl:relative">
        <div
          class="hero__content parallax parallax--content relative mx-auto max-w-2xl text-center lg:max-w-3xl"
          @keydown="onKeyNav"
          tabindex="0"
          aria-describedby="hero-desc"
        >
          <h1
            id="hero-title"
            class="hero__title text-4xl font-black leading-[0.92] tracking-tight text-amber-100 sm:text-5xl lg:text-7xl"
          >
            Grave seus melhores lances esportivos
            <span class="mt-1 block text-amber-300">Com um clique!</span>
          </h1>
          <p id="hero-desc" class="hero__subtitle mt-6 text-base text-slate-100/85 sm:text-lg lg:text-xl">
            Grava Nóis - Seu lance, nossa história.
          </p>

          <span class="my-7 flex items-center justify-center">
            <a href="#how" class="pulse-waves" aria-label="Veja como funciona">
              <ChevronsDown role="button" class="my-2 h-6 w-6" :size="28" />
            </a>
          </span>

          <div class="hero__ctas mt-5 flex flex-wrap justify-center gap-3">
            <a
              href="#how"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/70 bg-emerald-700/95 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
              role="button"
              aria-label="See how it works"
            >
              <ChevronsDown class="my-2 h-4 w-4" /> Veja como funciona
            </a>

            <RouterLink
              :to="auth.isAuthenticated ? '/lances-gravanois' : '/login'"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              role="button"
              aria-label="View pricing"
            >
              <span class="flex items-center justify-center" v-if="auth.isAuthenticated">
                <ClapperboardIcon class="mr-2 h-4 w-4" />
                Meus lances
              </span>

              <span class="flex items-center justify-center" v-else>
                <LogIn class="mr-2 h-4 w-4" />
                Entrar
              </span>
            </RouterLink>
            <!-- <a href="/pricing" class="btn btn--primary" role="button" aria-label="View pricing"> Contrate </a> -->
          </div>
        </div>

        <!-- Optional right-side mockup on desktop with crossfade carousel -->
        <div
          class="hero__mockup parallax parallax--mockup relative hidden xl:absolute xl:right-0 xl:top-1/2 xl:block xl:w-[44%] xl:max-w-[620px] xl:-translate-y-1/2"
          aria-hidden="true"
        >
          <div class="mockup-fader relative h-[430px] overflow-hidden rounded-3xl border border-white/15 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)]">
            <img
              :src="imgA"
              class="fade-img h-full w-full object-cover"
              :class="{ 'is-visible': showA }"
              alt=""
              loading="eager"
              decoding="async"
              width="1280"
              height="800"
            />
            <img
              :src="imgB"
              class="fade-img h-full w-full object-cover"
              :class="{ 'is-visible': !showA }"
              alt=""
              loading="lazy"
              decoding="async"
              width="1280"
              height="800"
            />
          </div>
          <div class="pointer-events-none absolute -bottom-4 -left-4 h-28 w-28 rounded-full bg-emerald-400/20 blur-2xl"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/store/auth";
import LogoSymbol from "@/assets/icons/grava-nois-simbol.webp";
import Mockup from "@/assets/images/hero-about.webp";

import HeroBgDesktopWebp from "@/assets/bak/HeroBG-1280.webp";
import HeroBgDesktopAvif from "@/assets/bak/HeroBG-1280.avif";
import HeroBgMobileWebp from "@/assets/bak/HeroBG-768.webp";
import HeroBgMobileAvif from "@/assets/bak/HeroBG-768.avif";
// import BasketBall from "@/assets/bak/basket_ball.png";
// import VolleyBall from "@/assets/bak/volleysvg.svg";

const auth = useAuthStore();

import { ChevronsDown, ClapperboardIcon, LogIn } from "lucide-vue-next";

import { onMounted, onBeforeUnmount, ref } from "vue";

// Load all hero secondary images for the carousel (png, jpg, jpeg, webp)
const heroModules = import.meta.glob("@/assets/hero_sec_imgs/*.{png,jpg,jpeg,webp}", { eager: true });
const heroImages = Object.values(heroModules)
  .map((m: any) => (m && m.default) || m)
  .filter(Boolean) as string[];

// Fallbacks explícitos para assets (mantidos para tree-shaking ameno)
const logoSrc = LogoSymbol;
const mockupSrc = Mockup;

const rootEl = ref<HTMLElement | null>(null);
const heroBgStyle = ref<Record<string, string>>({});
let raf = 0; // reservado para futuras animações auxiliares (mantido para contagem)
let carouselTimer: number | undefined;
let animRaf = 0;
let io: IntersectionObserver | null = null;
let isHeroVisible = true;

// Ícone atual do topo
const currentIcon = ref<string>((heroImages[0] as string) || (logoSrc as unknown as string));

// Crossfade state
const showA = ref(true);
const imgA = ref<string>("");
const imgB = ref<string>("");
const idx = ref(0);

// Interaction state for mobile-first motion
let hintTimer: number | undefined;
const isInteracting = ref(false);
const useGyro = ref(false);

// Scroll resistance state
const SCROLL_THRESHOLD = 42; // px drag before native scroll
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
const DAMPING_FACTOR_WHEEL = 0.32;
const DAMPING_FACTOR_TOUCH = 0.4;
const DAMP_ZONE_EXTRA_PX = 60;
const ALLOW_UPWARD_DAMP = true;
let reduceMotionPref = false;
let lastTouchYForDamp: number | null = null;
let touchStartListenerDamp: ((e: TouchEvent) => void) | null = null;
let touchMoveListenerDamp: ((e: TouchEvent) => void) | null = null;

function pickHeroBackground(format: "avif" | "webp") {
  const isMobile = window.matchMedia("(max-width: 960px)").matches;
  if (format === "avif") return isMobile ? HeroBgMobileAvif : HeroBgDesktopAvif;
  return isMobile ? HeroBgMobileWebp : HeroBgDesktopWebp;
}

function applyHeroBackground(src: string) {
  heroBgStyle.value = {
    backgroundImage: `url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

// Zona de damping ativa somente quando a hero está on-screen
function inDampZone() {
  const el = rootEl.value;
  if (!el) return false;
  if (!isHeroVisible) return false;
  const y = window.scrollY || window.pageYOffset || 0;
  return y >= el.offsetTop && y <= el.offsetTop + el.offsetHeight + DAMP_ZONE_EXTRA_PX;
}

function applyDampedScroll(dy: number, factor: number) {
  window.scrollTo(0, (window.scrollY || window.pageYOffset || 0) + dy * factor);
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

// Carrossel com pausa automática quando fora de viewport
function startCarousel() {
  stopCarousel();
  if (heroImages.length === 0) return;
  carouselTimer = window.setInterval(stepCarousel, 5200);
}
function stopCarousel() {
  if (carouselTimer) {
    window.clearInterval(carouselTimer);
    carouselTimer = undefined;
  }
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

// Aplica variáveis CSS do spotlight
function applyPointerVars(x: number, y: number) {
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

// Normaliza movimento para 0..1 e ativa inércia
function handleMove(clientX: number, clientY: number) {
  const el = rootEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;
  const cx = Math.max(0, Math.min(1, x));
  const cy = Math.max(0, Math.min(1, y));
  vx = cx - posX.value;
  vy = cy - posY.value;
  targetX = cx;
  targetY = cy;
  startAnim();
}

// Suporte teclado para acessibilidade e usabilidade em desktop
function onKeyNav(ev: KeyboardEvent) {
  const step = 0.06;
  let used = true;
  switch (ev.key) {
    case "ArrowLeft":
    case "a":
    case "A":
      targetX = Math.max(0, targetX - step);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      targetX = Math.min(1, targetX + step);
      break;
    case "ArrowUp":
    case "w":
    case "W":
      targetY = Math.max(0, targetY - step);
      break;
    case "ArrowDown":
    case "s":
    case "S":
      targetY = Math.min(1, targetY + step);
      break;
    case "Home":
      targetX = 0.5;
      targetY = 0.5;
      break;
    default:
      used = false;
  }
  if (used) {
    ev.preventDefault();
    startAnim();
  }
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

function onPointerDown(e?: PointerEvent) {
  isInteracting.value = true;
  const el = rootEl.value;
  if (el) {
    el.classList.add("is-interacting");
  }
  if (e && (e.target as Element)?.setPointerCapture) {
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {}
  }
  enableGyro();
}

function onPointerUp(e?: PointerEvent) {
  isInteracting.value = false;
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
  scrollGuardActive = true;
  touchStartY = null;
  if (e && (e.target as Element)?.releasePointerCapture) {
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
  }
}

// Loop de animação com easing + inércia
function startAnim() {
  if (animRaf) return;
  const loop = () => {
    const ease = 0.22;
    posX.value += (targetX - posX.value) * ease + vx * 0.06;
    posY.value += (targetY - posY.value) * ease + vy * 0.06;
    vx *= 0.9;
    vy *= 0.9;
    posX.value = Math.max(0, Math.min(1, posX.value));
    posY.value = Math.max(0, Math.min(1, posY.value));
    applyPointerVars(posX.value, posY.value);
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

// Gyro/tilt support
function deviceToTarget(beta: number, gamma: number) {
  const nx = Math.max(-0.38, Math.min(0.38, (gamma || 0) / 48));
  const ny = Math.max(-0.38, Math.min(0.38, -(beta || 0) / 72));
  targetX = 0.5 + nx;
  targetY = 0.5 + ny;
  startAnim();
}

let orientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;

async function enableGyro() {
  try {
    // iOS 13+: requestPermission se existir
    const hasDOE = typeof window !== "undefined" && typeof DeviceOrientationEvent !== "undefined";
    const canRequest = hasDOE && typeof (DeviceOrientationEvent as any).requestPermission === "function";

    if (canRequest) {
      const perm = await (DeviceOrientationEvent as any).requestPermission();
      if (perm !== "granted") return;
    }
    if (!orientationHandler) {
      orientationHandler = (e: DeviceOrientationEvent) => deviceToTarget(e.beta ?? 0, e.gamma ?? 0);
    }
    window.addEventListener("deviceorientation", orientationHandler, { passive: true });
    useGyro.value = true;
  } catch {
    // Silencioso por compatibilidade
  }
}

// Observa visibilidade da hero para pausar carrossel e damping quando fora de vista
function observeVisibility() {
  const el = rootEl.value;
  if (!el || typeof IntersectionObserver === "undefined") return;
  io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      isHeroVisible = !!entry?.isIntersecting;
      if (isHeroVisible) startCarousel();
      else stopCarousel();
    },
    { root: null, threshold: 0.25 }
  );
  io.observe(el);
}

// Mounted
// onMounted(() => {
//   const el = rootEl.value;
//   if (!el) return;

//   // Init center
//   applyPointerVars(0.5, 0.5);
//   posX.value = 0.5;
//   posY.value = 0.5;
//   targetX = 0.5;
//   targetY = 0.5;

//   // Respeito a prefers-reduced-motion
//   const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
//   reduceMotionPref = !!reduce.matches;

//   // Listeners de interação
//   el.addEventListener("pointerdown", onPointerDown as any, { passive: true });
//   el.addEventListener("pointerup", onPointerUp as any, { passive: true });
//   el.addEventListener("pointercancel", onPointerUp as any, { passive: true });
//   el.addEventListener("pointermove", onPointerMove, { passive: true });
//   el.addEventListener("keydown", onKeyNav as any, { passive: false });

//   // touch handlers (não passive para resistência)
//   el.addEventListener("touchstart", onTouchStart, { passive: false });
//   el.addEventListener("touchmove", onTouchMove, { passive: false });

//   // Scroll damping (wheel/touch)
//   el.addEventListener("wheel", wheelHandler, { passive: false } as AddEventListenerOptions);
//   touchStartListenerDamp = (evt: TouchEvent) => {
//     if (evt.touches && evt.touches[0]) onTouchStartDamp(evt.touches[0]);
//   };
//   touchMoveListenerDamp = (evt: TouchEvent) => {
//     if (evt.touches && evt.touches[0]) onTouchMoveDamp(evt.touches[0], evt);
//   };
//   el.addEventListener("touchstart", touchStartListenerDamp, { passive: true });
//   el.addEventListener("touchmove", touchMoveListenerDamp, { passive: false });

//   // Tenta habilitar gyro sem permissão explícita (Android/Chrome)
//   try {
//     const testHandler = (e: DeviceOrientationEvent) => {
//       if ((e.beta ?? 0) !== 0 || (e.gamma ?? 0) !== 0) {
//         deviceToTarget(e.beta ?? 0, e.gamma ?? 0);
//         useGyro.value = true;
//         window.removeEventListener("deviceorientation", testHandler as any);
//       }
//     };
//     window.addEventListener("deviceorientation", testHandler as any, { passive: true, once: true } as any);
//   } catch {}

//   // Init carousel + preload
//   if (heroImages.length > 0) {
//     imgA.value = heroImages[0];
//     imgB.value = heroImages[1 % heroImages.length] || heroImages[0];
//     showA.value = true;
//     currentIcon.value = heroImages[0] || logoSrc;
//     preloadImages(heroImages);
//   } else {
//     imgA.value = mockupSrc as unknown as string;
//     imgB.value = mockupSrc as unknown as string;
//     currentIcon.value = logoSrc as unknown as string;
//   }
//   startCarousel();

//   // Auto-hide hint
//   hideHintSoon();

//   // Observer de visibilidade
//   observeVisibility();
// });

// Cleanup
onBeforeUnmount(() => {
  const el = rootEl.value;
  if (el) {
    el.removeEventListener("pointerdown", onPointerDown as any);
    el.removeEventListener("pointerup", onPointerUp as any);
    el.removeEventListener("pointercancel", onPointerUp as any);
    el.removeEventListener("pointermove", onPointerMove as any);
    el.removeEventListener("keydown", onKeyNav as any);
    el.removeEventListener("touchstart", onTouchStart as any);
    el.removeEventListener("touchmove", onTouchMove as any);
    el.removeEventListener("wheel", wheelHandler as any);
    if (touchStartListenerDamp) el.removeEventListener("touchstart", touchStartListenerDamp as any);
    if (touchMoveListenerDamp) el.removeEventListener("touchmove", touchMoveListenerDamp as any);
  }
  if (raf) cancelAnimationFrame(raf);
  if (carouselTimer) window.clearInterval(carouselTimer);
  if (animRaf) cancelAnimationFrame(animRaf);
  if (hintTimer) window.clearTimeout(hintTimer);
  if (orientationHandler) window.removeEventListener("deviceorientation", orientationHandler as any);
  if (io) io.disconnect();
});

// Carrega o background pesado da hero de forma deferida para evitar bloquear render
onMounted(() => {
  applyPointerVars(0.5, 0.5);
  posX.value = 0.5;
  posY.value = 0.5;
  targetX = 0.5;
  targetY = 0.5;

  if (heroImages.length > 0) {
    imgA.value = heroImages[0];
    imgB.value = heroImages[1 % heroImages.length] || heroImages[0];
    showA.value = true;
    currentIcon.value = heroImages[0] || logoSrc;
  } else {
    imgA.value = mockupSrc as unknown as string;
    imgB.value = mockupSrc as unknown as string;
    currentIcon.value = logoSrc as unknown as string;
  }
  startCarousel();
  observeVisibility();

  const avifBackground = pickHeroBackground("avif");
  const webpBackground = pickHeroBackground("webp");

  try {
    const img = new Image();
    // sinaliza ao navegador que não é prioridade máxima
    ;(img as any).fetchPriority = "low";
    img.decoding = "async";
    img.src = avifBackground;
    img.onload = () => {
      applyHeroBackground(avifBackground);
    };
    // Fallback para browsers sem suporte a AVIF.
    img.onerror = () => {
      applyHeroBackground(webpBackground);
    };
  } catch {
    applyHeroBackground(webpBackground);
  }
});
</script>

<style scoped>
.hero {
  background-color: #0a0a0a;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: var(--hero-ink);
  position: relative;
  overflow: clip;
  touch-action: pan-y;
  overscroll-behavior: contain;
  content-visibility: auto;
  contain: layout paint style;
}

.hero > * {
  position: relative;
  z-index: 1;
}

.hero__logo {
  filter: drop-shadow(0 6px 18px rgba(16, 185, 129, 0.2));
  transition: transform 0.25s ease, filter 0.25s ease;
  user-select: none;
}
.hero__logo:hover {
  transform: translateY(-2px);
  filter: drop-shadow(0 10px 24px rgba(56, 189, 248, 0.25));
}

.hero__content::before {
  content: "";
  position: absolute;
  left: -10px;
  right: -10px;
  top: calc(50% - 26px);
  bottom: calc(50% - 26px);
  border-radius: 14px;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.16);
  filter: blur(4px);
  -webkit-filter: blur(4px);
  backdrop-filter: blur(0.5px);
  -webkit-backdrop-filter: blur(0.5px);
  z-index: -1;
}

.hero__title {
  margin: 0;
  font-family: "Bebas Neue", var(--font-heading);
  letter-spacing: -0.01em;
}

.hero__subtitle {
  font-family: var(--font-body);
}

.pulse-waves {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  transition: background 0.2s ease, transform 0.2s ease;
  overflow: visible;
}
.pulse-waves:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}
.pulse-waves:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.45);
  outline-offset: 4px;
}
.pulse-waves::before,
.pulse-waves::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.65);
  transform: scale(0.7);
  opacity: 0.6;
  pointer-events: none;
  animation: pulse-ring 2.3s ease-out infinite;
}
.pulse-waves::after {
  animation-delay: 0.9s;
}
@keyframes pulse-ring {
  0% {
    transform: scale(0.7);
    opacity: 0.6;
  }
  70% {
    opacity: 0.18;
  }
  100% {
    transform: scale(2.0);
    opacity: 0;
  }
}

.mockup-fader {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}
.fade-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease;
  will-change: opacity;
}
.fade-img.is-visible {
  opacity: 1;
}

@media (min-width: 1024px) {
  .hero__content::before {
    left: -14px;
    right: -14px;
    top: calc(50% - 30px);
    bottom: calc(50% - 30px);
    border-radius: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__logo,
  .fade-img {
    transition: none;
  }
  .hero::before,
  .hero::after {
    display: none;
  }
  .pulse-waves::before,
  .pulse-waves::after {
    animation: none;
  }
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: inherit;
  background-size: inherit;
  background-position: inherit;
  background-repeat: inherit;
  filter: blur(6px);
  transform: scale(1.03);
  z-index: 0;
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.38);
  z-index: 0;
}

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

@media (max-width: 1023px) {
  .hero {
    --spot-w: 600px;
    --spot-h: 600px;
  }
}
</style>
