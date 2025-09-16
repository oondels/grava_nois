// stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabaseClient } from "@/lib/supabaseAuth";
import axios from "axios";
import { BASE_URL } from "@/config/ip";

type SessionT = Awaited<ReturnType<typeof supabaseClient.auth.getSession>>["data"]["session"];
type UserT = NonNullable<SessionT>["user"];

export const useAuthStore = defineStore("auth", () => {
  const session = ref<SessionT>(null);
  const loading = ref(true);
  // Controla inicialização única e permite aguardar readiness
  let initPromise: Promise<void> | null = null;
  let listenerBound = false;

  const user = computed<UserT | null>(() => session.value?.user ?? null);
  const isGoogleUser = computed(() => {
    const u = user.value as any;
    const byAppMeta = u?.app_metadata?.provider === "google";
    const byIdentities = Array.isArray(u?.identities)
      ? u.identities.some((i: any) => i?.provider === "google")
      : false;
    return Boolean(byAppMeta || byIdentities);
  });

  // Sinalização para sugerir sincronização de dados do Google -> Perfil
  type SyncSuggestion = {
    name?: { current: string | null | undefined; google: string | null | undefined };
    avatar_url?: { current: string | null | undefined; google: string | null | undefined };
  } | null;
  const needsGoogleSyncPrompt = ref(false);
  const googleSyncSuggestion = ref<SyncSuggestion>(null);

  function computeSyncSuggestion(profile: any, supaUser: any): SyncSuggestion {
    const gName = supaUser?.user_metadata?.full_name ?? null;
    const gAvatar = supaUser?.user_metadata?.avatar_url ?? null;
    const pName = profile?.name ?? null;
    const pAvatar = profile?.avatar_url ?? null;

    const suggestion: any = {};
    if ((gName && !pName) || (gName && pName && gName !== pName)) {
      suggestion.name = { current: pName, google: gName };
    }
    if ((gAvatar && !pAvatar) || (gAvatar && pAvatar && gAvatar !== pAvatar)) {
      suggestion.avatar_url = { current: pAvatar, google: gAvatar };
    }
    return Object.keys(suggestion).length ? suggestion : null;
  }

  function markGoogleSyncDismissed(userId?: string) {
    const id = userId || user.value?.id;
    if (!id) return;
    try {
      localStorage.setItem(`grn-google-sync-dismissed:${id}`, "1");
    } catch {}
  }

  function wasGoogleSyncDismissed(userId?: string) {
    const id = userId || user.value?.id;
    if (!id) return false;
    try {
      return localStorage.getItem(`grn-google-sync-dismissed:${id}`) === "1";
    } catch {
      return false;
    }
  }
  const safeUser = computed(() =>
    user.value
      ? {
        id: user.value.id,
        email: user.value.email,
        name: user.value.user_metadata?.full_name,
        avatar_url: user.value.user_metadata?.avatar_url,
      }
      : null
  );

  async function init() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        const {
          data: { session: s },
          error,
        } = await supabaseClient.auth.getSession();
        if (error) console.error("getSession error", error);
        session.value = s;
      } finally {
        loading.value = false;
      }

      // Mantém o Pinia em sincronia com o Supabase (registra apenas uma vez)
      if (!listenerBound) {
        supabaseClient.auth.onAuthStateChange((event, newSession) => {
          // console.log("[auth] event:", event);
          session.value = newSession;

          // Após login, buscar dados do usuário e persistir no localStorage
          if (event === "SIGNED_IN" && newSession?.user?.id) {
            const userId = newSession.user.id;
            (async () => {
              try {
                console.log('buscando dados do usuário...');

                const res = await axios.get(`${BASE_URL}/users/${userId}`);
                const userPayload = res.data?.user ?? res.data ?? null;
                if (userPayload) {
                  // Detecta se este login foi via Google
                  const loggedInWithGoogle =
                    newSession?.user?.app_metadata?.provider === "google" ||
                    (Array.isArray(newSession?.user?.identities)
                      ? newSession.user.identities.some((i: any) => i?.provider === "google")
                      : false);

                  if (loggedInWithGoogle) {
                    // Preenche campos faltantes com dados do Google
                    userPayload.name = userPayload.name || newSession.user.user_metadata?.full_name;
                    userPayload.avatar_url = userPayload.avatar_url || newSession.user.user_metadata?.avatar_url;

                    // Calcula sugestão de sincronização se houver divergências
                    if (!wasGoogleSyncDismissed(userId)) {
                      const suggestion = computeSyncSuggestion(userPayload, newSession.user);
                      googleSyncSuggestion.value = suggestion;
                      needsGoogleSyncPrompt.value = Boolean(suggestion);
                    }
                  } else {
                    // Limpa qualquer sugestão remanescente para outros provedores
                    googleSyncSuggestion.value = null;
                    needsGoogleSyncPrompt.value = false;
                  }

                  localStorage.setItem("grn-user", JSON.stringify(userPayload));
                }
                console.log('...dados do usuário carregados');
                
              } catch (err) {
                console.error("Erro ao buscar dados do usuário:", err);
              }
            })();
          }
        });
        listenerBound = true;
      }
    })();

    return initPromise;
  }

  // Permite que outras partes aguardem readiness sem duplicar init
  async function ensureReady() {
    return init();
  }

  const isAuthenticated = computed(() => !!session.value);

  // Register New User
  async function signUpNewUser(email: string, pass: string, metadata?: Record<string, any>) {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: pass,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("anonymous sign-ins")) {
        throw new Error("Preencha todos os campos!.");
      }
    }

    return data;
  }

  async function signInWithGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw error;
  }

  //! Verificar redirecionamento apos login
  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("email not confirmed")) {
        throw new Error("Confirme seu e-mail antes de entrar. Você pode reenviar o link.");
      }
      if (msg.includes("invalid login credentials")) {
        // Could be wrong creds OR a Google-only account without a password set
        throw new Error("Credenciais inválidas.");
      }
    }

    // Ensure the UI is immediately in sync even if onAuthStateChange hasn't fired yet
    session.value = data.session;
    return data.user;
  }

  //! TODO: em manutencao
  // Rquest para torca de senha
  async function sendReset(email: string) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
  }

  //! TODO: em manutencao
  // Troca de senha
  async function updatePassword(newPassword: string) {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) throw error;
    // pronto: próximo login por email+senha funcionará
  }

  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    // Reset prompt state on sign out
    googleSyncSuggestion.value = null;
    needsGoogleSyncPrompt.value = false;
  }

  return {
    session,
    user,
    safeUser,
    isAuthenticated,
    isGoogleUser,
    needsGoogleSyncPrompt,
    googleSyncSuggestion,
    markGoogleSyncDismissed,
    loading,
    init,
    ensureReady,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    sendReset,
    updatePassword,
    signUpNewUser,
  };
});
