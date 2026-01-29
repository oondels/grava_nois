<template>
  <div class="p-6 text-center">Realizando Login...</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const err = route.query.error_description || route.query.error;
  if (err) {
    console.error("OAuth error:", err);
    return router.replace({ name: "login", query: { e: String(err) } });
  }

  
});
</script>
