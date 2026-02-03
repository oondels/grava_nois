<template>
  <v-container fluid class="py-6">
    <h1 class="text-h5 font-weight-bold mb-2">{{ title }}</h1>
    <p class="text-medium-emphasis mb-0">Em construção.</p>
  </v-container>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

