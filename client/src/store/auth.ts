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
  const safeUser = computed(() =>
    user.value
      ? { id: user.value.id, email: user.value.email, name: user.value.user_metadata?.full_name, avatar_url: user.value.user_metadata?.avatar_url }
      : null
  )
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

  // Register New User
  async function signUpNewUser(email: string, pass: string, metadata?: Record<string, any>) {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: pass,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (error) {

      const msg = error.message?.toLowerCase() ?? ''
      if (msg.includes('anonymous sign-ins')) {
        throw new Error('Preencha todos os campos!.')
      }
    }

    return data
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

  //! Verificar redirecionamento apos login
  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email, password,
    })

    if (error) {
      const msg = error.message?.toLowerCase() ?? ''
      if (msg.includes('email not confirmed')) {
        throw new Error('Confirme seu e-mail antes de entrar. Você pode reenviar o link.')
      }
      if (msg.includes('invalid login credentials')) {
        // Could be wrong creds OR a Google-only account without a password set
        throw new Error('Credenciais inválidas.')
      }
    }

    // Ensure the UI is immediately in sync even if onAuthStateChange hasn't fired yet
    session.value = data.session
    return data.user
  }

  //! TODO: em manutencao
  // Rquest para torca de senha
  async function sendReset(email: string) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) throw error
  }

  //! TODO: em manutencao
  // Troca de senha
  async function updatePassword(newPassword: string) {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword })
    if (error) throw error
    // pronto: próximo login por email+senha funcionará
  }

  // (once, keep your listener to track future changes)
  supabaseClient.auth.onAuthStateChange((event, newSession) => {
    // optional: instrument for debugging:
    console.log('[auth] event:', event)
    session.value = newSession
  })

  async function signOut() {
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
  }

  return {
    session, user, isAuthenticated, loading, init,
    signInWithGoogle, signInWithEmail, signOut, sendReset, updatePassword, signUpNewUser
  }
})