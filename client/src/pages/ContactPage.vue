<template>
  <div class="orcamento-wrapper">
    <div class="container-grid">
      <div class="form-col">
        <header class="page-head">
          <h1 class="title">Solicitar Instalação</h1>
          <p class="subtitle">
            Instale o <strong>Grava Nóis</strong> no seu espaço esportivo. Preencha os dados e retornaremos com uma
            proposta personalizada.
          </p>
        </header>

        <v-card elevation="3" class="form-card">
          <v-card-text class="pa-4 pa-sm-6">
            <v-form ref="formRef" @submit.prevent="handleSubmit">
              <div class="field-stack">
                <v-text-field
                  v-model="form.estabelecimento"
                  label="Estabelecimento *"
                  :rules="reqRules"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="form.cnpjCpf"
                  label="CNPJ / CPF *"
                  :rules="[...reqRules, cpfCnpjRule]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="form.cep"
                  label="CEP *"
                  :rules="[...reqRules, cepRule]"
                  variant="outlined"
                  density="comfortable"
                  @blur="autoFillAddress"
                />
                <v-text-field
                  v-model="form.endereco"
                  label="Endereço *"
                  :rules="reqRules"
                  variant="outlined"
                  density="comfortable"
                />

                <div class="inline-pair">
                  <v-select
                    v-model="form.estado"
                    :items="estados"
                    label="Estado *"
                    :rules="reqRules"
                    variant="outlined"
                    density="comfortable"
                    class="grow"
                  />
                  <v-text-field
                    v-model="form.cidade"
                    label="Cidade *"
                    :rules="reqRules"
                    variant="outlined"
                    density="comfortable"
                    class="grow"
                  />
                </div>
                <v-text-field
                  v-model="form.segmento"
                  label="Segmento (Esporte) *"
                  :rules="reqRules"
                  placeholder="Futebol, Vôlei..."
                  variant="outlined"
                  density="comfortable"
                />
                <div class="inline-pair">
                  <v-text-field
                    v-model.number="form.qtdCameras"
                    type="number"
                    min="1"
                    label="Qtde de Câmeras"
                    :rules="qtdCamerasRule"
                    variant="outlined"
                    density="comfortable"
                    class="grow"
                  />
                  <v-text-field
                    v-model="form.telefone"
                    label="Telefone *"
                    :rules="[...reqRules, telefoneRule]"
                    variant="outlined"
                    density="comfortable"
                    class="grow"
                  />
                </div>
                <v-text-field
                  v-model="form.nome"
                  label="Nome de Contato *"
                  :rules="reqRules"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="form.email"
                  label="Email *"
                  :rules="[...reqRules, emailRule]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-textarea
                  v-model="form.obs"
                  label="Observações"
                  rows="3"
                  auto-grow
                  variant="outlined"
                  density="comfortable"
                />
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
                    Enviar Solicitação
                  </v-btn>
                  <small class="hint text-medium-emphasis">Campos com * são obrigatórios.</small>
                </div>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </div>

      <!-- Col: Placeholder Image -->
      <aside class="media-col" aria-hidden="true">
        <div class="media-placeholder">
          <div class="inner">
            <p class="badge">Pré-visualização</p>
            <h2>Espaço para imagem</h2>
            <p class="muted">Adicione aqui futuramente uma foto do ambiente ou mockup da instalação.</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useSnackbar } from "@/composables/useSnackbar";
import { solicitarInstalacao } from "@/services/solicitarInstalacao";

const { showSnackbar } = useSnackbar();
const formRef = ref();
const isValid = ref(false);
const submitting = ref(false);

const form = reactive({
  estabelecimento: "",
  cnpjCpf: "",
  cep: "",
  endereco: "",
  estado: "",
  cidade: "",
  nome: "",
  telefone: "",
  email: "",
  segmento: "",
  qtdCameras: 1,
  obs: "",
});

const estados = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const reqRules = [(v: string) => !!v || "Obrigatório"];
const emailRule = (v: string) => /.+@.+\..+/.test(v) || "Email inválido";
const cepRule = (v: string) => /^\d{5}-?\d{3}$/.test(v) || "CEP inválido";
const telefoneRule = (v: string) => v.replace(/\D/g, "").length >= 10 || "Telefone inválido";
const cpfCnpjRule = (v: string) => v.replace(/\D/g, "").length >= 11 || "CNPJ/CPF inválido";
const qtdCamerasRule = [(v: number) => v == null || v >= 1 || "Mínimo 1"];

const handleSubmit = async () => {
  // const valid = await formRef.value?.validate();
  // if (!valid) {
  //   console.warn("Formulário inválido");
  //   return;
  // }

  submitting.value = true;
  try {
    console.log("enviado");
    await solicitarInstalacao(form);

    //! Fix
    // showSnackbar("Solicitação enviada! Entraremos em contato em breve.", "success");

    // reset
    // Object.assign(form, {
    //   estabelecimento: "",
    //   cnpjCpf: "",
    //   cep: "",
    //   endereco: "",
    //   estado: "",
    //   cidade: "",
    //   nome: "",
    //   telefone: "",
    //   email: "",
    //   segmento: "",
    //   qtdCameras: 1,
    //   obs: "",
    // });
    // formRef.value?.resetValidation();
  } catch (e) {
    console.error("Erro ao enviar formulário:", e);

    showSnackbar("Erro ao enviar. Tente novamente.", "error");
  } finally {
    submitting.value = false;
  }
};

// Auto-preenchimento simples via ViaCEP
async function autoFillAddress() {
  const cep = form.cep.replace(/\D/g, "");
  if (cep.length !== 8) return;
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resp.ok) return;
    const data = await resp.json();
    if (data.erro) return;
    form.endereco = data.logradouro || form.endereco;
    form.cidade = data.localidade || form.cidade;
    form.estado = data.uf || form.estado;
  } catch {}
}
</script>

<style scoped>
.orcamento-wrapper {
  width: min(1100px, 100% - 2rem);
  padding: clamp(1rem, 2vw, 2rem) 0 3rem;
  background: radial-gradient(
      900px 300px at 10% -10%,
      color-mix(in srgb, var(--brand) 14%, transparent),
      transparent 60%
    ),
    var(--bg);
  min-height: 100%;
}
.container-grid {
  width: min(1200px, 100% - 2rem);
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}
/* Two columns from 900px */
@media (min-width: 900px) {
  .container-grid {
    grid-template-columns: 1fr 0.9fr;
    align-items: start;
  }
}
.page-head {
  margin-bottom: 1.25rem;
}
.title {
  font-size: clamp(1.6rem, 2.2vw + 0.8rem, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
}
.subtitle {
  margin: 0;
  color: var(--muted);
  line-height: 1.35;
}
.form-card {
  backdrop-filter: saturate(180%) blur(6px);
}
.field-stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.inline-pair {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
}
.inline-pair .grow {
  flex: 1 1 220px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.hint {
  display: block;
  text-align: center;
}

/* Media Placeholder */
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

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .media-placeholder::after {
    animation: none;
  }
}
</style>
