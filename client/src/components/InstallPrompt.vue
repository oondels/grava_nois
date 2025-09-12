<template>
  <div v-if="visible" class="install-toast" role="dialog" aria-live="polite">
    <div class="message">
      <strong>Instale o Grava Nóis</strong>
      <span class="sub">Acesse mais rápido e use offline.</span>
    </div>
    <div class="actions">
      <button class="btn primary" @click="install">Instalar</button>
      <button class="btn" @click="dismiss">Agora não</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const visible = ref(false);
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);

const STORAGE_KEY = "installPromptDismissed";

function isStandalone() {
  // Chrome/Android, desktop
  if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari
  // @ts-expect-error - iOS Safari property
  if (window.navigator.standalone) return true;
  return false;
}

function shouldShowPrompt() {
  if (isStandalone()) return false;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return true;
    const last = Number(v);
    // Re-exibir após 3 dias
    return !Number.isFinite(last) || Date.now() - last > 3 * 24 * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

function onBeforeInstallPrompt(e: Event) {
  e.preventDefault();
  deferredPrompt.value = e as BeforeInstallPromptEvent;
  visible.value = shouldShowPrompt();
}

function onAppInstalled() {
  visible.value = false;
  deferredPrompt.value = null;
}

async function install() {
  const ev = deferredPrompt.value;
  if (!ev) return;
  await ev.prompt();
  try {
    const choice = await ev.userChoice;
    if (choice.outcome === "accepted") {
      visible.value = false;
      deferredPrompt.value = null;
    } else {
      dismiss();
    }
  } catch {
    console.error("Install prompt error");
  }
}

function dismiss() {
  visible.value = false;
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {}
}

onMounted(() => {
  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
  window.addEventListener("appinstalled", onAppInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
  window.removeEventListener("appinstalled", onAppInstalled);
});
</script>

<style scoped>
.install-toast {
  position: fixed;
  right: 16px;
  bottom: 70px;
  z-index: 60;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(17, 39, 19, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
.message {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sub {
  opacity: 0.8;
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 8px;
}
.btn {
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: #fff;
}
.btn.primary {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.45);
}
.btn:hover {
  filter: brightness(1.05);
}
</style>
