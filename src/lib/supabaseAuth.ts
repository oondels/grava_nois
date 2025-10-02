import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    storage: localStorage, // ou sessionStorage
    storageKey: "grn-auth",
    autoRefreshToken: true,
    // Evitamos o auto-exchange no callback para prevenir corrida
    // com o fluxo manual em AuthCallback.vue
    detectSessionInUrl: false,
  },
});
