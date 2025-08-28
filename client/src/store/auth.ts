import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name: string
  isDemoMode: boolean
}

import { supabaseClient } from "@/lib/supabaseAuth";

//TODO: Trazer configurações de login do supabase para aqui
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  const signInWithGoogleRedirect = async (loadingAuth: any) => {
  try {
    loadingAuth.value = true;
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
    loadingAuth.value = false;
  }
};  

  const login = async (email: string, password: string) => {
  }

  const logout = (): void => {
    
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    login,
    logout
  }
})