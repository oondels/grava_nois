<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">Quadras</h1>
    </div>

    <v-card>
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
          {{ successMessage }}
        </v-alert>

        <div v-if="!isMobile">
          <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            item-value="id"
          >
            <template #item.name="{ item }">
              <div class="font-weight-medium">{{ getVenueName(item) }}</div>
            </template>

            <template #item.client="{ item }">
              {{ getClientName(item) }}
            </template>

            <template #item.paymentStatus="{ item }">
              <v-chip size="small" :color="paymentColor(item.paymentStatus)" variant="tonal">
                {{ formatPaymentStatus(item.paymentStatus) }}
              </v-chip>
            </template>

            <template #item.installationStatus="{ item }">
              <v-chip size="small" :color="installationColor(item.installationStatus)" variant="tonal">
                {{ formatInstallationStatus(item.installationStatus) }}
              </v-chip>
            </template>

            <template #item.isOnline="{ item }">
              <v-icon :color="item.isOnline ? 'success' : 'error'">
                {{ item.isOnline ? "mdi-wifi" : "mdi-wifi-off" }}
              </v-icon>
              <span class="ms-2">{{ item.isOnline ? "Online" : "Offline" }}</span>
            </template>

            <template #item.actions="{ item }">
              <v-btn size="small" variant="text" @click="openEdit(item)">Editar</v-btn>
            </template>
          </v-data-table>
        </div>

        <div v-else class="d-flex flex-column ga-4">
          <v-progress-linear v-if="loading" indeterminate class="mb-2" />

          <v-alert
            v-else-if="items.length === 0"
            type="info"
            variant="tonal"
            class="mb-2"
          >
            Nenhuma quadra encontrada.
          </v-alert>

          <v-card v-for="item in items" :key="item.id">
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ getVenueName(item) }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ getClientName(item) }}
                </div>
              </div>
              <v-btn size="small" variant="text" @click="openEdit(item)">
                Editar
              </v-btn>
            </v-card-title>
            <v-card-text class="pt-0">
              <div class="d-flex flex-wrap ga-2 mb-2">
                <v-chip size="x-small" :color="paymentColor(item.paymentStatus)" variant="tonal">
                  {{ formatPaymentStatus(item.paymentStatus) }}
                </v-chip>
                <v-chip
                  size="x-small"
                  :color="installationColor(item.installationStatus)"
                  variant="tonal"
                >
                  {{ formatInstallationStatus(item.installationStatus) }}
                </v-chip>
                <v-chip size="x-small" :color="item.isOnline ? 'success' : 'error'" variant="tonal">
                  {{ item.isOnline ? "Online" : "Offline" }}
                </v-chip>
                <v-chip size="x-small" :color="item.active ? 'success' : 'default'" variant="tonal">
                  {{ item.active ? "Ativa" : "Inativa" }}
                </v-chip>
              </div>

              <div class="text-body-2">
                <span class="text-medium-emphasis">Cidade/UF:</span>
                {{ formatCityState(item) }}
              </div>
              <div class="text-body-2">
                <span class="text-medium-emphasis">Device ID:</span>
                {{ item.deviceId || "—" }}
              </div>
              <div class="d-flex justify-end mt-2">
                <v-btn size="small" variant="text" @click="openEdit(item)">
                  Editar quadra
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" max-width="680">
      <v-card>
        <v-card-title class="text-h6">Editar quadra</v-card-title>
        <v-card-text class="pt-2">
          <v-text-field
            v-model="editedVenueName"
            label="Nome da quadra *"
            variant="outlined"
            density="comfortable"
          />

          <v-text-field
            v-model="editedDescription"
            label="Descrição"
            variant="outlined"
            density="comfortable"
          />

          <v-text-field
            v-model="editedAddressLine"
            label="Endereço"
            variant="outlined"
            density="comfortable"
          />

          <div class="d-flex ga-3 flex-wrap">
            <v-text-field
              v-model="editedCity"
              label="Cidade"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
            <v-text-field
              v-model="editedState"
              label="Estado"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
            <v-text-field
              v-model="editedCountryCode"
              label="País (ISO-2)"
              maxlength="2"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
          </div>

          <v-text-field
            v-model="editedPostalCode"
            label="CEP"
            variant="outlined"
            density="comfortable"
          />

          <div class="d-flex ga-3 flex-wrap mb-3">
            <v-select
              v-model="editedPaymentStatus"
              :items="paymentStatusOptions"
              item-title="title"
              item-value="value"
              label="Status de pagamento"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
            <v-select
              v-model="editedInstallationStatus"
              :items="installationStatusOptions"
              item-title="title"
              item-value="value"
              label="Status da instalação"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
          </div>

          <div class="d-flex ga-4 mb-3">
            <v-switch v-model="editedActive" label="Quadra ativa" color="success" inset />
            <v-switch v-model="editedIsOnline" label="Online" color="primary" inset />
          </div>

          <v-divider class="my-2" />

          <div class="text-subtitle-2 mb-1">Credenciais do device</div>
          <v-switch
            v-model="regenerateDeviceCredentials"
            color="warning"
            label="Regenerar device_id e device_secret"
            inset
          />

          <v-text-field
            v-model="editedDeviceId"
            label="Device ID"
            variant="outlined"
            density="comfortable"
            :disabled="regenerateDeviceCredentials"
          />

          <v-text-field
            v-model="editedDeviceSecret"
            label="Device Secret"
            variant="outlined"
            density="comfortable"
            :disabled="regenerateDeviceCredentials"
            hint="Minimo de 16 caracteres quando informado manualmente"
            persistent-hint
          />

          <v-alert v-if="dialogError" type="error" variant="tonal" class="mt-2">
            {{ dialogError }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveVenue">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useDisplay } from "vuetify";
import {
  adminService,
  type AdminVenue,
  type UpdateVenuePayload,
} from "@/services/admin.service";

const headers = [
  { title: "Nome da Quadra", key: "name" },
  { title: "Cliente (Dono)", key: "client" },
  { title: "Status Pagamento", key: "paymentStatus" },
  { title: "Status Instalação", key: "installationStatus" },
  { title: "Online/Offline", key: "isOnline" },
  { title: "Ações", key: "actions", sortable: false },
];

const paymentStatusOptions = [
  { title: "Sem cobrança", value: "none" },
  { title: "Ativo", value: "active" },
  { title: "Em atraso", value: "past_due" },
  { title: "Cancelado", value: "canceled" },
] as const;

const installationStatusOptions = [
  { title: "Ativa", value: "active" },
  { title: "Pausada", value: "paused" },
  { title: "Descomissionada", value: "decommissioned" },
] as const;

const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);

const items = ref<AdminVenue[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const dialog = ref(false);
const saving = ref(false);
const dialogError = ref<string | null>(null);
const editedVenue = ref<AdminVenue | null>(null);

const editedVenueName = ref("");
const editedDescription = ref("");
const editedAddressLine = ref("");
const editedCity = ref("");
const editedState = ref("");
const editedCountryCode = ref("");
const editedPostalCode = ref("");
const editedPaymentStatus = ref<"none" | "active" | "past_due" | "canceled">("none");
const editedInstallationStatus = ref<"active" | "paused" | "decommissioned">("active");
const editedActive = ref(true);
const editedIsOnline = ref(false);
const regenerateDeviceCredentials = ref(false);
const editedDeviceId = ref("");
const editedDeviceSecret = ref("");

function getVenueName(venue: AdminVenue) {
  return (
    (venue as any).venueName ||
    (venue as any).name ||
    (venue as any).quadraName ||
    (venue as any).title ||
    "—"
  );
}

function getClientName(venue: AdminVenue) {
  const client = venue.client;
  if (!client) return "—";
  return client.tradeName || client.legalName || "—";
}

function formatCityState(venue: AdminVenue) {
  const city = typeof venue.city === "string" ? venue.city : "";
  const state = typeof venue.state === "string" ? venue.state : "";

  if (city && state) return `${city}/${state}`;
  if (city) return city;
  if (state) return state;
  return "—";
}

function formatPaymentStatus(status?: string | null) {
  if (!status) return "Não informado";
  if (status === "past_due") return "Em atraso";
  if (status === "active") return "Ativo";
  if (status === "canceled") return "Cancelado";
  if (status === "none") return "Sem cobrança";
  return status;
}

function formatInstallationStatus(status?: string | null) {
  if (!status) return "Não informado";
  if (status === "active") return "Ativa";
  if (status === "paused") return "Pausada";
  if (status === "decommissioned") return "Descomissionada";
  return status;
}

function paymentColor(status?: string | null) {
  if (status === "active") return "success";
  if (status === "past_due") return "warning";
  if (status === "canceled") return "error";
  return "default";
}

function installationColor(status?: string | null) {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  if (status === "decommissioned") return "error";
  return "default";
}

function valueOrNull(input: string) {
  const normalized = input.trim();
  return normalized.length > 0 ? normalized : null;
}

function openEdit(venue: AdminVenue) {
  editedVenue.value = venue;
  editedVenueName.value = String(getVenueName(venue) || "");
  editedDescription.value = typeof venue.description === "string" ? venue.description : "";
  editedAddressLine.value = typeof venue.addressLine === "string" ? venue.addressLine : "";
  editedCity.value = typeof venue.city === "string" ? venue.city : "";
  editedState.value = typeof venue.state === "string" ? venue.state : "";
  editedCountryCode.value = typeof venue.countryCode === "string" ? venue.countryCode : "";
  editedPostalCode.value = typeof venue.postalCode === "string" ? venue.postalCode : "";
  editedPaymentStatus.value =
    venue.paymentStatus === "active" ||
    venue.paymentStatus === "past_due" ||
    venue.paymentStatus === "canceled"
      ? venue.paymentStatus
      : "none";
  editedInstallationStatus.value =
    venue.installationStatus === "paused" ||
    venue.installationStatus === "decommissioned"
      ? venue.installationStatus
      : "active";
  editedActive.value = venue.active !== false;
  editedIsOnline.value = Boolean(venue.isOnline);
  regenerateDeviceCredentials.value = false;
  editedDeviceId.value = typeof venue.deviceId === "string" ? venue.deviceId : "";
  editedDeviceSecret.value = typeof venue.deviceSecret === "string" ? venue.deviceSecret : "";
  dialogError.value = null;
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  dialogError.value = null;
  editedVenue.value = null;
}

function buildUpdatePayload(): UpdateVenuePayload {
  const payload: UpdateVenuePayload = {
    venueName: editedVenueName.value.trim(),
    description: valueOrNull(editedDescription.value),
    addressLine: valueOrNull(editedAddressLine.value),
    city: valueOrNull(editedCity.value),
    state: valueOrNull(editedState.value),
    countryCode: valueOrNull(editedCountryCode.value)?.toUpperCase() ?? null,
    postalCode: valueOrNull(editedPostalCode.value),
    paymentStatus: editedPaymentStatus.value,
    installationStatus: editedInstallationStatus.value,
    active: editedActive.value,
    isOnline: editedIsOnline.value,
  };

  if (regenerateDeviceCredentials.value) {
    payload.regenerateDeviceCredentials = true;
    return payload;
  }

  const nextDeviceId = editedDeviceId.value.trim();
  const nextDeviceSecret = editedDeviceSecret.value.trim();

  if (nextDeviceId.length > 0) {
    payload.deviceId = nextDeviceId;
  }

  if (nextDeviceSecret.length > 0) {
    payload.deviceSecret = nextDeviceSecret;
  }

  return payload;
}

async function saveVenue() {
  if (!editedVenue.value?.id) return;

  if (!editedVenueName.value.trim()) {
    dialogError.value = "Nome da quadra é obrigatório.";
    return;
  }

  if (!regenerateDeviceCredentials.value) {
    const deviceSecret = editedDeviceSecret.value.trim();
    if (deviceSecret.length > 0 && deviceSecret.length < 16) {
      dialogError.value = "Device Secret deve ter no mínimo 16 caracteres.";
      return;
    }
  }

  saving.value = true;
  dialogError.value = null;
  successMessage.value = null;

  try {
    const updated = await adminService.updateVenue(
      editedVenue.value.id,
      buildUpdatePayload()
    );

    await fetchVenues();
    closeDialog();

    successMessage.value = updated.credentialsGenerated
      ? "Quadra atualizada. Credenciais de device geradas com sucesso."
      : "Quadra atualizada com sucesso.";
  } catch (err: any) {
    dialogError.value = err?.message || "Não foi possível salvar a quadra.";
  } finally {
    saving.value = false;
  }
}

async function fetchVenues() {
  loading.value = true;
  error.value = null;
  try {
    const response = await adminService.getVenues();
    items.value = response;
  } catch (err: any) {
    error.value = err?.message || "Não foi possível carregar as quadras.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchVenues);
</script>
