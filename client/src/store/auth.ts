import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  email: string
  name: string
  isDemoMode: boolean
}

//TODO: Trazer configurações de login do supabase para aqui
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isDemoMode = computed(() => user.value?.isDemoMode ?? false)

  const login = async (email: string, password: string): Promise<boolean> => {
    loading.value = true
    
    try {
      // Simular delay de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication - qualquer email/senha funciona
      user.value = {
        id: '1',
        email,
        name: email.split('@')[0],
        isDemoMode: false
      }
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = (): void => {
    user.value = null
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    isDemoMode,
    login,
    logout
  }
})