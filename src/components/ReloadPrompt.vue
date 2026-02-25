<template>
  <Transition name="reload-fade">
    <aside
      v-if="needRefresh"
      class="reload-prompt"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="reload-prompt__content">
        <p class="reload-prompt__eyebrow">Atualização disponível</p>
        <p class="reload-prompt__message">
          Uma nova versão do Grava Nóis está pronta para instalar.
        </p>
      </div>

      <div class="reload-prompt__actions">
        <button type="button" class="reload-prompt__btn reload-prompt__btn--primary" @click="updateServiceWorker()">
          Atualizar
        </button>
        <button
          type="button"
          class="reload-prompt__btn reload-prompt__btn--secondary"
          @click="close"
        >
          Depois
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";

let swRegistration: ServiceWorkerRegistration | undefined;
let timer: number | undefined;

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(_swUrl, registration) {
    swRegistration = registration;
  },
});

const checkUpdate = () => {
  swRegistration?.update();
};

const onVisibilityChange = () => {
  if (document.visibilityState === "visible") checkUpdate();
};

const close = () => {
  needRefresh.value = false;
};

onMounted(() => {
  // checa assim que abrir
  checkUpdate();

  // checa periodicamente (5 min)
  timer = window.setInterval(checkUpdate, 5 * 60 * 1000);

  // checa quando o usuário volta pra aba
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer);
  document.removeEventListener("visibilitychange", onVisibilityChange);
});
</script>

<style scoped>
.reload-prompt {
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  z-index: 70;
  width: min(380px, calc(100vw - 24px));
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(145deg, rgba(30, 38, 52, 0.92), rgba(18, 24, 36, 0.95));
  box-shadow:
    0 16px 38px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.95);
}

@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .reload-prompt {
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    backdrop-filter: blur(16px) saturate(140%);
  }
}

.reload-prompt__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.reload-prompt__eyebrow {
  margin: 0;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.reload-prompt__message {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.35;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.94);
}

.reload-prompt__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.reload-prompt__btn {
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 11px;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1;
  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
  cursor: pointer;
}

.reload-prompt__btn:active {
  transform: translateY(1px) scale(0.99);
}

.reload-prompt__btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.reload-prompt__btn--primary {
  color: #fff;
  background: linear-gradient(180deg, #2e84ff 0%, #1f6ae5 100%);
  box-shadow:
    0 6px 16px rgba(31, 106, 229, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.reload-prompt__btn--primary:hover {
  filter: brightness(1.07);
}

.reload-prompt__btn--secondary {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.reload-prompt__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.reload-fade-enter-active,
.reload-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.reload-fade-enter-from,
.reload-fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

@media (max-width: 640px) {
  .reload-prompt {
    left: 12px;
    right: 12px;
    width: auto;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  }

  .reload-prompt__actions {
    justify-content: stretch;
  }

  .reload-prompt__btn {
    flex: 1;
  }
}
</style>
