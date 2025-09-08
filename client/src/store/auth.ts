// stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabaseClient } from "@/lib/supabaseAuth";

type SessionT = Awaited<ReturnType<typeof supabaseClient.auth.getSession>>["data"]["session"];
type UserT = NonNullable<SessionT>["user"];

export const useAuthStore = defineStore("auth", () => {
  const session = ref<SessionT>(null);
  const loading = ref(true);
  // Controla inicialização única e permite aguardar readiness
  let initPromise: Promise<void> | null = null;
  let listenerBound = false;

  const user = computed<UserT | null>(() => session.value?.user ?? null);
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
          console.log("[auth] event:", event);
          session.value = newSession;
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
  }

  return {
    session,
    user,
    isAuthenticated,
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
