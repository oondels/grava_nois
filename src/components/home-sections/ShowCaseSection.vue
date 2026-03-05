<template>
  <section
    class="relative overflow-hidden bg-[radial-gradient(900px_320px_at_12%_-14%,rgba(4,133,0,0.20),transparent_60%),var(--bg-alt)] py-16 md:py-20 lg:py-24"
    aria-labelledby="showcase-title"
  >
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2
        id="showcase-title"
        class="max-w-3xl text-left text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl lg:text-5xl"
      >
        Feito para qualquer quadra, qualquer time
      </h2>

      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:h-[600px] lg:grid-cols-4 lg:grid-rows-2">
        <article
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--card)] shadow-[0_24px_45px_-24px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_-20px_rgba(0,0,0,0.65)] sm:aspect-[4/3] lg:col-span-1 lg:row-span-2 lg:aspect-auto"
        >
          <img
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            :src="IMAGES.soccer"
            alt="Partida de Futebol"
            loading="lazy"
            decoding="async"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
          <div class="absolute bottom-3 left-3 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-sm font-bold text-white backdrop-blur">
            Futebol
          </div>
        </article>

        <article
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--card)] shadow-[0_24px_45px_-24px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_-20px_rgba(0,0,0,0.65)] sm:aspect-[4/3] lg:col-span-1 lg:row-span-1 lg:aspect-auto"
        >
          <img
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            :src="IMAGES.volleyball"
            alt="Quadra de vôlei"
            loading="lazy"
            decoding="async"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
          <div class="absolute bottom-3 left-3 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-sm font-bold text-white backdrop-blur">
            Vôlei
          </div>
        </article>

        <article
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--card)] shadow-[0_24px_45px_-24px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_-20px_rgba(0,0,0,0.65)] sm:aspect-[4/3] lg:col-span-1 lg:row-span-1 lg:aspect-auto"
        >
          <img
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            :src="IMAGES.basketball"
            alt="Quadra de basquete"
            loading="lazy"
            decoding="async"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
          <div class="absolute bottom-3 left-3 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-sm font-bold text-white backdrop-blur">
            Basquete
          </div>
        </article>

        <article
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--card)] shadow-[0_24px_45px_-24px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_-20px_rgba(0,0,0,0.65)] sm:aspect-[4/3] lg:col-span-2 lg:row-span-1 lg:aspect-auto"
        >
          <img
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            :src="IMAGES.outdoor"
            alt="Quadra externa/areia"
            loading="lazy"
            decoding="async"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>
          <div class="absolute bottom-3 left-3 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-sm font-bold text-white backdrop-blur">
            Areia & quadras externas
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import soccer from "@/assets/images/society-about.webp";
import volleyball from "@/assets/images/volleyball-about.webp";
import basketball from "@/assets/images/basketball-about.webp";
import outdoor from "@/assets/images/futbolley-about.webp";

const IMAGES = {
  soccer,
  volleyball,
  basketball,
  outdoor,
};
</script>
