<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">Clientes</h1>
    </div>

    <v-card>
      <v-card-text>
        <div class="d-flex flex-wrap ga-3 mb-4">
          <v-text-field
            v-model="search"
            label="Buscar por razão social, fantasia ou responsável"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="flex-1-1"
          />
        </div>

        <v-data-table-server
          :headers="headers"
          :items="items"
          :items-length="total"
          :loading="loading"
          :search="search"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          item-value="id"
          @update:options="fetchClients"
        >
          <template #item.tradeName="{ item }">
            <div class="font-weight-medium">
              {{ item.tradeName || item.legalName || "—" }}
            </div>
          </template>

          <template #item.responsibleName="{ item }">
            {{ item.responsibleName || "—" }}
          </template>

          <template #item.responsiblePhone="{ item }">
            {{ item.responsiblePhone || "—" }}
          </template>

          <template #item.retentionDays="{ item }">
            {{ item.retentionDays ?? "—" }}
          </template>

          <template #item.venueCount="{ item }">
            {{ item.venueCount ?? 0 }}
          </template>

          <template #item.paymentStatus="{ item }">
            {{ formatPaymentStatus(item.paymentStatus) }}
          </template>

          <template #item.lastCharge="{ item }">
            <v-chip
              v-if="item.lastCharge"
              size="small"
              variant="tonal"
              class="cursor-pointer"
              @click="openLastCharge(item)"
              color="light-green"
            >
              Cobrança
            </v-chip>
            <span v-else>—</span>
          </template>

          <template #item.actions="{ item }">
            <v-btn size="small" variant="text" @click="openEdit(item)">Editar</v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title class="text-h6">Editar cliente</v-card-title>
        <v-card-text class="pt-2">
          <div class="text-medium-emphasis mb-4">{{ editedClient?.legalName || "—" }}</div>
          <v-text-field
            v-model="editedTradeName"
            label="Nome fantasia"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model="editedResponsibleName"
            label="Responsável"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model="editedResponsiblePhone"
            label="Telefone"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model.number="editedRetentionDays"
            label="Dias de retenção (vídeo)"
            type="number"
            variant="outlined"
            density="comfortable"
            min="0"
          />
          <v-alert v-if="dialogError" type="error" variant="tonal" class="mt-2">
            {{ dialogError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveClient">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="chargeDialog" max-width="520">
      <v-card>
        <v-card-title class="text-h6">Última cobrança</v-card-title>
        <v-card-text class="pt-2">
          <div class="text-medium-emphasis mb-4">
            {{ selectedChargeClient?.tradeName || selectedChargeClient?.legalName || "—" }}
          </div>

          <div class="d-flex align-center justify-space-between py-1">
            <span class="text-medium-emphasis">Status</span>
            <span>{{ formatPaymentStatus(selectedCharge?.status) }}</span>
          </div>
          <div class="d-flex align-center justify-space-between py-1">
            <span class="text-medium-emphasis">Valor</span>
            <span>{{ formatMoney(selectedCharge?.amount, selectedCharge?.currency) }}</span>
          </div>
          <div class="d-flex align-center justify-space-between py-1">
            <span class="text-medium-emphasis">Método</span>
            <span>{{ formatPaymentMethod(selectedCharge?.method) }}</span>
          </div>
          <div class="d-flex align-center justify-space-between py-1">
            <span class="text-medium-emphasis">Provedor</span>
            <span>{{ selectedCharge?.provider ?? "—" }}</span>
          </div>
          <div class="d-flex align-center justify-space-between py-1">
            <span class="text-medium-emphasis">Criado em</span>
            <span>{{ formatDate(selectedCharge?.createdAt) }}</span>
          </div>
          <div class="d-flex align-center justify-space-between py-1">
            <span class="text-medium-emphasis">Vencimento</span>
            <span>{{ formatDate(selectedCharge?.dueAt) }}</span>
          </div>
          <div class="d-flex align-center justify-space-between py-1">
            <span class="text-medium-emphasis">Pago em</span>
            <span>{{ formatDate(selectedCharge?.paidAt) }}</span>
          </div>
          <div class="d-flex align-center justify-space-between py-1">
            <span class="text-medium-emphasis">Descrição</span>
            <span>{{ selectedCharge?.description ?? "—" }}</span>
          </div>
          <div
            v-if="selectedCharge?.paymentUrl"
            class="d-flex align-center justify-space-between py-1"
          >
            <span class="text-medium-emphasis">Link</span>
            <v-btn
              size="small"
              variant="text"
              :href="selectedCharge?.paymentUrl"
              target="_blank"
              rel="noopener"
            >
              Abrir
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeLastCharge">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { adminService, type AdminClient } from "@/services/admin.service";

const headers = [
  { title: "Nome Fantasia", key: "tradeName" },
  { title: "Responsável", key: "responsibleName" },
  { title: "Telefone", key: "responsiblePhone" },
  { title: "Dias de Retenção", key: "retentionDays" },
  { title: "Instalações", key: "venueCount" },
  { title: "Status Pagamento", key: "paymentStatus" },
  { title: "Última Cobrança", key: "lastCharge" },
  { title: "Ações", key: "actions", sortable: false },
];

const items = ref<AdminClient[]>([]);
const total = ref(0);
const loading = ref(false);
const page = ref(1);
const itemsPerPage = ref(20);
const search = ref("");

const dialog = ref(false);
const saving = ref(false);
const dialogError = ref<string | null>(null);
const editedClient = ref<AdminClient | null>(null);
const editedTradeName = ref<string | null>(null);
const editedResponsibleName = ref<string | null>(null);
const editedResponsiblePhone = ref<string | null>(null);
const editedRetentionDays = ref<number | null>(null);

const chargeDialog = ref(false);
const selectedCharge = ref<AdminClient["lastCharge"] | null>(null);
const selectedChargeClient = ref<AdminClient | null>(null);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const paymentStatusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  canceled: "Cancelado",
  expired: "Expirado",
  refunded: "Estornado",
  failed: "Falhou",
  active: "Ativo",
  past_due: "Em atraso",
};

const paymentMethodLabels: Record<string, string> = {
  pix: "PIX",
  boleto: "Boleto",
  credit_card: "Cartão de crédito",
  debit_card: "Cartão de débito",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function formatPaymentStatus(status?: string | null) {
  if (!status) return "—";
  return paymentStatusLabels[status] ?? status;
}

function formatPaymentMethod(method?: string | null) {
  if (!method) return "—";
  return paymentMethodLabels[method] ?? method;
}

function formatMoney(amount?: string | null, currency?: string | null) {
  if (!amount) return "—";
  const numeric = Number.parseFloat(amount);
  if (!Number.isFinite(numeric)) {
    return currency ? `${amount} ${currency}` : amount;
  }
  if (!currency) return amount;
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${currency}`;
  }
}

function formatChargeDate(charge: AdminClient["lastCharge"]) {
  if (charge?.paidAt) return `Pago em ${dateFormatter.format(new Date(charge.paidAt))}`;
  if (charge?.dueAt) return `Vence em ${dateFormatter.format(new Date(charge.dueAt))}`;
  if (charge?.createdAt) return `Criado em ${dateFormatter.format(new Date(charge.createdAt))}`;
  return "";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return dateFormatter.format(new Date(value));
}

function formatLastCharge(charge: AdminClient["lastCharge"]) {
  if (!charge) return "—";
  const parts = [
    formatMoney(charge.amount, charge.currency),
    formatPaymentMethod(charge.method),
    formatPaymentStatus(charge.status),
  ];
  const dateText = formatChargeDate(charge);
  if (dateText) parts.push(dateText);
  return parts.filter(Boolean).join(" • ");
}

async function fetchClients() {
  loading.value = true;
  try {
    const response = await adminService.getClients({
      page: page.value,
      limit: itemsPerPage.value,
      search: search.value || undefined,
    });
    items.value = response.clients;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function openEdit(client: AdminClient) {
  editedClient.value = client;
  editedTradeName.value = client.tradeName ?? null;
  editedResponsibleName.value = client.responsibleName ?? null;
  editedResponsiblePhone.value = client.responsiblePhone ?? null;
  editedRetentionDays.value =
    typeof client.retentionDays === "number" ? client.retentionDays : null;
  dialogError.value = null;
  dialog.value = true;
}

function openLastCharge(client: AdminClient) {
  if (!client.lastCharge) return;
  selectedCharge.value = client.lastCharge;
  selectedChargeClient.value = client;
  chargeDialog.value = true;
}

function closeLastCharge() {
  chargeDialog.value = false;
  selectedCharge.value = null;
  selectedChargeClient.value = null;
}

function closeDialog() {
  dialog.value = false;
  editedClient.value = null;
  dialogError.value = null;
}

async function saveClient() {
  if (!editedClient.value?.id) return;
  saving.value = true;
  dialogError.value = null;
  try {
    await adminService.updateClient(editedClient.value.id, {
      tradeName: editedTradeName.value ?? null,
      responsibleName: editedResponsibleName.value ?? null,
      responsiblePhone: editedResponsiblePhone.value ?? null,
      retentionDays: editedRetentionDays.value ?? undefined,
    });
    await fetchClients();
    closeDialog();
  } catch (err: any) {
    dialogError.value = err?.message || "Não foi possível salvar o cliente.";
  } finally {
    saving.value = false;
  }
}

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    fetchClients();
  }, 350);
});

onMounted(fetchClients);
</script>
