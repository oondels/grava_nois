<template>
  <AppShell>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Global notifications via Notivue -->
    <AppNotifications />
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from "@/components/AppShell.vue";
import AppNotifications from "@/components/AppNotifications.vue";
</script>
