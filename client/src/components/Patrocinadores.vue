<template>
  <!-- Patrocinadores -->
  <div class="mt-4 flex gap-8 flex-nowrap marquee-track animate-[marquee_var(--dur,60s)_linear_infinite]">
    <!-- Conjunto A -->
    <ul class="flex gap-8 flex-nowrap">
      <li class="h-12 w-max">
        <img class="h-12 w-auto" :src="hero" alt="Mozilla" draggable="false" />
      </li>
      <li class="h-12 w-max">
        <img class="h-12 w-auto" :src="soccer" alt="GitHub" draggable="false" />
      </li>
      <li class="h-12 w-max">
        <img class="h-12 w-auto" :src="volleyball" alt="1Password" draggable="false" />
      </li>
    </ul>

    <!-- Conjunto B -->
    <ul class="flex gap-8 flex-nowrap" aria-hidden="true">
      <li class="h-12 w-max">
        <img class="h-12 w-auto" :src="hero" alt="Mozilla" draggable="false" />
      </li>
      <li class="h-12 w-max">
        <img class="h-12 w-auto" :src="soccer" alt="GitHub" draggable="false" />
      </li>
      <li class="h-12 w-max">
        <img class="h-12 w-auto" :src="volleyball" alt="1Password" draggable="false" />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";
</script>

<style scoped></style>
