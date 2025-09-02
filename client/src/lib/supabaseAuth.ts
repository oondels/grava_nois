import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      storage: localStorage,           // ou sessionStorage
      storageKey: 'grn-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)