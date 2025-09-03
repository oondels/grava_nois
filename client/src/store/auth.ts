// stores/auth.ts (frontend, server-first)
import { defineStore } from 'pinia'

type SafeUser = { id: string; email: string; name?: string | null; avatar_url?: string | null }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as SafeUser | null,
    loading: true,
  }),

  getters: {
    isAuthenticated: (s) => !!s.user,
  },

  actions: {
    async init() {
      // carrega o usuário a partir dos cookies HttpOnly da API
      this.loading = true
      try {
        const r = await fetch(`${import.meta.env.VITE_API_BASE}/auth/me`, {
          credentials: 'include',
        })
        if (!r.ok) {
          this.user = null
        } else {
          const { user } = await r.json()
          this.user = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          }
        }
      } finally {
        this.loading = false

        console.log("User data:", this.user);
      }
    },

    // Inicia o fluxo Google no SERVIDOR (redirecionamento hard, fora do SPA)
    signInWithGoogle() {
      const next = '/lances-gravanois'
      const api = import.meta.env.VITE_API_BASE
      window.location.href = `${api}/auth/login/google?next=${encodeURIComponent(next)}`
    },

    // Login por email/senha no SERVIDOR
    async signInWithEmail(email: string, password: string) {
      const r = await fetch(`${import.meta.env.VITE_API_BASE}/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (!r.ok) {
        const { error } = await r.json().catch(() => ({ error: 'login_failed' }))
        throw new Error(error || 'login_failed')
      }
      // Após sign-in, recarrega o estado do usuário
      await this.init()
    },

    // Registro no SERVIDOR (com emailRedirectTo -> /auth/callback configurado no backend)
    async signUpNewUser(email: string, pass: string, metadata?: Record<string, any>) {
      const r = await fetch(`${import.meta.env.VITE_API_BASE}/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password: pass, metadata }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        throw new Error((data as any)?.error || 'signup_failed')
      }
      return data // ex.: { status: "check_email" }
    },

    async sendReset(email: string) {
      // se você expôs rota própria de reset no backend:
      const r = await fetch(`${import.meta.env.VITE_API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      if (!r.ok) throw new Error('reset_failed')
    },

    async updatePassword(newPassword: string) {
      // idem: rota no backend que chama supabase.auth.updateUser
      const r = await fetch(`${import.meta.env.VITE_API_BASE}/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      })
      if (!r.ok) throw new Error('update_password_failed')
    },

    async signOut() {
      const r = await fetch(`${import.meta.env.VITE_API_BASE}/sign-out`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!r.ok) throw new Error('logout_failed')
      this.user = null
    },
  },
})
