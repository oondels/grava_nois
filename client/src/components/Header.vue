<template>
  <header class="topbar" role="navigation" aria-label="About navigation">
    <div class="container nav-inner">
      <div class="brand">
        <div class="logo-dot" aria-hidden="true"></div>
        <span class="brand-name">Grava Nóis</span>
      </div>
      <nav class="links">
        <a href="#how">Clipes</a>
        <a href="#security">Sobre</a>
        <a href="#faq">Ajuda</a>
        <a href="#cta" class="btn btn-primary">Instalar no meu campo</a>
      </nav>
    </div>
  </header>
</template>

<script lang="ts" setup>
</script>

<style scoped>
/* Topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: saturate(180%) blur(8px);
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  height: 80px;
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  gap: 1rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--brand-ink);
}
.logo-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--brand);
  box-shadow: 0 0 0 6px var(--ring);
}
.links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.links a {
  text-decoration: none;
  color: var(--ink);
  font-weight: 600;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
}
.links a:hover {
  background: var(--bg-alt);
}
</style>
