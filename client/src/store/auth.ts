// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseClient } from '@/lib/supabaseAuth'

type SessionT = Awaited<ReturnType<typeof supabaseClient.auth.getSession>>['data']['session']
type UserT = NonNullable<SessionT>['user']

export const useAuthStore = defineStore('auth', () => {
  const session = ref<SessionT>(null)
  const loading = ref(true)

  const user = computed<UserT | null>(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => !!session.value)

  async function init() {
    // 1) pick up existing session from storage or URL (PKCE)
    const { data: { session: s }, error } = await supabaseClient.auth.getSession()
    if (error) console.error('getSession error', error)
    session.value = s
    loading.value = false

    // 2) keep Pinia in sync with Supabase
    supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
    })
  }

  async function signInWithGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/lances-gravanois`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
  }

  return { session, user, isAuthenticated, loading, init, signInWithGoogle, signOut }
})
