<template>
  <div class="report-wrapper">
    <div class="container-grid">
      <div class="form-col">
        <header class="page-head">
          <h1 class="title">Reportar Erro</h1>
          <p class="subtitle">Ajude-nos a melhorar descrevendo o problema que encontrou.</p>
        </header>

        <v-card elevation="3" class="form-card">
          <v-card-text class="pa-4 pa-sm-6">
            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <div class="field-stack">
                <v-text-field
                  v-model="form.title"
                  label="Assunto"
                  placeholder="Ex: Erro ao abrir vídeo"
                  variant="outlined"
                  density="comfortable"
                />

                <v-select
                  v-model="form.severity"
                  :items="['Baixa', 'Média', 'Alta']"
                  label="Severidade"
                  variant="outlined"
                  density="comfortable"
                />

                <v-textarea
                  v-model="form.description"
                  label="Descrição do erro *"
                  :rules="[req]"
                  rows="4"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                />

                <v-text-field v-model="form.page" label="Página / Seção" variant="outlined" density="comfortable" />

                <!-- <v-textarea
                  v-model="form.userAgent"
                  label="Detalhes técnicos"
                  variant="outlined"
                  density="comfortable"
                  rows="2"
                  readonly
                /> -->

                <div class="actions">
                  <v-btn
                    :disabled="submitting"
                    color="primary"
                    type="submit"
                    variant="flat"
                    :loading="submitting"
                    size="large"
                    block
                  >
                    Enviar Relatório
                  </v-btn>
                  <small class="hint text-medium-emphasis">Campos com * são obrigatórios.</small>
                </div>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </div>

      <aside class="media-col" aria-hidden="true">
        <div class="media-placeholder">
          <div class="inner">
            <p class="badge">Dica</p>
            <h2>Inclua passos e capturas</h2>
            <p class="muted">Quanto mais detalhes, mais rápido conseguimos corrigir.</p>g
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSnackbar } from "@/composables/useSnackbar";
import { sendReport } from "@/services/sendReport";

const { showSnackbar } = useSnackbar();
const formRef = ref();
const submitting = ref(false);

const form = reactive({
  title: "",
  severity: "Média" as "Baixa" | "Média" | "Alta",
  description: "",
  steps: "",
  name: "",
  email: "",
  page: "Lances / Grava Nóis",
  url: "",
  userAgent: "",
});

const req = (v: string) => !!v || "Obrigatório";
const emailOpt = (v: string) => !v || /.+@.+\..+/.test(v) || "Email inválido";

const route = useRoute();
const router = useRouter();

onMounted(() => {
  form.url = window.location.href;
  form.userAgent = navigator.userAgent;
  // If a prefilled page is provided via query (?page=...)
  const qp = route.query.page;
  if (typeof qp === "string" && qp) form.page = qp;
});

async function handleSubmit() {
  const { description } = form;
  if (!description) {
    showSnackbar("Preencha a descrição do erro.", "warning");
    return;
  }
  submitting.value = true;
  try {
    await sendReport({ ...form });
    showSnackbar("Relatório enviado! Obrigado por ajudar.", "success");
    // reset minimal
    form.title = "";
    form.severity = "Média";
    form.description = "";
    form.steps = "";
  } catch (e: any) {
    console.error("Erro ao enviar relatório:", e);
    showSnackbar("Erro ao enviar. Tente novamente.", "error");
  } finally {
    submitting.value = false;
    setTimeout(() => {
      router.push("/lances-gravanois");
    }, 1500);
  }
}
</script>

<style scoped>
.report-wrapper {
  padding: 24px 0 48px;
}
.container-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 900px) {
  .container-grid {
    grid-template-columns: minmax(0, 720px) 1fr;
    align-items: start;
  }
}
.page-head .title {
  margin: 0 0 8px;
}
.page-head .subtitle {
  margin: 0 0 16px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.form-card {
  border-radius: 16px;
}
.field-stack {
  display: grid;
  gap: 12px;
}
.inline-pair {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.inline-pair .grow {
  flex: 1 1 220px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.hint {
  text-align: center;
}

/* Side visual */
.media-col {
  display: none;
}
@media (min-width: 900px) {
  .media-col {
    display: block;
  }
}
.media-placeholder {
  position: relative;
  min-height: 560px;
  border: 2px dashed color-mix(in srgb, var(--ink) 25%, transparent);
  border-radius: 1.25rem;
  background: linear-gradient(135deg, color-mix(in srgb, var(--brand) 18%, transparent), transparent), var(--bg-alt);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.media-placeholder::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.04) 0 12px, rgba(0, 0, 0, 0.03) 12px 24px);
  mix-blend-mode: overlay;
  pointer-events: none;
}
.media-placeholder .inner {
  max-width: 420px;
  text-align: center;
  position: relative;
  z-index: 2;
}
.media-placeholder h2 {
  margin: 0.25rem 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.media-placeholder .muted {
  color: var(--muted);
  font-size: 0.95rem;
}
.badge {
  display: inline-block;
  background: color-mix(in srgb, var(--brand) 70%, var(--ink));
  color: #fff;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
