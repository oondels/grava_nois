<template>
  <Transition name="install-fade">
    <div v-if="visible" class="install-overlay" role="presentation">
      <section
        class="install-modal"
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-labelledby="install-title"
      >
        <button type="button" class="close-btn" aria-label="Fechar modal" @click="dismiss">×</button>

        <div class="install-badge" aria-hidden="true">GN</div>
        <h2 id="install-title" class="install-title">Instale o aplicativo Grava Nóis</h2>

        <p v-if="!iosGuide" class="install-subtitle">
          Adicione o app à sua tela inicial para abrir com 1 toque e ter uma experiência mais rápida.
        </p>
        <p v-else class="install-subtitle">
          No iPhone/iPad, a instalação é feita pelo Safari em poucos passos.
        </p>

        <ul v-if="!iosGuide" class="install-benefits">
          <li>Abra o Grava Nóis direto da tela inicial</li>
          <li>Use como aplicativo, sem barra do navegador</li>
          <li>Receba melhorias e atualizações com mais facilidade</li>
        </ul>

        <div v-else class="ios-guide">
          <p v-if="!isIosSafari" class="ios-warning">
            Para instalar no iPhone, abra este site no <strong>Safari</strong>.
          </p>

          <ol class="ios-steps">
            <li>
              <span class="step-num">1</span>
              <span>No Safari, toque em <strong>Compartilhar</strong> (quadrado com seta para cima).</span>
            </li>
            <li>
              <span class="step-num">2</span>
              <span>Deslize as opções e toque em <strong>Adicionar à Tela de Início</strong>.</span>
            </li>
            <li>
              <span class="step-num">3</span>
              <span>Confirme em <strong>Adicionar</strong>. O ícone do app aparecerá na sua tela inicial.</span>
            </li>
          </ol>
        </div>

        <div class="actions">
          <button
            v-if="!iosGuide"
            type="button"
            class="btn btn-primary"
            :disabled="!deferredPrompt"
            @click="install"
          >
            Instalar aplicativo
          </button>

          <button type="button" class="btn btn-secondary" @click="dismiss">
            {{ iosGuide ? "Entendi" : "Agora não" }}
          </button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const visible = ref(false);
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const iosGuide = ref(false);
const isIosSafari = ref(true);

const STORAGE_KEY = "installPromptDismissed";

function isStandalone() {
  // Chrome/Android, desktop
  if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari
  // @ts-expect-error - iOS Safari property
  if (window.navigator.standalone) return true;
  return false;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isSafariOnIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /safari/i.test(ua) && !/crios|fxios|edgios|opios|mercury/i.test(ua);
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
  } catch {
    // localStorage indisponível
  }
}

onMounted(() => {
  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
  window.addEventListener("appinstalled", onAppInstalled);

  // iOS Safari não dispara beforeinstallprompt
  if (isIOS() && !isStandalone() && shouldShowPrompt()) {
    iosGuide.value = true;
    isIosSafari.value = isSafariOnIOS();
    visible.value = true;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
  window.removeEventListener("appinstalled", onAppInstalled);
});
</script>

<style scoped>
.install-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgba(5, 10, 18, 0.54);
}

.install-modal {
  position: relative;
  width: min(520px, 100%);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 55%),
    linear-gradient(160deg, rgba(18, 24, 38, 0.96), rgba(13, 19, 30, 0.95));
  box-shadow:
    0 22px 48px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  color: #fff;
}

@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .install-overlay {
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }

  .install-modal {
    -webkit-backdrop-filter: blur(14px) saturate(130%);
    backdrop-filter: blur(14px) saturate(130%);
  }
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.86);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.install-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-bottom: 10px;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.35);
}

.install-title {
  margin: 0;
  font-size: 1.18rem;
  line-height: 1.28;
  font-weight: 700;
}

.install-subtitle {
  margin: 8px 0 0;
  font-size: 0.92rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.86);
}

.install-benefits {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.install-benefits li {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.87rem;
}

.ios-guide {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.ios-warning {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 0.86rem;
  color: #ffe4a3;
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.ios-steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.ios-steps li {
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.86rem;
  line-height: 1.45;
}

.step-num {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #dbeafe;
  background: rgba(59, 130, 246, 0.26);
  border: 1px solid rgba(147, 197, 253, 0.36);
}

.actions {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn {
  min-height: 38px;
  border-radius: 12px;
  border: 0;
  padding: 0 14px;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    filter 0.15s ease,
    background-color 0.15s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn:focus-visible,
.close-btn:focus-visible {
  outline: 2px solid rgba(147, 197, 253, 0.7);
  outline-offset: 2px;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(180deg, #2e84ff 0%, #1f6ae5 100%);
  box-shadow:
    0 10px 20px rgba(31, 106, 229, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-primary:hover {
  filter: brightness(1.08);
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: none;
}

.btn-secondary {
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
}

.install-fade-enter-active,
.install-fade-leave-active {
  transition: opacity 0.2s ease;
}

.install-fade-enter-from,
.install-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .install-overlay {
    padding: 10px;
    align-items: flex-end;
  }

  .install-modal {
    border-radius: 20px;
    padding: 18px;
    max-height: min(86vh, 100dvh - 20px);
    overflow: auto;
  }

  .actions {
    justify-content: stretch;
  }

  .btn {
    flex: 1;
  }
}
</style>
