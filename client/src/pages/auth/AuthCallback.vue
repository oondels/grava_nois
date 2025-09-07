<template>
  <div class="p-6 text-center">Realizando Login...</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabaseClient } from "@/lib/supabaseAuth";

const router = useRouter();
const route = useRoute();

onMounted(async () => {
  // Handle OAuth errors from the IdP/Supabase
  const err = route.query.error_description || route.query.error;
  if (err) {
    console.error("OAuth error:", err);
    return router.replace({ name: "login", query: { e: String(err) } });
  }

  // Se a sessão já existe (ex: usuário recarregou a página), apenas redireciona
  const { data: s1 } = await supabaseClient.auth.getSession();
  if (s1.session) {
    const desired = (localStorage.getItem("postAuthRedirect") || "").trim();
    const target = desired && desired.startsWith("/") ? desired : "/lances-gravanois";
    localStorage.removeItem("postAuthRedirect");
    return router.replace(target);
  }

  const code = String(route.query.code || "");
  if (!code) {
    // No code → just bail to login
    return router.replace({ name: "login" });
  }

  // Exchange PKCE code for a Supabase session
  const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeCodeForSession:", error);
    return router.replace({ name: "login", query: { e: "exchange_failed" } });
  }

  // Decide where to go after login
  const desired = (localStorage.getItem("postAuthRedirect") || "").trim();
  const target = desired && desired.startsWith("/") ? desired : "/lances-gravanois";
  localStorage.removeItem("postAuthRedirect");
  router.replace(target);
});
</script>
