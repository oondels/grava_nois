<template>
  <div class="w-full overflow-hidden py-6 select-none">
    <h1 class="section-title mb-5">Patrocinadores e Apoiadores</h1>

    <div
      class="relative w-full overflow-hidden rounded-xl px-6 py-4 backdrop-blur-sm ring-1 bg-[#556b2f]/40 ring-[#556b2f]/30"
    >
      <div class="marquee-container">
        <div
          class="marquee flex items-center gap-12"
          :class="{ 'is-paused': dialogOpen }"
          style="--marquee-duration: 30s"
        >
          <ul class="flex items-center gap-12 shrink-0">
            <li
              v-for="(sponsor, i) in sponsors"
              :key="`a-${sponsor.id}`"
              class="h-12 w-max opacity-90 hover:opacity-100 transition cursor-pointer"
              role="button"
              tabindex="0"
              @click="openSponsor(sponsor)"
              @keyup.enter="openSponsor(sponsor)"
            >
              <img
                :src="sponsor.logoUrl"
                :alt="`Patrocinador: ${sponsor.name}`"
                class="h-12 w-auto object-contain"
                draggable="false"
              />
            </li>
          </ul>

          <ul class="flex items-center gap-12 shrink-0" aria-hidden="true">
            <li
              v-for="(sponsor, i) in sponsors"
              :key="`b-${sponsor.id}`"
              class="h-12 w-max opacity-90 hover:opacity-100 transition cursor-pointer"
              role="button"
              tabindex="0"
              @click="openSponsor(sponsor)"
              @keyup.enter="openSponsor(sponsor)"
            >
              <img :src="sponsor.logoUrl" alt="" class="h-12 w-auto object-contain" draggable="false" />
            </li>
          </ul>
        </div>
      </div>
    </div>

    <v-dialog v-model="dialogOpen" max-width="720">
      <v-card class="rounded-xl" elevation="12">
        <v-card-title class="text-h6">
          {{ selectedSponsor?.name || "Patrocinador" }}
        </v-card-title>
        <v-card-text>
          <div class="w-full flex items-center justify-center py-6">
            <v-img
              v-if="selectedSponsor"
              :src="selectedSponsor?.logoUrl"
              :alt="selectedSponsor?.name"
              max-height="160"
              max-width="420"
              contain
            />
          </div>

          <div class="mt-2">
            <div class="text-subtitle-2 mb-1">Descrição</div>
            <div v-if="selectedSponsor?.description && selectedSponsor.description.length" class="text-body-2">
              {{ selectedSponsor.description }}
            </div>
            <v-skeleton-loader v-else type="text@2" class="my-2" />
          </div>

          <div class="mt-4 flex items-center gap-2">
            <v-btn
              v-if="selectedSponsor?.website"
              :href="normalizeUrl(selectedSponsor.website)"
              target="_blank"
              color="primary"
              variant="tonal"
              :prepend-icon="customIcons.web"
              size="small"
            >
              <template #prepend>
                <Globe :size="16" />
              </template>
              Site oficial
            </v-btn>
            <v-btn v-else disabled variant="tonal" :prepend-icon="customIcons.web" size="small">Site em breve</v-btn>
          </div>

          <!-- TODO: COrrigir erro ao exibir redes dos patrocinadores -->
          <!-- <div v-if="selectedSponsor?.socials" class="mt-3 flex items-center flex-wrap gap-2">
            <v-btn
              v-for="soc in socialList"
              :key="soc.key"
              :icon="true"
              :disabled="!selectedSponsor || !selectedSponsor.socials?.[soc.key]"
              :href="selectedSponsor && selectedSponsor.socials?.[soc.key] ? normalizeUrl(selectedSponsor.socials[soc.key]!) : undefined"
              target="_blank"
              variant="text"
              color="primary"
              :aria-label="soc.label"
            >
              <component :is="soc.icon" :size="20" />
            </v-btn>
          </div>

          <v-divider class="my-4" /> -->

          <div>
            <div class="text-subtitle-2 mb-2">Serviços</div>
            <div
              v-if="selectedSponsor?.services && selectedSponsor.services.length"
              class="flex items-center flex-wrap gap-2"
            >
              <v-chip
                v-for="(srv, idx) in selectedSponsor.services"
                :key="`srv-${idx}`"
                size="small"
                color="secondary"
                variant="tonal"
                class="mb-1"
              >
                {{ srv }}
              </v-chip>
            </div>
            <div v-else class="text-body-2 text-medium-emphasis">Serviços em breve</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { sponsorOverrides, type SponsorOverride } from "@/data/patrocinadores";
import { Globe } from "lucide-vue-next";

type Socials = {
  instagram?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
};

type Sponsor = {
  id: string;
  name: string;
  logoUrl: string;
  fileName: string;
  website?: string | null;
  description?: string | null;
  socials?: Socials;
  services?: string[] | null;
};

const modules = import.meta.glob("../assets/patrocinadores/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function fileNameFromPath(p: string): string {
  const parts = p.split("/");
  return parts[parts.length - 1] || p;
}

function baseName(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(0, idx) : name;
}

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/(^-|-$)+/g, "");
}

function toTitle(s: string): string {
  const cleaned = s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const sponsors = computed<Sponsor[]>(() =>
  Object.entries(modules)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([path, url]) => {
      const fname = fileNameFromPath(path);
      const base = baseName(fname);
      const id = toSlug(base);

      const baseItem: Sponsor = {
        id,
        name: toTitle(base),
        logoUrl: url,
        fileName: fname,
        website: null,
        description: null,
        socials: {
          instagram: null,
          twitter: null,
          facebook: null,
          youtube: null,
          linkedin: null,
        },
        services: null,
      };

      const ov: SponsorOverride = sponsorOverrides[id] || {};
      return {
        ...baseItem,
        ...ov,
        socials: { ...baseItem.socials, ...(ov.socials || {}) },
        services: ov.services ?? baseItem.services,
      } satisfies Sponsor;
    })
);

const dialogOpen = ref(false);
const selectedSponsor = ref<Sponsor | null>(null);

function openSponsor(sponsor: Sponsor) {
  selectedSponsor.value = sponsor;
  dialogOpen.value = true;
}

import { customIcons } from "@/utils/icons";
const socialList = [
  { key: "instagram" as const, label: "Instagram", icon: customIcons.instagram },
  { key: "twitter" as const, label: "Twitter / X", icon: customIcons.twitter },
  { key: "facebook" as const, label: "Facebook", icon: customIcons.facebook },
  { key: "youtube" as const, label: "YouTube", icon: customIcons.youtube },
  { key: "linkedin" as const, label: "LinkedIn", icon: customIcons.linkedin },
  // whatsapp não incluso por enquanto
];

function normalizeUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
</script>

<style scoped>
.marquee {
  width: max-content;
  animation: marquee var(--marquee-duration, 30s) linear infinite;
}

.marquee:hover {
  animation-play-state: paused;
}

.marquee.is-paused {
  animation-play-state: paused;
}

.section-title {
  font-size: clamp(1.5rem, 2vw + 1rem, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
}

.marquee-container {
  mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%);
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
