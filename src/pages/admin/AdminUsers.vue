<template>
  <v-container fluid class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 font-weight-bold">Usuários</h1>
    </div>

    <v-card>
      <v-card-text>
        <div class="d-flex flex-wrap ga-3 mb-4">
          <v-text-field
            v-model="search"
            label="Buscar por nome ou email"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="flex-1-1"
          />
          <v-select
            v-model="roleFilter"
            :items="roleOptions"
            label="Role"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="min-w-160"
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
          @update:options="fetchUsers"
        >
          <template #item.role="{ item }">
            <v-chip
              size="small"
              :color="item.role === 'admin' ? 'primary' : 'secondary'"
              variant="tonal"
            >
              {{ item.role || "common" }}
            </v-chip>
          </template>

          <template #item.isActive="{ item }">
            <v-chip size="small" :color="item.isActive ? 'success' : 'error'" variant="tonal">
              {{ item.isActive ? "Ativo" : "Inativo" }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn size="small" variant="text" @click="openEdit(item)">Editar</v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
        <v-card-title class="text-h6">Editar usuário</v-card-title>
        <v-card-text class="pt-2">
          <div class="text-medium-emphasis mb-4">{{ editedUser?.email }}</div>
          <v-select
            v-model="editedUserRole"
            :items="['common', 'admin']"
            label="Role"
            variant="outlined"
            density="comfortable"
          />
          <v-switch
            v-model="editedUserActive"
            label="Usuário ativo"
            color="success"
            inset
          />
          <v-alert v-if="dialogError" type="error" variant="tonal" class="mt-2">
            {{ dialogError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveUser">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { adminService, type AdminUser } from "@/services/admin.service";

const headers = [
  // { title: "ID", key: "id" },
  { title: "Nome", key: "name" },
  { title: "Email", key: "email" },
  { title: "Role", key: "role" },
  { title: "Status", key: "isActive" },
  { title: "Ações", key: "actions", sortable: false },
];

const items = ref<AdminUser[]>([]);
const total = ref(0);
const loading = ref(false);
const page = ref(1);
const itemsPerPage = ref(20);
const search = ref("");
const roleFilter = ref<string | null>(null);
const roleOptions = ["admin", "common"];

const dialog = ref(false);
const saving = ref(false);
const dialogError = ref<string | null>(null);
const editedUser = ref<AdminUser | null>(null);
const editedUserRole = ref("common");
const editedUserActive = ref(true);

async function fetchUsers() {
  loading.value = true;
  try {
    const response = await adminService.getUsers({
      page: page.value,
      limit: itemsPerPage.value,
      search: search.value || undefined,
      role: roleFilter.value || undefined,
    });
    items.value = response.users;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
}

function openEdit(user: AdminUser) {
  editedUser.value = user;
  editedUserRole.value = user.role || "common";
  editedUserActive.value = Boolean(user.isActive);
  dialogError.value = null;
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  editedUser.value = null;
  dialogError.value = null;
}

async function saveUser() {
  if (!editedUser.value?.id) return;
  saving.value = true;
  dialogError.value = null;
  try {
    await adminService.updateUser(editedUser.value.id, {
      role: editedUserRole.value,
      isActive: editedUserActive.value,
    });
    await fetchUsers();
    closeDialog();
  } catch (err: any) {
    dialogError.value = err?.message || "Não foi possível salvar o usuário.";
  } finally {
    saving.value = false;
  }
}

onMounted(fetchUsers);
</script>
