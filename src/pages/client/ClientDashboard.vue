<template>
  <v-container fluid class="py-6">
    <h1 class="text-h5 font-weight-bold">{{ title }}</h1>
  </v-container>
</template>

<script setup lang="ts">
const { title = "Visão Geral" } = defineProps<{ title?: string }>();
</script>
