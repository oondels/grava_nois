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
      }
      : null
  );

  async function init() {
    isCheckingUser.value = true;

    try {
      const { data } = await axios.get(`${BASE_URL}/auth/me`, { withCredentials: true });
      const user = data.foundedUser;

      session.value = {
        user: {
          email: user.email,
          name: user.name,
          username: user.username,
          emailVerified: user.emailVerified,
          role: user.role,
          avatarUrl: user.avatarUrl,
          id: user.id,
        },
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
  }

  async function signInWithGoogleCredential(credential: string): Promise<GoogleLoginResponse> {
    loading.value = true;
    try {
      const { data } = await axios.post<GoogleLoginResponse>(`${BASE_URL}/auth/google`,
        { idToken: credential },
        { withCredentials: true });

      session.value = {
        user: data.user,
        loggedAt: new Date().toISOString(),
        provider: 'google'
      }

      isReady.value = true;
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function signInWithEmail(email: string, password: string) {
  }

  async function updatePassword(newPassword: string) {
  }

  async function signOut() {
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
  };
});
