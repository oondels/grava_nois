<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">Clientes</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Cadastrar cliente
      </v-btn>
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

        <div v-if="!isMobile">
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
                @click="openClientPayments(item)"
              >
                {{ formatLastCharge(item.lastCharge) }}
              </v-chip>
              <span v-else>—</span>
            </template>

            <template #item.actions="{ item }">
              <v-btn size="small" variant="text" @click="openEdit(item)">Editar</v-btn>
            </template>
          </v-data-table-server>
        </div>

        <div v-else class="d-flex flex-column ga-4">
          <v-progress-linear v-if="loading" indeterminate class="mb-2" />
          <v-alert
            v-else-if="items.length === 0"
            type="info"
            variant="tonal"
            class="mb-2"
          >
            Nenhum cliente encontrado.
          </v-alert>

          <v-card v-for="item in items" :key="item.id">
            <v-card-title class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ item.tradeName || item.legalName || "—" }}
                </div>
                <div
                  v-if="item.tradeName && item.legalName"
                  class="text-caption text-medium-emphasis"
                >
                  {{ item.legalName }}
                </div>
              </div>
              <div class="d-flex align-center ga-2">
                <v-chip size="x-small" variant="tonal">
                  {{ formatPaymentStatus(item.paymentStatus) }}
                </v-chip>
                <v-chip size="x-small" variant="tonal">
                  {{ item.venueCount ?? 0 }} inst.
                </v-chip>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" size="small" />
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="openEdit(item)">
                      <v-list-item-title>Editar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openChargesPanel(item)">
                      <v-list-item-title>Cobranças</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-card-title>
            <v-card-text class="pt-0">
              <div class="text-body-2">
                <span class="text-medium-emphasis">Responsável:</span>
                {{ item.responsibleName || "—" }}
              </div>
              <div class="text-body-2">
                <span class="text-medium-emphasis">Telefone:</span>
                {{ item.responsiblePhone || "—" }}
              </div>
              <div class="text-body-2">
                <span class="text-medium-emphasis">Retenção:</span>
                {{ item.retentionDays ?? "—" }}
              </div>
              <div class="text-body-2">
                <span class="text-medium-emphasis">Última cobrança:</span>
                {{ formatLastCharge(item.lastCharge) }}
              </div>
              <div class="d-flex justify-end mt-2">
                <v-btn size="small" variant="text" @click="openEdit(item)">
                  Editar cliente
                </v-btn>
              </div>
            </v-card-text>

            <v-expansion-panels
              variant="accordion"
              v-model="expandedCharges[item.id]"
              @update:modelValue="(value) => handleChargesPanelToggle(item, value)"
            >
              <v-expansion-panel>
                <v-expansion-panel-title>Cobranças</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-alert
                    v-if="getChargesState(item.id)?.error"
                    type="error"
                    variant="tonal"
                    class="mb-2"
                  >
                    {{ getChargesState(item.id)?.error }}
                  </v-alert>

                  <v-progress-linear
                    v-if="getChargesState(item.id)?.loading"
                    indeterminate
                    class="mb-2"
                  />

                  <div
                    v-if="getChargesState(item.id) && !getChargesState(item.id)?.loading && getChargesList(item.id).length === 0"
                    class="text-medium-emphasis text-body-2 py-2"
                  >
                    Nenhuma cobrança encontrada.
                  </div>

                  <v-list v-else-if="getChargesList(item.id).length > 0" density="compact">
                    <template v-for="(payment, index) in getChargesList(item.id)" :key="payment.id">
                      <v-list-item>
                        <v-list-item-title class="text-body-2">
                          {{ formatMoney(payment.amount, payment.currency) }}
                          •
                          {{ formatPaymentStatus(payment.status) }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-caption">
                          {{ formatDate(payment.createdAt) }}
                          •
                          {{ formatPaymentMethod(payment.method) }}
                          •
                          {{ payment.provider }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle
                          v-if="payment.description"
                          class="text-caption"
                        >
                          {{ payment.description }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-divider v-if="index < getChargesList(item.id).length - 1" />
                    </template>
                  </v-list>

                  <div
                    v-if="getChargesState(item.id)"
                    class="d-flex align-center justify-space-between mt-2"
                  >
                    <v-btn
                      size="small"
                      variant="text"
                      :disabled="!canPrevCharges(getChargesState(item.id)!)"
                      @click="prevChargesPage(item.id)"
                    >
                      Anterior
                    </v-btn>
                    <div class="text-caption">
                      Página {{ getChargesState(item.id)!.page }} de {{ getChargesTotalPages(item.id) }}
                    </div>
                    <v-btn
                      size="small"
                      variant="text"
                      :disabled="!canNextCharges(getChargesState(item.id)!)"
                      @click="nextChargesPage(item.id)"
                    >
                      Próximo
                    </v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card>

          <div v-if="totalPages > 1" class="d-flex align-center justify-center pt-2">
            <v-pagination
              v-model="page"
              :length="totalPages"
              @update:modelValue="fetchClients"
            />
          </div>
        </div>
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

    <v-dialog v-model="createDialog" max-width="680">
      <v-card>
        <v-card-title class="text-h6">Cadastrar cliente</v-card-title>
        <v-card-text class="pt-2">
          <v-text-field
            v-model="newLegalName"
            label="Nome / Razão Social *"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model="newTradeName"
            label="Nome fantasia"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model="newResponsibleEmail"
            label="Email do responsável *"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model="newResponsibleName"
            label="Nome do responsável"
            variant="outlined"
            density="comfortable"
          />
          <v-text-field
            v-model="newResponsiblePhone"
            label="Telefone do responsável"
            variant="outlined"
            density="comfortable"
          />
          <div class="d-flex ga-3 flex-wrap">
            <v-text-field
              v-model="newCnpj"
              label="CNPJ"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
            <v-text-field
              v-model="newResponsibleCpf"
              label="CPF do responsável"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
          </div>
          <div class="d-flex ga-3 flex-wrap">
            <v-select
              v-model="newProvider"
              :items="providerOptions"
              item-title="title"
              item-value="value"
              label="Provider *"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
            <v-text-field
              v-model.number="newRetentionDays"
              type="number"
              min="1"
              label="Dias de retenção"
              variant="outlined"
              density="comfortable"
              class="flex-1-1"
            />
          </div>

          <v-checkbox
            v-model="includeVenueData"
            label="Cadastrar instalação (venue) agora"
            color="primary"
            hide-details
            class="mt-1"
          />

          <v-expand-transition>
            <div v-if="includeVenueData" class="mt-3">
              <v-text-field
                v-model="newVenueName"
                label="Nome da instalação *"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="newVenueDescription"
                label="Descrição da instalação"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="newVenueAddressLine"
                label="Endereço"
                variant="outlined"
                density="comfortable"
              />
              <div class="d-flex ga-3 flex-wrap">
                <v-text-field
                  v-model="newVenueCountryCode"
                  maxlength="2"
                  label="País (ISO-2)"
                  variant="outlined"
                  density="comfortable"
                  class="flex-1-1"
                />
                <v-text-field
                  v-model="newVenueState"
                  label="Estado"
                  variant="outlined"
                  density="comfortable"
                  class="flex-1-1"
                />
                <v-text-field
                  v-model="newVenueCity"
                  label="Cidade"
                  variant="outlined"
                  density="comfortable"
                  class="flex-1-1"
                />
              </div>
              <div class="d-flex ga-3 flex-wrap">
                <v-text-field
                  v-model="newVenuePostalCode"
                  label="CEP"
                  variant="outlined"
                  density="comfortable"
                  class="flex-1-1"
                />
                <v-text-field
                  v-model="newVenueLatitude"
                  label="Latitude"
                  variant="outlined"
                  density="comfortable"
                  class="flex-1-1"
                />
                <v-text-field
                  v-model="newVenueLongitude"
                  label="Longitude"
                  variant="outlined"
                  density="comfortable"
                  class="flex-1-1"
                />
              </div>
            </div>
          </v-expand-transition>

          <v-alert v-if="createDialogError" type="error" variant="tonal" class="mt-2">
            {{ createDialogError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeCreateDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="creating" @click="createClient">
            Cadastrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="paymentsDialog" max-width="720">
      <v-card>
        <v-card-title class="text-h6">Cobranças do cliente</v-card-title>
        <v-card-text class="pt-2">
          <div class="text-medium-emphasis mb-4">
            {{ paymentsClient?.tradeName || paymentsClient?.legalName || "—" }}
          </div>

          <v-alert
            v-if="activePaymentsState?.error"
            type="error"
            variant="tonal"
            class="mb-3"
          >
            {{ activePaymentsState?.error }}
          </v-alert>

          <v-progress-linear
            v-if="activePaymentsState?.loading"
            indeterminate
            class="mb-3"
          />

          <div
            v-if="activePaymentsState && !activePaymentsState.loading && activePaymentsList.length === 0"
            class="text-medium-emphasis text-body-2 py-2"
          >
            Nenhuma cobrança encontrada.
          </div>

          <v-list v-else-if="activePaymentsList.length > 0" density="compact">
            <template v-for="(payment, index) in activePaymentsList" :key="payment.id">
              <v-list-item>
                <v-list-item-title class="text-body-2">
                  {{ formatMoney(payment.amount, payment.currency) }}
                  •
                  {{ formatPaymentStatus(payment.status) }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatDate(payment.createdAt) }}
                  •
                  {{ formatPaymentMethod(payment.method) }}
                  •
                  {{ payment.provider }}
                </v-list-item-subtitle>
                <v-list-item-subtitle
                  v-if="payment.description"
                  class="text-caption"
                >
                  {{ payment.description }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider v-if="index < activePaymentsList.length - 1" />
            </template>
          </v-list>

          <div
            v-if="activePaymentsState"
            class="d-flex align-center justify-space-between mt-3"
          >
            <v-btn
              size="small"
              variant="text"
              :disabled="!canPrevCharges(activePaymentsState)"
              @click="prevChargesPage(paymentsClient!.id)"
            >
              Anterior
            </v-btn>
            <div class="text-caption">
              Página {{ activePaymentsState.page }} de {{ activePaymentsTotalPages }}
            </div>
            <v-btn
              size="small"
              variant="text"
              :disabled="!canNextCharges(activePaymentsState)"
              @click="nextChargesPage(paymentsClient!.id)"
            >
              Próximo
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeClientPayments">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useDisplay } from "vuetify";
import {
  adminService,
  type AdminClient,
  type AdminPayment,
  type CreateClientPayload,
} from "@/services/admin.service";

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

const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);

const items = ref<AdminClient[]>([]);
const total = ref(0);
const loading = ref(false);
const page = ref(1);
const itemsPerPage = ref(20);
const search = ref("");
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / itemsPerPage.value)));

const dialog = ref(false);
const saving = ref(false);
const dialogError = ref<string | null>(null);
const editedClient = ref<AdminClient | null>(null);
const editedTradeName = ref<string | null>(null);
const editedResponsibleName = ref<string | null>(null);
const editedResponsiblePhone = ref<string | null>(null);
const editedRetentionDays = ref<number | null>(null);

const createDialog = ref(false);
const creating = ref(false);
const createDialogError = ref<string | null>(null);
const newLegalName = ref("");
const newTradeName = ref("");
const newResponsibleEmail = ref("");
const newResponsibleName = ref("");
const newResponsiblePhone = ref("");
const newCnpj = ref("");
const newResponsibleCpf = ref("");
const newProvider = ref<"abacate_pay" | "manual">("abacate_pay");
const newRetentionDays = ref<number>(3);
const includeVenueData = ref(false);
const newVenueName = ref("");
const newVenueDescription = ref("");
const newVenueAddressLine = ref("");
const newVenueCountryCode = ref("");
const newVenueState = ref("");
const newVenueCity = ref("");
const newVenuePostalCode = ref("");
const newVenueLatitude = ref("");
const newVenueLongitude = ref("");

const paymentsDialog = ref(false);
const paymentsClient = ref<AdminClient | null>(null);

type ClientChargesState = {
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: string | null;
  pages: Record<number, AdminPayment[]>;
  requestId: number;
};

const CHARGES_LIMIT = 5;
const chargesStateByClientId = reactive<Record<string, ClientChargesState>>({});
const expandedCharges = reactive<Record<string, number | undefined>>({});

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const paymentStatusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  canceled: "Cancelado",
  expired: "Expirado",
  refunded: "Estornado",
  partially_refunded: "Parcialmente estornado",
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

const providerOptions = [
  { title: "Abacate Pay", value: "abacate_pay" as const },
  { title: "Manual", value: "manual" as const },
];

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

const activePaymentsState = computed(() => {
  if (!paymentsClient.value) return null;
  return chargesStateByClientId[paymentsClient.value.id] ?? null;
});

const activePaymentsList = computed(() => {
  if (!paymentsClient.value) return [];
  const state = chargesStateByClientId[paymentsClient.value.id];
  if (!state) return [];
  return state.pages[state.page] ?? [];
});

const activePaymentsTotalPages = computed(() => {
  if (!activePaymentsState.value) return 1;
  return Math.max(1, Math.ceil(activePaymentsState.value.total / activePaymentsState.value.limit));
});

function ensureChargesState(clientId: string): ClientChargesState {
  if (!chargesStateByClientId[clientId]) {
    chargesStateByClientId[clientId] = {
      page: 1,
      limit: CHARGES_LIMIT,
      total: 0,
      loading: false,
      error: null,
      pages: {},
      requestId: 0,
    };
  }

  return chargesStateByClientId[clientId];
}

function getChargesState(clientId: string): ClientChargesState | null {
  return chargesStateByClientId[clientId] ?? null;
}

function getChargesList(clientId: string): AdminPayment[] {
  const state = chargesStateByClientId[clientId];
  return state?.pages[state.page] ?? [];
}

function getChargesTotalPages(clientId: string): number {
  const state = getChargesState(clientId);
  if (!state) return 1;
  return Math.max(1, Math.ceil(state.total / state.limit));
}

function canPrevCharges(state: ClientChargesState): boolean {
  return state.page > 1;
}

function canNextCharges(state: ClientChargesState): boolean {
  return state.page < Math.max(1, Math.ceil(state.total / state.limit));
}

async function fetchCharges(clientId: string, pageOverride?: number) {
  const state = ensureChargesState(clientId);
  const targetPage = pageOverride ?? state.page;
  state.page = targetPage;

  if (state.pages[targetPage]) {
    return;
  }

  const requestId = ++state.requestId;
  state.loading = true;
  state.error = null;

  try {
    const response = await adminService.getClientPayments(clientId, {
      page: targetPage,
      limit: state.limit,
    });

    if (requestId !== state.requestId) {
      return;
    }

    state.pages[targetPage] = response.payments;
    state.total = response.total;
    state.page = response.page;
    state.limit = response.limit;
  } catch (err: any) {
    if (requestId !== state.requestId) {
      return;
    }

    state.error = err?.message || "Não foi possível carregar as cobranças.";
  } finally {
    if (requestId === state.requestId) {
      state.loading = false;
    }
  }
}

function goToChargesPage(clientId: string, pageNumber: number) {
  const state = ensureChargesState(clientId);
  const totalPages = Math.max(1, Math.ceil(state.total / state.limit));
  const targetPage = Math.min(Math.max(1, pageNumber), totalPages);
  state.page = targetPage;

  if (!state.pages[targetPage]) {
    void fetchCharges(clientId, targetPage);
  }
}

function nextChargesPage(clientId: string) {
  const state = ensureChargesState(clientId);
  if (!canNextCharges(state)) return;
  goToChargesPage(clientId, state.page + 1);
}

function prevChargesPage(clientId: string) {
  const state = ensureChargesState(clientId);
  if (!canPrevCharges(state)) return;
  goToChargesPage(clientId, state.page - 1);
}

function handleChargesPanelToggle(
  client: AdminClient,
  value: number | number[] | undefined | unknown
) {
  const isOpen = Array.isArray(value) ? value.length > 0 : value === 0;
  if (!isOpen) return;
  const state = ensureChargesState(client.id);
  if (!state.pages[state.page]) {
    void fetchCharges(client.id, state.page);
  }
}

function openChargesPanel(client: AdminClient) {
  expandedCharges[client.id] = 0;
  handleChargesPanelToggle(client, 0);
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

function normalizeOptionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function openCreateDialog() {
  createDialogError.value = null;
  newLegalName.value = "";
  newTradeName.value = "";
  newResponsibleEmail.value = "";
  newResponsibleName.value = "";
  newResponsiblePhone.value = "";
  newCnpj.value = "";
  newResponsibleCpf.value = "";
  newProvider.value = "abacate_pay";
  newRetentionDays.value = 3;
  includeVenueData.value = false;
  newVenueName.value = "";
  newVenueDescription.value = "";
  newVenueAddressLine.value = "";
  newVenueCountryCode.value = "";
  newVenueState.value = "";
  newVenueCity.value = "";
  newVenuePostalCode.value = "";
  newVenueLatitude.value = "";
  newVenueLongitude.value = "";
  createDialog.value = true;
}

function closeCreateDialog() {
  createDialog.value = false;
  createDialogError.value = null;
}

function validateCreateClientPayload() {
  if (!newLegalName.value.trim()) {
    createDialogError.value = "Informe o nome/razão social.";
    return false;
  }

  if (!newResponsibleEmail.value.trim()) {
    createDialogError.value = "Informe o email do responsável.";
    return false;
  }

  if (!newCnpj.value.trim() && !newResponsibleCpf.value.trim()) {
    createDialogError.value = "Informe CNPJ ou CPF do responsável.";
    return false;
  }

  if (includeVenueData.value && !newVenueName.value.trim()) {
    createDialogError.value = "Informe o nome da instalação.";
    return false;
  }

  return true;
}

async function createClient() {
  if (!validateCreateClientPayload()) return;

  creating.value = true;
  createDialogError.value = null;

  const payload: CreateClientPayload = {
    legalName: newLegalName.value.trim(),
    responsibleEmail: newResponsibleEmail.value.trim(),
    provider: newProvider.value,
    retentionDays: newRetentionDays.value > 0 ? newRetentionDays.value : 3,
    tradeName: normalizeOptionalText(newTradeName.value),
    responsibleName: normalizeOptionalText(newResponsibleName.value),
    responsiblePhone: normalizeOptionalText(newResponsiblePhone.value),
    cnpj: normalizeOptionalText(newCnpj.value),
    responsibleCpf: normalizeOptionalText(newResponsibleCpf.value),
  };

  if (includeVenueData.value) {
    payload.venueData = {
      venueName: newVenueName.value.trim(),
      description: normalizeOptionalText(newVenueDescription.value),
      addressLine: normalizeOptionalText(newVenueAddressLine.value),
      countryCode: normalizeOptionalText(newVenueCountryCode.value)?.toUpperCase(),
      state: normalizeOptionalText(newVenueState.value),
      city: normalizeOptionalText(newVenueCity.value),
      postalCode: normalizeOptionalText(newVenuePostalCode.value),
      latitude: normalizeOptionalText(newVenueLatitude.value),
      longitude: normalizeOptionalText(newVenueLongitude.value),
    };
  }

  try {
    await adminService.createClient(payload);
    await fetchClients();
    closeCreateDialog();
  } catch (err: any) {
    createDialogError.value = err?.message || "Não foi possível cadastrar o cliente.";
  } finally {
    creating.value = false;
  }
}

function openClientPayments(client: AdminClient) {
  paymentsClient.value = client;
  paymentsDialog.value = true;
  const state = ensureChargesState(client.id);
  if (!state.pages[state.page]) {
    void fetchCharges(client.id, state.page);
  }
}

function closeClientPayments() {
  paymentsDialog.value = false;
  paymentsClient.value = null;
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

watch(includeVenueData, (enabled) => {
  if (enabled) return;
  newVenueName.value = "";
  newVenueDescription.value = "";
  newVenueAddressLine.value = "";
  newVenueCountryCode.value = "";
  newVenueState.value = "";
  newVenueCity.value = "";
  newVenuePostalCode.value = "";
  newVenueLatitude.value = "";
  newVenueLongitude.value = "";
});

onMounted(fetchClients);
</script>
