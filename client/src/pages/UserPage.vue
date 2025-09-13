<template>
  <div class="user-page">
    <!-- Botão de voltar no topo esquerdo -->
    <div class="back-button-container">
      <button @click="goBack" class="back-button" aria-label="Voltar">
        <ArrowLeftIcon class="back-icon" />
      </button>
    </div>

    <!-- Header com foto e informações básicas -->
    <div class="user-header">
      <div class="user-avatar-container">
        <img :src="user?.avatar_url || LogoGravaNoisSimbol" alt="Foto de perfil" class="user-avatar" />

        <button
          @click="showProfileEdit = true"
          disabled="true"
          class="edit-avatar-btn"
          aria-label="Editar foto de perfil"
        >
          <Edit3Icon class="edit-icon" />
        </button>
      </div>

      <div class="user-info">
        <h1 class="user-name">{{ formatUserName(user?.name )|| "Usuário" }}</h1>
        <p class="user-email">{{ user?.email || "email@exemplo.com" }}</p>
        <div class="user-status"></div>
      </div>
    </div>

    <!-- Menu de opções -->
    <div class="user-menu">
      <div v-for="section in menuSections" :key="section.id" class="menu-section">
        <h2 class="section-title">
          <component :is="section.icon" class="section-icon" />
          {{ section.title }}
        </h2>

        <div class="menu-items">
          <div
            v-for="item in section.items"
            :key="item.id"
            :class="['menu-item', { 'menu-item--coming-soon': item.comingSoon }]"
            @click="item.comingSoon ? null : handleItemClick(item)"
          >
            <div class="menu-item-content">
              <component :is="item.icon" class="menu-item-icon" />
              <div class="menu-item-text">
                <span class="menu-item-title">{{ item.title }}</span>
                <span class="menu-item-subtitle">{{ item.subtitle }}</span>
              </div>
            </div>
            <ChevronRightIcon class="menu-item-arrow" />

            <!-- Badge "Em breve" -->
            <span v-if="item.comingSoon" class="coming-soon-badge"> Em breve </span>
          </div>
        </div>
      </div>

      <!-- Botão de Logout -->
      <div class="logout-section">
        <v-btn @click="handleLogout" color="error" variant="outlined" size="large" block class="logout-btn">
          <LogOutIcon class="me-2" />
          Sair da Conta
        </v-btn>
      </div>
    </div>

    <!-- Modal: Editar Perfil -->
    <v-dialog v-model="showProfileEdit" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <UserIcon class="me-2" />
          Editar Perfil
          <span
            class="absolute -right-3 -top-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/90 text-black font-semibold"
            >breve</span
          >
        </v-card-title>

        <v-card-text>
          <v-form ref="profileFormRef" @submit.prevent="saveProfile">
            <v-text-field
              v-model="profileForm.name"
              label="Nome completo"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              class="mb-3"
            />

            <v-text-field
              v-model="profileForm.email"
              label="Email"
              type="email"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.email]"
              class="mb-3"
            />

            <v-text-field
              v-model="profileForm.phone"
              label="Telefone (opcional)"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showProfileEdit = false" variant="text"> Cancelar </v-btn>
          <v-btn @click="saveProfile" color="primary" variant="flat" :loading="savingProfile"> Salvar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal: Editar Localização -->
    <v-dialog v-model="showLocationEdit" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <MapPinIcon class="me-2" />
          Editar Localização
        </v-card-title>

        <v-card-text>
          <v-form ref="locationFormRef" @submit.prevent="saveLocation">
            <v-text-field
              v-model="locationForm.cep"
              label="CEP"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.cep]"
              class="mb-3"
              @blur="autoFillAddress"
            />

            <v-text-field
              v-model="locationForm.address"
              label="Endereço"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              class="mb-3"
            />

            <v-text-field
              v-model="locationForm.city"
              label="Cidade"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              class="mb-3"
            />

            <v-text-field
              v-model="locationForm.state"
              label="Estado"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
              class="mb-3"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showLocationEdit = false" variant="text"> Cancelar </v-btn>
          <v-btn @click="saveLocation" color="primary" variant="flat" :loading="savingLocation"> Salvar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal: Quadras Vinculadas -->
    <v-dialog v-model="showQuadras" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <BuildingIcon class="me-2" />
          Minhas Quadras
        </v-card-title>

        <v-card-text>
          <div v-if="quadrasVinculadas.length === 0" class="text-center py-8">
            <BuildingIcon class="text-h1 text-medium-emphasis mb-3" />
            <h3 class="text-h6 mb-2">Nenhuma quadra vinculada</h3>
            <p class="text-body-2 text-medium-emphasis">Você ainda não está vinculado a nenhum local esportivo.</p>
          </div>

          <div v-else class="quadras-list">
            <div v-for="quadra in quadrasVinculadas" :key="quadra.id" class="quadra-item">
              <div class="quadra-info">
                <h4 class="quadra-name">{{ quadra.name }}</h4>
                <p class="quadra-address">{{ quadra.address }}</p>
                <div class="quadra-sports">
                  <v-chip
                    v-for="sport in quadra.sports"
                    :key="sport"
                    :color="getSportColor(sport)"
                    size="small"
                    variant="flat"
                    class="me-1 mb-1"
                  >
                    {{ getSportLabel(sport) }}
                  </v-chip>
                </div>
              </div>

              <div class="quadra-status">
                <v-chip :color="quadra.active ? 'success' : 'warning'" size="small" variant="flat">
                  {{ quadra.active ? "Ativo" : "Inativo" }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showQuadras = false" color="primary" variant="flat"> Fechar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar: agora global via AppLayout + useSnackbar() -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import {
  UserIcon,
  MapPinIcon,
  SettingsIcon,
  MapIcon,
  BuildingIcon,
  PlusIcon,
  ShieldIcon,
  LockIcon,
  SmartphoneIcon,
  HelpCircleIcon,
  MessageCircleIcon,
  MailIcon,
  LogOutIcon,
  Edit3Icon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "lucide-vue-next";
import LogoGravaNoisSimbol from "@/assets/icons/grava-nois-simbol.webp";
import { getSportColor, getSportLabel } from "@/utils/formatters";
import { useSnackbar } from "@/composables/useSnackbar";

const router = useRouter();
const authStore = useAuthStore();

// Dados do usuário (sanitizados)
const user = computed(() => authStore.safeUser);

// Estados dos modais
const showProfileEdit = ref(false);
const showLocationEdit = ref(false);
const showPreferences = ref(false);
const showQuadras = ref(false);
const showAddQuadra = ref(false);
const showPasswordChange = ref(false);
const showTwoFactor = ref(false);
const showContactSupport = ref(false);

// Estados de loading
const savingProfile = ref(false);
const savingLocation = ref(false);

// Snackbar global
const { showSnackbar: notify } = useSnackbar();

// Formulários
const profileForm = reactive({
  name: "",
  email: "",
  phone: "",
});

const locationForm = reactive({
  cep: "",
  address: "",
  city: "",
  state: "",
});

const formatUserName = (name: string) => {
  if (!name) return "Usuário";
  return name.split(" ")[0] + " " + name.split(" ")[name.split(" ").length - 1];
}

// Regras de validação
const rules = {
  required: (value: string) => !!value || "Campo obrigatório",
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || "Email inválido";
  },
  cep: (value: string) => {
    const pattern = /^\d{5}-?\d{3}$/;
    return pattern.test(value) || "CEP inválido";
  },
};

// Mock de quadras vinculadas
const quadrasVinculadas = ref([
  {
    id: "1",
    name: "Quadra do Zé",
    address: "Rua das Flores, 123 - Centro",
    sports: ["futebol", "futevolei"],
    active: true,
  },
  {
    id: "2",
    name: "Ginásio Municipal",
    address: "Av. Principal, 456 - Bairro Novo",
    sports: ["basquete", "volei"],
    active: true,
  },
]);

// Array de seções e opções do menu
const menuSections = ref([
  {
    id: "profile",
    title: "Perfil e Configurações",
    icon: UserIcon,
    items: [
      {
        id: "edit-profile",
        title: "Editar Perfil",
        subtitle: "Nome, email e informações pessoais",
        icon: UserIcon,
        action: "showProfileEdit",
        comingSoon: true,
      },
      {
        id: "location",
        title: "Localização",
        subtitle: "Endereço e cidade",
        icon: MapPinIcon,
        action: "showLocationEdit",
        comingSoon: true,
      },
      {
        id: "preferences",
        title: "Preferências",
        subtitle: "Notificações e privacidade",
        icon: SettingsIcon,
        action: "showPreferences",
        comingSoon: true,
      },
    ],
  },
  {
    id: "quadras",
    title: "Minhas Quadras",
    icon: MapIcon,
    items: [
      {
        id: "quadras-vinculadas",
        title: "Quadras Vinculadas",
        subtitle: `${quadrasVinculadas.value.length} local(is) ativo(s)`,
        icon: BuildingIcon,
        action: "showQuadras",
        comingSoon: true,
      },
      {
        id: "add-quadra",
        title: "Adicionar Quadra",
        subtitle: "Vincular novo local esportivo",
        icon: PlusIcon,
        action: "showAddQuadra",
        comingSoon: true,
      },
    ],
  },
  {
    id: "security",
    title: "Conta e Segurança",
    icon: ShieldIcon,
    items: [
      {
        id: "change-password",
        title: "Alterar Senha",
        subtitle: "Atualizar credenciais de acesso",
        icon: LockIcon,
        action: "showPasswordChange",
        comingSoon: true,
      },
      {
        id: "two-factor",
        title: "Autenticação 2FA",
        subtitle: "Segurança adicional para sua conta",
        icon: SmartphoneIcon,
        action: "showTwoFactor",
        comingSoon: true,
      },
    ],
  },
  {
    id: "support",
    title: "Suporte e Ajuda",
    icon: HelpCircleIcon,
    items: [
      {
        id: "help-center",
        title: "Central de Ajuda",
        subtitle: "FAQ e tutoriais",
        icon: MessageCircleIcon,
        action: "navigateToSuporte",
        comingSoon: true,
      },
      {
        id: "contact-support",
        title: "Contatar Suporte",
        subtitle: "Enviar mensagem para nossa equipe",
        icon: MailIcon,
        action: "showContactSupport",
        comingSoon: true,
      },
    ],
  },
]);

// Função para gerenciar cliques nos itens do menu
const handleItemClick = (item: any) => {
  if (item.comingSoon) return;

  switch (item.action) {
    case "showProfileEdit":
      showProfileEdit.value = true;
      break;
    case "showLocationEdit":
      showLocationEdit.value = true;
      break;
    case "showPreferences":
      // Funcionalidade em breve
      break;
    case "showQuadras":
      showQuadras.value = true;
      break;
    case "showAddQuadra":
      // Funcionalidade em breve
      break;
    case "showPasswordChange":
      // Funcionalidade em breve
      break;
    case "showTwoFactor":
      // Funcionalidade em breve
      break;
    case "navigateToSuporte":
      router.push("/suporte");
      break;
    case "showContactSupport":
      // Funcionalidade em breve
      break;
  }
};

const handleLogout = () => {
  authStore.signOut();
  router.push("/login");
  notify("Logout realizado com sucesso!", "success");
};

const saveProfile = async () => {
  savingProfile.value = true;

  try {
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showProfileEdit.value = false;
    notify("Perfil atualizado com sucesso!", "success");

    // Reset form
    profileForm.name = "";
    profileForm.email = "";
    profileForm.phone = "";
  } catch (error) {
    notify("Erro ao salvar perfil", "error");
  } finally {
    savingProfile.value = false;
  }
};

const saveLocation = async () => {
  savingLocation.value = true;

  try {
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showLocationEdit.value = false;
    notify("Localização atualizada com sucesso!", "success");

    // Reset form
    locationForm.cep = "";
    locationForm.address = "";
    locationForm.city = "";
    locationForm.state = "";
  } catch (error) {
    notify("Erro ao salvar localização", "error");
  } finally {
    savingLocation.value = false;
  }
};

const autoFillAddress = () => {
  // Simular preenchimento automático por CEP
  if (locationForm.cep === "12345-678") {
    locationForm.address = "Rua Exemplo, 123";
    locationForm.city = "São Paulo";
    locationForm.state = "SP";
  }
};

// Removido: snackbar local; padronizado para useSnackbar() global

const goBack = () => {
  router.back();
};

// Inicialização
onMounted(() => {
  // if (user.value) {
  //   profileForm.name = user.value.name
  //   profileForm.email = user.value.email
  // }
});
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  background: var(--v-theme-background);
  padding-bottom: 80px; /* Espaço para bottom navigation */
}

.back-button-container {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.back-button-container:hover {
  background: rgba(var(--v-theme-primary), 0.9);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.back-icon {
  width: 20px;
  height: 20px;
  color: var(--v-theme-on-surface);
  transition: color 0.2s ease;
}

.back-button-container:hover .back-icon {
  color: white;
}

.user-header {
  background: linear-gradient(135deg, var(--v-theme-primary) 0%, var(--v-theme-secondary) 100%);
  padding: 32px 24px 24px;
  text-align: center;
  color: white;
}

.user-avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.user-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--v-theme-surface);
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-avatar-btn:hover {
  transform: scale(1.1);
  background: var(--v-theme-primary);
}

.edit-icon {
  width: 16px;
  height: 16px;
  color: var(--v-theme-primary);
}

.edit-avatar-btn:hover .edit-icon {
  color: white;
}

.user-info {
  text-align: center;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.user-email {
  font-size: 14px;
  margin: 0 0 12px;
  opacity: 0.9;
}

.user-menu {
  padding: 24px 16px;
}

.menu-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--v-theme-on-surface);
}

.section-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: var(--v-theme-primary);
}

.menu-items {
  background: var(--v-theme-surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.menu-item--coming-soon {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.menu-item--coming-soon:hover {
  background: none;
}

.menu-item-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-item-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  color: var(--v-theme-primary);
}

.menu-item-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.menu-item-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--v-theme-on-surface);
  margin-bottom: 2px;
}

.menu-item-subtitle {
  font-size: 12px;
  color: var(--v-theme-medium-emphasis);
}

.menu-item-arrow {
  width: 20px;
  height: 20px;
  color: var(--v-theme-medium-emphasis);
}

.coming-soon-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f59e0b;
  color: black;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  white-space: nowrap;
  z-index: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.logout-section {
  margin-top: 32px;
  padding: 0 16px;
}

.logout-btn {
  border-radius: 12px;
  font-weight: 500;
}

.quadras-list {
  max-height: 400px;
  overflow-y: auto;
}

.quadra-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 8px;
  margin-bottom: 12px;
}

.quadra-info {
  flex: 1;
}

.quadra-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--v-theme-on-surface);
}

.quadra-address {
  font-size: 14px;
  margin: 0 0 8px;
  color: var(--v-theme-medium-emphasis);
}

.quadra-sports {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.quadra-status {
  margin-left: 16px;
}

.back-button-container {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.back-button-container:hover {
  background: rgba(var(--v-theme-primary), 0.9);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.back-icon {
  width: 20px;
  height: 20px;
  color: var(--v-theme-on-surface);
  transition: color 0.2s ease;
}

.back-button-container:hover .back-icon {
  color: white;
}

/* Responsividade */
@media (min-width: 768px) {
  .user-page {
    max-width: 600px;
    margin: 0 auto;
  }

  .user-header {
    border-radius: 0 0 24px 24px;
  }
}

@media (min-width: 1024px) {
  .user-page {
    max-width: 800px;
  }
}
</style>
