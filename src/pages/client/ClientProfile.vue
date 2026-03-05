<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">Perfil do Cliente</h1>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-form ref="formRef" class="mt-2">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.tradeName" label="Nome Fantasia" variant="outlined" density="comfortable" />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.responsibleName"
            label="Nome do Responsável"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.responsiblePhone"
            label="Telefone"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.responsibleEmail"
            label="Email"
            variant="outlined"
            density="comfortable"
            type="email"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field v-model="form.document" label="CNPJ / CPF" variant="outlined" density="comfortable" disabled />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.legalName"
            label="Razão Social"
            variant="outlined"
            density="comfortable"
            disabled
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.cep"
            label="CEP"
            variant="outlined"
            density="comfortable"
            :rules="[rules.cep]"
            :loading="cepLoading"
            @blur="autoFillAddressFromCep"
          >
            <template #append-inner v-slot:loader>
              <v-progress-circular v-if="cepLoading" indeterminate color="green" />
            </template>
          </v-text-field>
        </v-col>

        <v-col cols="12" md="8">
          <v-text-field v-model="form.endereco" label="Endereço" variant="outlined" density="comfortable" />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="form.bairro" label="Bairro" variant="outlined" density="comfortable" />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="form.cidade" label="Cidade" variant="outlined" density="comfortable" />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="form.estado" label="Estado (UF)" variant="outlined" density="comfortable" />
        </v-col>
      </v-row>

      <div class="d-flex justify-end">
        <v-btn color="primary" :loading="saving" @click="handleSave"> Salvar Alterações </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { useSnackbar } from "@/composables/useSnackbar";
import { clientService, type ClientProfile } from "@/services/client.service";
import { fetchViaCepAddress } from "@/utils/viaCep";

const { showSnackbar } = useSnackbar();

const loading = ref(false);
const saving = ref(false);
const cepLoading = ref(false);
const error = ref<string | null>(null);
const lastCheckedCep = ref("");
const isCepValidated = ref(false);

const formRef = ref();
const form = reactive({
  tradeName: "",
  responsibleName: "",
  responsiblePhone: "",
  responsibleEmail: "",
  document: "",
  legalName: "",
  cep: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "",
});

const rules = {
  required: (value: string) => !!value || "Telefone obrigatório",
  cep: (value: string) => !value || /^\d{5}-?\d{3}$/.test(value) || "CEP inválido",
};

function fillForm(profile: ClientProfile) {
  form.tradeName = profile.tradeName ?? "";
  form.responsibleName = profile.responsibleName ?? "";
  form.responsiblePhone = profile.responsiblePhone ?? "";
  form.responsibleEmail = profile.responsibleEmail ?? "";
  form.document = profile.document ?? profile.cnpjCpf ?? "";
  form.legalName = profile.legalName ?? "";
  form.cep = profile.cep ?? "";
  form.endereco = profile.endereco ?? "";
  form.bairro = profile.bairro ?? "";
  form.cidade = profile.cidade ?? "";
  form.estado = profile.estado ?? "";
}

async function loadProfile() {
  loading.value = true;
  error.value = null;
  try {
    const response = await clientService.getMyProfile();
    fillForm(response);
  } catch (err: any) {
    error.value = err?.message || "Não foi possível carregar o perfil do cliente.";
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  const result = await formRef.value?.validate?.();
  if (result && result.valid === false) return;

  const cep = form.cep.replace(/\D/g, "");
  if (cep.length > 0) {
    const cepIsOk = await autoFillAddressFromCep();
    if (!cepIsOk) {
      showSnackbar("Informe um CEP válido antes de salvar.", "warning");
      return;
    }
  }

  saving.value = true;
  try {
    await clientService.updateProfile({
      tradeName: form.tradeName || null,
      responsibleName: form.responsibleName || null,
      responsiblePhone: form.responsiblePhone || null,
      responsibleEmail: form.responsibleEmail || null,
      cep: form.cep || null,
      endereco: form.endereco || null,
      bairro: form.bairro || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
    });
    showSnackbar("Perfil atualizado com sucesso.", "success");
  } catch (err: any) {
    showSnackbar(err?.message || "Não foi possível salvar o perfil.", "error");
  } finally {
    saving.value = false;
  }
}
function sleep(ms:any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function autoFillAddressFromCep() {
  const cep = form.cep.replace(/\D/g, "");
  if (cep.length !== 8 || cepLoading.value) return false;
  if (cep === lastCheckedCep.value && isCepValidated.value) return true;

  lastCheckedCep.value = cep;

  cepLoading.value = true;
  try {
    await sleep(3000)
    const data = await fetchViaCepAddress(cep);
    if (!data) {
      isCepValidated.value = false;
      showSnackbar("CEP não encontrado no ViaCEP.", "warning");
      return false;
    }

    isCepValidated.value = true;
    form.endereco = data.logradouro || form.endereco;
    form.bairro = data.bairro || form.bairro;
    form.cidade = data.localidade || form.cidade;
    form.estado = data.uf || form.estado;
    return true;
  } catch (err) {
    isCepValidated.value = false;
    console.error("Erro ao consultar ViaCEP no perfil:", err);
    showSnackbar("Não foi possível consultar o CEP. Tente novamente.", "error");
    return false;
  } finally {
    cepLoading.value = false;
  }
}

watch(
  () => form.cep,
  (value) => {
    if (loading.value) return;
    const cep = value.replace(/\D/g, "");
    if (cep.length !== 8) {
      isCepValidated.value = false;
      if (cep.length === 0) lastCheckedCep.value = "";
      return;
    }

    if (cep !== lastCheckedCep.value) {
      void autoFillAddressFromCep();
    }
  },
);

onMounted(loadProfile);
</script>
