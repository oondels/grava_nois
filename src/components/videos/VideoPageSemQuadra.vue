<template>
  <!-- Wrapper centrado em toda a viewport -->
  <main class="min-h-screen min-h-[100dvh] flex items-center justify-center px-4 py-6 sm:py-8" aria-live="polite">
    <!-- Contêiner com largura fluida no mobile e limite em telas maiores -->
    <div class="w-full max-w-md sm:max-w-lg">
      <div
        class="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl p-4 sm:p-5 max-[360px]:p-3 overflow-hidden"
      >
        <div class="flex items-start gap-3 sm:gap-4 max-[360px]:flex-col max-[360px]:items-stretch max-[360px]:gap-2">
          <!-- Ícone -->
          <div
            class="shrink-0 h-10 w-10 sm:h-11 sm:w-11 max-[360px]:h-9 max-[360px]:w-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/40 flex items-center justify-center max-[360px]:mx-auto"
            aria-hidden="true"
          >
            <MapPinOffIcon class="h-6 w-6 max-[360px]:h-5 max-[360px]:w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <!-- Texto + CTA -->
          <div class="flex-1 min-w-0">
            <h4
              class="text-base sm:text-[1.05rem] max-[360px]:text-sm font-medium leading-tight text-zinc-900 dark:text-zinc-50"
            >
              Sem quadra vinculada
            </h4>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 break-words">
              Vá até seu perfil e vincule a uma quadra de sua cidade.
            </p>

            <div class="mt-3 max-[360px]:mt-2 flex flex-col sm:flex-row gap-2">
              <router-link to="/user-page" class="inline-flex max-[360px]:w-full">
                <v-btn
                  size="small"
                  variant="outlined"
                  color="success"
                  class="rounded-lg h-10 sm:h-9 px-4 w-full sm:w-auto"
                >
                  Cadastrar no perfil
                </v-btn>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { MapPinOffIcon } from "lucide-vue-next";
</script>
