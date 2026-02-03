// stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { BASE_URL } from "@/config/ip";

export type AuthRole = "common" | "admin" | string;

export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  emailVerified: boolean;
  role: AuthRole;
  avatarUrl: string | null;
  country?: string;
  state?: string;
  city?: string;
  cep?: string;
  quadrasFiliadas?: string[];
}

export interface AuthSession {
  user: AuthUser;
  loggedAt: string;
  provider: string;
}

export interface GoogleLoginResponse {
  user: AuthUser;
  status: number;
  message: string;
}

export const useAuthStore = defineStore("auth", () => {
  const session = ref<AuthSession | null>(null);
  const loading = ref(false);

  const isCheckingUser = ref(false)
  const isReady = ref(false);
  let initPromise: Promise<void> | null = null;

  const user = computed<AuthUser | null>(() => session?.value?.user ?? null);
  const isAuthenticated = computed(() => session.value !== null);
  const isGoogleUser = computed(() => session.value?.provider === "google");

  // Sinalização para sugerir sincronização de dados do Google -> Perfil
  type SyncSuggestion = {
    name?: { current: string | null | undefined; google: string | null | undefined };
    avatarUrl?: { current: string | null | undefined; google: string | null | undefined };
  } | null;
  const needsGoogleSyncPrompt = ref(false);
  const googleSyncSuggestion = ref<SyncSuggestion>(null);

  const safeUser = computed(() =>
    user.value
      ? {
        id: user.value.id,
        email: user.value.email,
        name: user.value.name,
        avatarUrl: user.value.avatarUrl,
        emailVerified: user.value.emailVerified,
        role: user.value.role,
        username: user.value.username,
        localization: {
          country: user.value.country,
          state: user.value.state,
          city: user.value.city,
          cep: user.value.cep,
        },
        quadrasFiliadas: user.value.quadrasFiliadas || [],
      }
      : null
  );

  function buildAuthUser(raw: any): AuthUser {
    return {
      email: raw.email,
      name: raw.name,
      username: raw.username,
      emailVerified: raw.emailVerified,
      role: raw.role,
      avatarUrl: raw.avatarUrl,
      id: raw.id,
      country: raw.country,
      state: raw.state,
      city: raw.city,
      cep: raw.cep,
      quadrasFiliadas: raw.quadrasFiliadas || [],
    };
  }

  async function refreshUserData() {
    try {
      const { data } = await axios.get(`${BASE_URL}/auth/me`, { withCredentials: true });
      const foundedUser = data.foundedUser;
      if (!foundedUser) return null;

      session.value = {
        user: buildAuthUser(foundedUser),
        loggedAt: new Date().toISOString(),
        provider: data.provider || session.value?.provider || "email",
      };

      isReady.value = true;
      return session.value;
    } catch {
      return null;
    }
  }

  async function afterAuthSuccess(sessionOrUser?: AuthSession | AuthUser | null, providerOverride?: string) {
    if (sessionOrUser) {
      const provider =
        providerOverride ||
        ("provider" in sessionOrUser ? sessionOrUser.provider : undefined) ||
        session.value?.provider ||
        "email";

      const nextUser = "user" in sessionOrUser ? sessionOrUser.user : sessionOrUser;
      session.value = {
        user: buildAuthUser(nextUser),
        loggedAt: new Date().toISOString(),
        provider,
      };

      isReady.value = true;
    }

    await refreshUserData();
  }

  async function init() {
    isCheckingUser.value = true;

    try {
      const { data } = await axios.get(`${BASE_URL}/auth/me`, { withCredentials: true });
      const user = data.foundedUser;

      session.value = {
        user: buildAuthUser(user),
        loggedAt: new Date().toISOString(),
        provider: data.provider || 'email'
      }
    } catch (error: any) {
      session.value = null;
    }
    finally {
      isCheckingUser.value = false;
      isReady.value = true;
    }
  }

  async function ensureReady(): Promise<void> {
    if (isReady.value) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      await init();
    })().finally(() => {
      initPromise = null;
    });

    return initPromise;
  }

  // Register New User
  async function signUpNewUser(email: string, pass: string, metadata?: Record<string, any>) { 
    loading.value = true;
    try {
      await axios.post(
        `${BASE_URL}/auth/sign-up`,
        { email, password: pass, name: metadata?.name },
        { withCredentials: true }
      );

      // Backend sets grn_access_token cookie, now fetch full user profile
      await init();

      return {
        user: session.value?.user || null,
        session: session.value
      };
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message;

      if (status === 409) {
        throw new Error("Este email já está cadastrado.");
      }
      else if (status === 422) {
        throw new Error(message || "Dados inválidos. Verifique e tente novamente.");
      }
      else if (status === 400) {
        throw new Error(message || "Preencha todos os campos obrigatórios.");
      } else if (status === 429) {
        throw new Error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        throw new Error(message || "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      loading.value = false;
    }
  }

  async function signInWithGoogleCredential(credential: string): Promise<GoogleLoginResponse> {
    loading.value = true;
    try {
      const { data } = await axios.post<GoogleLoginResponse>(`${BASE_URL}/auth/google`,
        { idToken: credential },
        { withCredentials: true });

      await afterAuthSuccess(data.user, "google");
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function signInWithEmail(email: string, password: string) {
    loading.value = true;
    try {
      await axios.post(
        `${BASE_URL}/auth/sign-in`,
        { email, password },
        { withCredentials: true }
      );

      // Backend sets grn_access_token cookie, now fetch full user profile
      await afterAuthSuccess();
      
      return session.value;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401 || status === 404) {
        throw new Error("Email ou senha incorretos.");
      } else if (status === 403) {
        throw new Error("Usuário inativo. Entre em contato com o suporte.");
      } else if (status === 429) {
        throw new Error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        throw new Error(message || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      loading.value = false;
    }
  }

  async function updatePassword(newPassword: string) {
  }

  /**
   * Atualiza as quadras filiadas do usuário no estado pinia
   * @param quadras Array de quadras filiadas
   */
  function updateQuadrasFiliadas(quadras: any[]) {
    if (session.value && session.value.user) {
      session.value.user.quadrasFiliadas = quadras || [];
    }
  }

  async function signOut() {
    await axios.post(`${BASE_URL}/auth/sign-out`, {}, { withCredentials: true });
    session.value = null;
    isReady.value = true;
  }

  return {
    init,
    ensureReady,
    session,
    user,
    safeUser,
    isAuthenticated,
    isGoogleUser,
    needsGoogleSyncPrompt,
    googleSyncSuggestion,
    loading,
    signInWithGoogleCredential,
    signInWithEmail,
    signOut,
    updatePassword,
    signUpNewUser,
    updateQuadrasFiliadas,
  };
});
