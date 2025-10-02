<template>
  <!-- Notivue notifications container at top-right (default) -->
  <Notivue v-slot="item">
    <NotivueSwipe :item="item">
      <Notification :item="item">
        <NotificationProgress :item="item" />
      </Notification>
    </NotivueSwipe>
  </Notivue>
</template>

<script setup lang="ts">
import { Notivue, Notification, NotificationProgress, NotivueSwipe } from "notivue";
</script>

<style scoped></style>
