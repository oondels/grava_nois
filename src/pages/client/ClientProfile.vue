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
          <v-text-field
            v-model="form.tradeName"
            label="Nome Fantasia"
            variant="outlined"
            density="comfortable"
          />
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
          <v-text-field
            v-model="form.document"
            label="CNPJ / CPF"
            variant="outlined"
            density="comfortable"
            disabled
          />
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
      </v-row>

      <div class="d-flex justify-end">
        <v-btn color="primary" :loading="saving" @click="handleSave">
          Salvar Alterações
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useSnackbar } from "@/composables/useSnackbar";
import { clientService, type ClientProfile } from "@/services/client.service";

const { showSnackbar } = useSnackbar();

const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

const formRef = ref();
const form = reactive({
  tradeName: "",
  responsibleName: "",
  responsiblePhone: "",
  responsibleEmail: "",
  document: "",
  legalName: "",
});

const rules = {
  required: (value: string) => !!value || "Telefone obrigatório",
};

function fillForm(profile: ClientProfile) {
  form.tradeName = profile.tradeName ?? "";
  form.responsibleName = profile.responsibleName ?? "";
  form.responsiblePhone = profile.responsiblePhone ?? "";
  form.responsibleEmail = profile.responsibleEmail ?? "";
  form.document = profile.document ?? profile.cnpjCpf ?? "";
  form.legalName = profile.legalName ?? "";
}

async function loadProfile() {
  loading.value = true;
  error.value = null;
  try {
    const response = await clientService.getMyProfile();
    fillForm(response.data);
  } catch (err: any) {
    error.value = err?.message || "Não foi possível carregar o perfil do cliente.";
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  const result = await formRef.value?.validate?.();
  if (result && result.valid === false) return;

  saving.value = true;
  try {
    await clientService.updateProfile({
      tradeName: form.tradeName || null,
      responsibleName: form.responsibleName || null,
      responsiblePhone: form.responsiblePhone || null,
      responsibleEmail: form.responsibleEmail || null,
    });
    showSnackbar("Perfil atualizado com sucesso.", "success");
  } catch (err: any) {
    showSnackbar(err?.message || "Não foi possível salvar o perfil.", "error");
  } finally {
    saving.value = false;
  }
}

onMounted(loadProfile);
</script>
