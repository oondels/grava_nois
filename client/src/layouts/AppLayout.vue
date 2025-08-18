<template>
  <AppShell>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="bottom right"
      class="custom-snackbar"
    >
      {{ snackbar.text }}

      <template v-slot:actions>
        <v-btn @click="hideSnackbar" variant="text" size="small"> Fechar </v-btn>
      </template>
    </v-snackbar>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from "@/components/AppShell.vue";
import { useSnackbar } from "@/composables/useSnackbar";

const { snackbar, hideSnackbar } = useSnackbar();
</script>

<style scoped>
.custom-snackbar {
  margin-bottom: 16px;
}
</style>