import { defineStore } from 'pinia'
import { supabaseClient } from '@/lib/supabaseAuth'

type SafeUser = { id: string; email: string; name?: string | null; avatar_url?: string | null }

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null as SafeUser | null, loading: true }),
  getters: { isAuthenticated: (s) => !!s.user },
  actions: {
    async init() {
      this.loading = true
      try {
        const { data: { session } } = await supabaseClient.auth.getSession()
        const u = session?.user || null
        this.user = u
          ? { id: u.id, email: u.email ?? '', name: u.user_metadata?.full_name ?? null, avatar_url: u.user_metadata?.avatar_url ?? null }
          : null
        // mantém sincronizado
        supabaseClient.auth.onAuthStateChange((_evt: any, sess: any) => {
          const uu = sess?.user || null
          this.user = uu
            ? { id: uu.id, email: uu.email ?? '', name: uu.user_metadata?.full_name ?? null, avatar_url: uu.user_metadata?.avatar_url ?? null }
            : null
        })
      } finally { this.loading = false }
    },

    async signInWithGoogle(next = '/lances-gravanois') {
      localStorage.setItem('post_auth_next', next)
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) throw error
      // redireciona automaticamente para o Google (data.url)
      if (data?.url) window.location.href = data.url
    },

    async signInWithEmail(email: string, password: string) {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
      if (error) throw error
      await this.init()
    },

    async signUpNewUser(email: string, pass: string, metadata?: Record<string, any>) {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password: pass,
        options: { data: metadata, emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error
      // supabaseClient enviará o email; após confirmar, o callback cairá no /auth/callback
    },

    async signOut() {
      await supabaseClient.auth.signOut()
      this.user = null
    },
  },
})
