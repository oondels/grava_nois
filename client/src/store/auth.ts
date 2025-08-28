import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseClient } from "@/lib/supabaseAuth";

type MePayload = {
  user: { id: string; email: string; app_metadata?: Record<string, any> }
  profile?: Record<string, any> | null
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:2512'

export interface User {
  id: string
  email: string
  name: string
}

//TODO: Trazer configurações de login do supabase para aqui
export const useAuthStore = defineStore('auth', () => {
  const user = ref<MePayload['user'] | null>(null)
  const profile = ref<MePayload['profile']>(null)
  const loading = ref(false)
  const ready = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    await refreshMe()
    ready.value = true
  }

  async function refreshMe() {
    try {
      const r = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      if (!r.ok) {
        user.value = null
        profile.value = null
        return
      }
      const data: MePayload = await r.json()
      user.value = data.user
      profile.value = data.profile ?? null
    } catch {
      user.value = null
      profile.value = null
    } 
  }

  const signInWithGoogleRedirect = async (loadingAuth: any) => {
    try {
      loadingAuth = true;
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/lances-gravanois`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;

    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Falha no login");
    } finally {
      loadingAuth = false;
    }
  };

  async function signUpEmail(loadingAuth: any) {
    try {
      loadingAuth.value = true;

      const { data, error } = await supabaseClient.auth.signUp({
        email: loadingAuth.email,
        password: loadingAuth.password,
        options: {
          emailRedirectTo: `${window.location.origin}/lances-gravanois`,
        },
      });

      if (error) throw error;
    } catch (e) {
      console.error("Deu erro: ", e);
      alert(e instanceof Error ? e.message : "Falha no login");
    } finally {
      loadingAuth.value = false;
    }
  }

  return {
    user: computed(() => user.value), profile, ready,
    loading: computed(() => loading.value),
    init, refreshMe,
    isAuthenticated,
    signInWithGoogleRedirect,
    signUpEmail
  }
})